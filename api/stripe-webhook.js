// /api/stripe-webhook.js
// Stripe webhook receiver — drives ALL premium state changes.
// Frontend NEVER writes is_premium/subscription_status; only this handler does
// (via service role) so the system can't be bypassed from the browser.
//
// Events handled:
//   checkout.session.completed          → first activation, store customer_id + sub_id
//   customer.subscription.created       → safety duplicate of above
//   customer.subscription.updated       → renewals, cancel-at-period-end toggle, status changes
//   customer.subscription.deleted       → final cancellation → mark expired
//   invoice.paid                        → renewal extends premium_expires_at
//   invoice.payment_failed              → flag past_due
//   charge.refunded                     → mark payment refunded and revoke premium on full refund
//
// Env required:
//   STRIPE_SECRET_KEY
//   STRIPE_WEBHOOK_SECRET
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, renderWelcome, renderReceipt, renderCancelFinal, renderPastDue } from './_lib/email.js'
import { upsertBrevoContact, addToBrevoList } from './_lib/brevo.js'

export const config = { api: { bodyParser: false } }

async function readRawBody(req) {
  return await new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end',  () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

// Map Stripe price IDs back to our plan slugs so we don't have to query Stripe.
const PLAN_BY_PRICE = {
  [process.env.STRIPE_PRICE_WEEKLY    || '']: 'weekly',
  [process.env.STRIPE_PRICE_MONTHLY   || '']: 'monthly',
  [process.env.STRIPE_PRICE_ANNUAL    || '']: 'annual',
  [process.env.STRIPE_PRICE_QUARTERLY || '']: 'annual',
}

// Find a profile row from any of: user_id metadata, customer_id, sub_id, email.
async function findProfile(supabase, { userId, customerId, subscriptionId, email }) {
  if (userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
    if (data) return data
  }
  if (customerId) {
    const { data } = await supabase.from('profiles').select('*').eq('stripe_customer_id', customerId).maybeSingle()
    if (data) return data
  }
  if (subscriptionId) {
    const { data } = await supabase.from('profiles').select('*').eq('stripe_subscription_id', subscriptionId).maybeSingle()
    if (data) return data
  }
  if (email) {
    const { data } = await supabase.from('profiles').select('*').eq('email', email).maybeSingle()
    if (data) return data
  }
  return null
}

// Convert a Stripe subscription object into the profile patch.
function subscriptionToProfilePatch(sub) {
  const item   = sub.items?.data?.[0]
  const priceId = item?.price?.id
  const plan    = PLAN_BY_PRICE[priceId] || 'premium'

  // Stripe statuses: trialing | active | past_due | canceled | unpaid | incomplete | incomplete_expired
  // Map down to our 5 simple states for the UI.
  let status = sub.status
  if (sub.status === 'canceled')         status = 'canceled'
  else if (sub.status === 'unpaid')      status = 'expired'
  else if (sub.status === 'incomplete')  status = 'incomplete'
  else if (sub.status === 'past_due')    status = 'past_due'
  else                                   status = 'active'

  // While canceled with cancel_at_period_end=true, sub.status stays 'active'
  // until the period actually ends — Stripe sends customer.subscription.deleted then.
  const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null

  // Premium remains true until the period actually ends.
  const stillPremium = status === 'active' || status === 'trialing' || status === 'past_due'

  return {
    is_premium:             stillPremium,
    subscription_status:    status,
    current_plan:           stillPremium ? plan : 'free',
    stripe_subscription_id: sub.id,
    cancel_at_period_end:   !!sub.cancel_at_period_end,
    current_period_start:   sub.current_period_start ? new Date(sub.current_period_start * 1000).toISOString() : null,
    current_period_end:     periodEnd,
    premium_expires_at:     periodEnd,
    premium_source:         `stripe:${plan}`,
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const secret        = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const supabaseUrl   = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceKey    = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!secret || !webhookSecret || !supabaseUrl || !serviceKey) {
    console.error('[stripe-webhook] missing env vars')
    return res.status(500).json({ error: 'Webhook not configured' })
  }

  const stripe = new Stripe(secret, { apiVersion: '2024-06-20' })
  const sig    = req.headers['stripe-signature']
  const raw    = await readRawBody(req)

  let event
  try {
    event = stripe.webhooks.constructEvent(raw, sig, webhookSecret)
  } catch (err) {
    console.error('[stripe-webhook] signature error:', err.message)
    return res.status(400).json({ error: `Webhook signature error: ${err.message}` })
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // Idempotency: if we've already processed this Stripe event, ack and skip.
  // Stripe retries on 5xx, so a slow handler that times out at the platform
  // level can deliver the same event twice — without this guard you'd send
  // duplicate welcome emails / receipts and double-write subscription_events.
  const { data: existing } = await supabase
    .from('webhook_events')
    .select('processed')
    .eq('stripe_event_id', event.id)
    .maybeSingle()
  if (existing?.processed) {
    return res.status(200).json({ received: true, idempotent: true })
  }

  // Archive every event we receive (idempotent on stripe_event_id) so we can
  // replay or audit later. Failures here must not block processing.
  await supabase.from('webhook_events').upsert({
    source:           'stripe',
    stripe_event_id:  event.id,
    event_type:       event.type,
    payload:          event,
    signature_valid:  true,
    processed:        false,
    received_at:      new Date().toISOString(),
  }, { onConflict: 'stripe_event_id' }).then(({ error }) => {
    if (error) console.error('[stripe-webhook] webhook_events insert error:', error.message)
  })

  // Helper — append an interpreted row to subscription_events.
  const logSubEvent = (row) =>
    supabase.from('subscription_events').insert({
      stripe_event_id: event.id,
      event_type:      event.type,
      ...row,
    }).then(({ error }) => {
      if (error) console.error('[stripe-webhook] subscription_events insert error:', error.message)
    })

  // Helper — when we can't find a profile match, mark the webhook_events row
  // as a soft-failure so it surfaces in the admin Observability tab instead
  // of silently passing through. We still 200 to Stripe (no point retrying —
  // the profile genuinely doesn't exist on our side).
  const flagProfileMiss = async (lookup) => {
    const msg = `profile_not_found: ${JSON.stringify(lookup)}`
    console.warn(`[stripe-webhook] ${msg}`)
    await supabase.from('webhook_events').update({
      processing_error: msg,
    }).eq('stripe_event_id', event.id)
  }

  try {
    switch (event.type) {
      // ── Initial purchase ────────────────────────────────────────────────
      case 'checkout.session.completed': {
        const s = event.data.object
        if (s.mode !== 'subscription') break // ignore one-time legacy

        const userId        = s.metadata?.user_id || s.client_reference_id || null
        const email         = s.customer_details?.email || s.customer_email || s.metadata?.email || null
        const customerId    = typeof s.customer === 'string' ? s.customer : s.customer?.id || null
        const subId         = typeof s.subscription === 'string' ? s.subscription : s.subscription?.id || null
        if (!subId || !customerId) break

        // Pull full subscription so we have current_period_end, items, etc.
        const sub  = await stripe.subscriptions.retrieve(subId)
        const patch = subscriptionToProfilePatch(sub)

        const profile = await findProfile(supabase, { userId, customerId, subscriptionId: subId, email })
        if (!profile) {
          await flagProfileMiss({ event: 'checkout.session.completed', userId, email, customerId, subId })
          break
        }

        const { error: profErr } = await supabase
          .from('profiles')
          .update({
            ...patch,
            stripe_customer_id: customerId,
            premium_granted_at: new Date().toISOString(),
            last_payment_at:    new Date().toISOString(),
          })
          .eq('id', profile.id)
        if (profErr) console.error('[stripe-webhook] profile update error:', profErr.message)

        // Record a payments row for revenue/audit. Idempotent on stripe_session_id.
        const { error: payErr } = await supabase.from('payments').upsert({
          user_id:                  profile.id,
          email,
          plan:                     patch.current_plan,
          amount_cents:             s.amount_total ?? 0,
          currency:                 (s.currency || 'usd').toLowerCase(),
          status:                   'paid',
          stripe_session_id:        s.id,
          stripe_payment_intent_id: typeof s.payment_intent === 'string' ? s.payment_intent : s.payment_intent?.id || null,
          stripe_customer_id:       customerId,
          granted_days:             null,
        }, { onConflict: 'stripe_session_id' })
        if (payErr) console.error('[stripe-webhook] payments upsert error (checkout):', payErr.message)

        await logSubEvent({
          user_id:                profile.id,
          email,
          prev_status:            profile.subscription_status,
          new_status:             patch.subscription_status,
          plan:                   patch.current_plan,
          amount_cents:           s.amount_total ?? 0,
          currency:               (s.currency || 'usd').toLowerCase(),
          cancel_at_period_end:   patch.cancel_at_period_end,
          current_period_end:     patch.current_period_end,
          stripe_subscription_id: subId,
          stripe_customer_id:     customerId,
          metadata:               { mode: s.mode, payment_status: s.payment_status },
        })

        // Welcome email + Brevo sync — fire-and-forget so Stripe still gets a
        // fast 200 even if Brevo / email_log is misbehaving. Failures show up
        // in email_log.status='failed' for inspection.
        if (!profile.is_premium && email) {
          const { subject, html } = renderWelcome({ name: profile.full_name, plan: patch.current_plan })
          sendEmail({ supabase, userId: profile.id, toEmail: email, kind: 'welcome', subject, html, metadata: { stripe_session_id: s.id } })
            .catch(err => console.error('[stripe-webhook] welcome email failed:', err?.message))
        }
        if (email) {
          const [fn, ...lp] = String(profile.full_name || '').trim().split(/\s+/)
          const premiumListId = process.env.BREVO_LIST_PREMIUM ? Number(process.env.BREVO_LIST_PREMIUM) : null
          upsertBrevoContact({ email, firstName: fn, lastName: lp.join(' ') })
            .catch(err => console.error('[stripe-webhook] brevo upsert failed:', err?.message))
          if (premiumListId) {
            addToBrevoList({ email, listId: premiumListId })
              .catch(err => console.error('[stripe-webhook] brevo list add failed:', err?.message))
          }
        }

        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub        = event.data.object
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id
        const userId     = sub.metadata?.user_id || null
        const email      = sub.metadata?.email || null
        const profile    = await findProfile(supabase, { userId, customerId, subscriptionId: sub.id, email })
        if (!profile) {
          await flagProfileMiss({ event: event.type, userId, email, customerId, subId: sub.id })
          break
        }

        const patch = subscriptionToProfilePatch(sub)
        await supabase.from('profiles').update({
          ...patch,
          stripe_customer_id: customerId || profile.stripe_customer_id,
        }).eq('id', profile.id)

        await logSubEvent({
          user_id:                profile.id,
          email:                  profile.email,
          prev_status:            profile.subscription_status,
          new_status:             patch.subscription_status,
          plan:                   patch.current_plan,
          cancel_at_period_end:   patch.cancel_at_period_end,
          current_period_end:     patch.current_period_end,
          stripe_subscription_id: sub.id,
          stripe_customer_id:     customerId,
          metadata:               { previous_attributes: event.data.previous_attributes || {} },
        })
        break
      }

      // Final cancellation — Stripe sends this only when the period actually ends.
      case 'customer.subscription.deleted': {
        const sub        = event.data.object
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id
        const profile    = await findProfile(supabase, { customerId, subscriptionId: sub.id })
        if (!profile) {
          await flagProfileMiss({ event: event.type, customerId, subId: sub.id })
          break
        }

        await supabase.from('profiles').update({
          is_premium:             false,
          subscription_status:    'expired',
          current_plan:           'free',
          cancel_at_period_end:   false,
          // Keep stripe_customer_id so they can resubscribe with same Stripe identity
        }).eq('id', profile.id)

        await logSubEvent({
          user_id:                profile.id,
          email:                  profile.email,
          prev_status:            profile.subscription_status,
          new_status:             'expired',
          plan:                   profile.current_plan,
          stripe_subscription_id: sub.id,
          stripe_customer_id:     customerId,
          reason:                 sub.cancellation_details?.reason || null,
          metadata:               { cancellation_details: sub.cancellation_details || {} },
        })

        if (profile.email) {
          const { subject, html } = renderCancelFinal({ name: profile.full_name })
          sendEmail({ supabase, userId: profile.id, toEmail: profile.email, kind: 'cancel_final', subject, html, metadata: { stripe_subscription_id: sub.id } })
            .catch(err => console.error('[stripe-webhook] cancel_final email failed:', err?.message))
          const cancelledListId = process.env.BREVO_LIST_CANCELLED ? Number(process.env.BREVO_LIST_CANCELLED) : null
          if (cancelledListId) {
            addToBrevoList({ email: profile.email, listId: cancelledListId })
              .catch(err => console.error('[stripe-webhook] brevo cancelled list add failed:', err?.message))
          }
        }
        break
      }

      // Renewal succeeded — refresh expiry from the parent subscription.
      case 'invoice.paid': {
        const inv = event.data.object
        const subId = typeof inv.subscription === 'string' ? inv.subscription : inv.subscription?.id
        const customerId = typeof inv.customer === 'string' ? inv.customer : inv.customer?.id
        if (!subId) break

        const sub     = await stripe.subscriptions.retrieve(subId)
        const profile = await findProfile(supabase, { customerId, subscriptionId: subId })
        if (!profile) {
          await flagProfileMiss({ event: 'invoice.paid', customerId, subId })
          break
        }

        const patch = subscriptionToProfilePatch(sub)
        await supabase.from('profiles').update({
          ...patch,
          last_payment_at: new Date().toISOString(),
        }).eq('id', profile.id)

        // Audit row
        const { error: renewPayErr } = await supabase.from('payments').upsert({
          user_id:            profile.id,
          email:              profile.email,
          plan:               patch.current_plan,
          amount_cents:       inv.amount_paid ?? 0,
          currency:           (inv.currency || 'usd').toLowerCase(),
          status:             'paid',
          stripe_session_id:  inv.id, // reuse this column for invoice idempotency
          stripe_customer_id: customerId,
          granted_days:       null,
        }, { onConflict: 'stripe_session_id' })
        if (renewPayErr) console.error('[stripe-webhook] payments upsert error (renewal):', renewPayErr.message)

        await logSubEvent({
          user_id:                profile.id,
          email:                  profile.email,
          new_status:             patch.subscription_status,
          plan:                   patch.current_plan,
          amount_cents:           inv.amount_paid ?? 0,
          currency:               (inv.currency || 'usd').toLowerCase(),
          current_period_end:     patch.current_period_end,
          stripe_subscription_id: subId,
          stripe_customer_id:     customerId,
          stripe_invoice_id:      inv.id,
          metadata:               { hosted_invoice_url: inv.hosted_invoice_url || null, invoice_pdf: inv.invoice_pdf || null, invoice_number: inv.number || null },
        })

        if (profile.email) {
          const { subject, html } = renderReceipt({
            name:             profile.full_name,
            plan:             patch.current_plan,
            amountCents:      inv.amount_paid ?? 0,
            currency:         (inv.currency || 'usd').toLowerCase(),
            invoiceNumber:    inv.number || null,
            invoicePdfUrl:    inv.invoice_pdf || null,
            hostedInvoiceUrl: inv.hosted_invoice_url || null,
            periodEnd:        patch.current_period_end,
          })
          sendEmail({
            supabase,
            userId:   profile.id,
            toEmail:  profile.email,
            kind:     'receipt',
            subject,
            html,
            pdfUrl:   inv.invoice_pdf || null,
            metadata: { stripe_invoice_id: inv.id, invoice_number: inv.number || null },
          }).catch(err => console.error('[stripe-webhook] receipt email failed:', err?.message))
        }
        break
      }

      case 'invoice.payment_failed': {
        const inv = event.data.object
        const customerId = typeof inv.customer === 'string' ? inv.customer : inv.customer?.id
        const subId = typeof inv.subscription === 'string' ? inv.subscription : inv.subscription?.id
        const profile = await findProfile(supabase, { customerId, subscriptionId: subId })
        if (!profile) {
          await flagProfileMiss({ event: 'invoice.payment_failed', customerId, subId })
          break
        }
        await supabase.from('profiles').update({ subscription_status: 'past_due' }).eq('id', profile.id)

        await logSubEvent({
          user_id:                profile.id,
          email:                  profile.email,
          prev_status:            profile.subscription_status,
          new_status:             'past_due',
          amount_cents:           inv.amount_due ?? 0,
          currency:               (inv.currency || 'usd').toLowerCase(),
          stripe_subscription_id: subId,
          stripe_customer_id:     customerId,
          stripe_invoice_id:      inv.id,
          reason:                 inv.last_finalization_error?.message || 'payment_failed',
          metadata:               { attempt_count: inv.attempt_count, next_payment_attempt: inv.next_payment_attempt },
        })

        if (profile.email) {
          const { subject, html } = renderPastDue({
            name:             profile.full_name,
            amountCents:      inv.amount_due ?? 0,
            currency:         (inv.currency || 'usd').toLowerCase(),
            hostedInvoiceUrl: inv.hosted_invoice_url || null,
          })
          sendEmail({ supabase, userId: profile.id, toEmail: profile.email, kind: 'past_due', subject, html, metadata: { stripe_invoice_id: inv.id, attempt_count: inv.attempt_count } })
            .catch(err => console.error('[stripe-webhook] past_due email failed:', err?.message))
        }
        break
      }

      case 'charge.refunded': {
        const c = event.data.object
        const pi = typeof c.payment_intent === 'string' ? c.payment_intent : c.payment_intent?.id
        const customerId = typeof c.customer === 'string' ? c.customer : c.customer?.id
        if (pi) {
          const { error: refundErr } = await supabase.from('payments').update({ status: 'refunded' }).eq('stripe_payment_intent_id', pi)
          if (refundErr) console.error('[stripe-webhook] payments refund update error:', refundErr.message)
        }
        const profile = customerId ? await findProfile(supabase, { customerId }) : null
        if (profile && c.refunded) {
          const { error: revokeErr } = await supabase.from('profiles').update({
            is_premium: false,
            subscription_status: 'refunded',
            current_plan: 'free',
            premium_source: 'refund',
            premium_expires_at: new Date().toISOString(),
            cancel_at_period_end: true,
          }).eq('id', profile.id)
          if (revokeErr) console.error('[stripe-webhook] profile refund revoke error:', revokeErr.message)
        }
        await logSubEvent({
          user_id:                profile?.id || null,
          email:                  profile?.email || null,
          new_status:             'refunded',
          amount_cents:           c.amount_refunded ?? 0,
          currency:               (c.currency || 'usd').toLowerCase(),
          stripe_customer_id:     customerId,
          metadata:               { payment_intent: pi, charge_id: c.id },
        })
        break
      }

      default:
        break
    }

    // Mark processed BEFORE any non-critical side effects so a slow sweep
    // can't cause Vercel to time the function out and trigger a Stripe retry.
    await supabase.from('webhook_events').update({
      processed:    true,
      processed_at: new Date().toISOString(),
    }).eq('stripe_event_id', event.id)

    // Backstop sweep — fire-and-forget. No await so it can't delay the response.
    supabase.rpc('expire_premium_users').then(() => {}, () => {})

    return res.status(200).json({ received: true })
  } catch (err) {
    const errMsg = String(err?.stack || err?.message || err)
    console.error('[stripe-webhook] handler error:', errMsg)
    try {
      await supabase.from('webhook_events').update({
        processed:        false,
        processing_error: errMsg.slice(0, 1000),
      }).eq('stripe_event_id', event.id)
    } catch (logErr) {
      console.error('[stripe-webhook] could not record processing_error:', logErr?.message)
    }
    // Return 200 to Stripe — the event payload is persisted in webhook_events
    // so we can replay manually. This stops Stripe's retry storm while we
    // diagnose; processing_error surfaces the real cause for debugging.
    return res.status(200).json({ received: true, soft_error: errMsg.slice(0, 200) })
  }
}
