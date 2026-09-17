/* global process */
// /api/_lib/job-worker.js
// Drains the webhook_events inbox. Registered as ?job=worker in api/cron.js
// and ticked every minute by pg_cron.
//
// Contract per event:
//   1. claim atomically (lease held, attempts incremented)
//   2. run each side effect exactly once via runEffect()
//   3. mark done, or schedule a retry with backoff, or bury after 6 attempts
//
// Every handler RE-READS current state from Stripe and from profiles rather
// than trusting the stored payload. A replayed event can be days old — during
// the 2026-07-27 incident the stored checkout event described a customer who
// had since been refunded — so the payload is treated as a pointer to what
// changed, not as the truth about what is currently true.

import Stripe from 'stripe'
import { claimEvents, markDone, markFailed } from './inbox.js'
import { runEffect } from './effects.js'
import { subscriptionToProfilePatch, findProfile, invoiceSubscriptionId } from './billing.js'
import { tryDb } from './db.js'
import { markPaymentRefunded } from './refunds.js'
import { captureError, captureMessage } from './observability.js'
import { enqueueJob, drainOutbox } from './outbox.js'

// Small batch: Hobby functions have a short wall clock and pg_cron ticks every
// minute, so throughput comes from frequency rather than batch size.
const BATCH_SIZE = 8
const LEASE_SECONDS = 120

function iso() { return new Date().toISOString() }

// ── Handlers ────────────────────────────────────────────────────────────────
// Each receives { event, payload, supabase, stripe, eventId } and is expected
// to be safely re-runnable.

async function handleCheckoutCompleted(ctx) {
  const { payload: s, supabase, stripe, eventId } = ctx
  if (s.mode !== 'subscription') return { ignored: 'not_subscription' }

  const customerId = typeof s.customer === 'string' ? s.customer : s.customer?.id || null
  const subId      = typeof s.subscription === 'string' ? s.subscription : s.subscription?.id || null
  if (!subId || !customerId) return { ignored: 'missing_ids' }

  const email  = s.customer_details?.email || s.customer_email || s.metadata?.email || null
  const userId = s.metadata?.user_id || s.client_reference_id || null

  // Live read — the subscription may have changed since this event was emitted.
  const sub     = await stripe.subscriptions.retrieve(subId)
  const patch   = subscriptionToProfilePatch(sub)
  const profile = await findProfile(supabase, { userId, subscriptionId: subId, customerId, email })
  if (!profile) return flagProfileMiss(ctx, { userId, email, customerId, subId })

  await runEffect(supabase, eventId, 'profile_patch', async () => {
    const { error } = await supabase.from('profiles').update({
      ...patch,
      stripe_customer_id: customerId,
      premium_granted_at: profile.premium_granted_at || iso(),
      last_payment_at:    iso(),
    }).eq('id', profile.id)
    if (error) throw new Error(`profile_update: ${error.message}`)
    return { status: patch.subscription_status }
  })

  await runEffect(supabase, eventId, 'payment_upsert', async () => {
    // Subscription-mode sessions never carry a payment_intent themselves — it
    // lives on the first invoice. Resolve it now so a later refund (from the
    // admin panel, the auto-refund path, or the Stripe dashboard) can find
    // this row by PI instead of failing silently.
    let paymentIntentId = typeof s.payment_intent === 'string' ? s.payment_intent : s.payment_intent?.id || null
    const firstInvoiceId = typeof s.invoice === 'string' ? s.invoice : s.invoice?.id || null
    if (!paymentIntentId && firstInvoiceId) {
      try {
        const inv = await stripe.invoices.retrieve(firstInvoiceId)
        paymentIntentId = typeof inv.payment_intent === 'string' ? inv.payment_intent : inv.payment_intent?.id || null
      } catch (e) {
        console.error('[worker] checkout invoice lookup failed:', e?.message)
      }
    }
    const { error } = await supabase.from('payments').upsert({
      user_id:                  profile.id,
      email,
      plan:                     patch.current_plan,
      amount_cents:             s.amount_total ?? 0,
      currency:                 (s.currency || 'usd').toLowerCase(),
      status:                   'paid',
      stripe_session_id:        s.id,
      stripe_payment_intent_id: paymentIntentId,
      stripe_customer_id:       customerId,
      granted_days:             null,
    }, { onConflict: 'stripe_session_id' })
    if (error) throw new Error(`payment_upsert: ${error.message}`)
    return { session: s.id }
  })

  await runEffect(supabase, eventId, 'checkout_intent_converted', () =>
    tryDb(
      supabase.from('checkout_intents').update({ converted_at: iso() }).eq('stripe_session_id', s.id),
      'checkout_intents.converted'
    ))

  await runEffect(supabase, eventId, 'sub_event_log', () =>
    logSubEvent(ctx, {
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
    }))

  // Only welcome someone who is actually premium right now. A replayed old
  // event must not congratulate a customer who has since refunded.
  if (email && patch.is_premium && !profile.is_premium) {
    await runEffect(supabase, eventId, 'email:welcome', () =>
      enqueueJob(supabase, {
        kind: 'email',
        dedupeKey: `welcome:${profile.id}`,
        payload: {
          template: 'welcome',
          userId:   profile.id,
          toEmail:  email,
          name:     profile.full_name,
          plan:     patch.current_plan,
          metadata: { stripe_session_id: s.id },
        },
      }))

    await runEffect(supabase, eventId, 'brevo_sync', () =>
      enqueueJob(supabase, {
        kind: 'brevo_premium',
        dedupeKey: `brevo_premium:${profile.id}:${subId}`,
        payload: { email, fullName: profile.full_name },
      }))
  }

  return { profile: profile.id, status: patch.subscription_status }
}

async function handleSubscriptionUpsert(ctx) {
  const { payload: sub, supabase, eventId, event } = ctx
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id
  const profile = await findProfile(supabase, {
    userId:         sub.metadata?.user_id || null,
    subscriptionId: sub.id,
    customerId,
    email:          sub.metadata?.email || null,
  })
  if (!profile) return flagProfileMiss(ctx, { event: event.event_type, customerId, subId: sub.id })

  const patch = subscriptionToProfilePatch(sub)

  await runEffect(supabase, eventId, 'profile_patch', async () => {
    const { error } = await supabase.from('profiles').update({
      ...patch,
      stripe_customer_id: customerId || profile.stripe_customer_id,
    }).eq('id', profile.id)
    if (error) throw new Error(`profile_update: ${error.message}`)
    return { status: patch.subscription_status }
  })

  await runEffect(supabase, eventId, 'sub_event_log', () =>
    logSubEvent(ctx, {
      user_id:                profile.id,
      email:                  profile.email,
      prev_status:            profile.subscription_status,
      new_status:             patch.subscription_status,
      plan:                   patch.current_plan,
      cancel_at_period_end:   patch.cancel_at_period_end,
      current_period_end:     patch.current_period_end,
      stripe_subscription_id: sub.id,
      stripe_customer_id:     customerId,
      metadata:               { previous_attributes: ctx.event.payload?.data?.previous_attributes || {} },
    }))

  return { profile: profile.id, status: patch.subscription_status }
}

async function handleSubscriptionDeleted(ctx) {
  const { payload: sub, supabase, eventId } = ctx
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id
  const profile = await findProfile(supabase, { subscriptionId: sub.id, customerId })
  if (!profile) return flagProfileMiss(ctx, { event: 'customer.subscription.deleted', customerId, subId: sub.id })

  await runEffect(supabase, eventId, 'profile_patch', async () => {
    const { error } = await supabase.from('profiles').update({
      is_premium:           false,
      subscription_status:  'expired',
      current_plan:         'free',
      cancel_at_period_end: false,
      // stripe_customer_id is kept so a resubscribe reuses the same identity.
    }).eq('id', profile.id)
    if (error) throw new Error(`profile_update: ${error.message}`)
    return { status: 'expired' }
  })

  await runEffect(supabase, eventId, 'sub_event_log', () =>
    logSubEvent(ctx, {
      user_id:                profile.id,
      email:                  profile.email,
      prev_status:            profile.subscription_status,
      new_status:             'expired',
      plan:                   profile.current_plan,
      stripe_subscription_id: sub.id,
      stripe_customer_id:     customerId,
      reason:                 sub.cancellation_details?.reason || null,
      metadata:               { cancellation_details: sub.cancellation_details || {} },
    }))

  if (profile.email) {
    await runEffect(supabase, eventId, 'email:cancel_final', () =>
      enqueueJob(supabase, {
        kind: 'email',
        dedupeKey: `cancel_final:${profile.id}:${sub.id}`,
        payload: {
          template: 'cancel_final',
          userId:   profile.id,
          toEmail:  profile.email,
          name:     profile.full_name,
          metadata: { stripe_subscription_id: sub.id },
        },
      }))

    await runEffect(supabase, eventId, 'brevo_sync', () =>
      enqueueJob(supabase, {
        kind: 'brevo_cancelled',
        dedupeKey: `brevo_cancelled:${profile.id}:${sub.id}`,
        payload: { email: profile.email },
      }))
  }

  return { profile: profile.id, status: 'expired' }
}

async function handleInvoicePaid(ctx) {
  const { payload: inv, supabase, stripe, eventId } = ctx
  const subId = invoiceSubscriptionId(inv)
  if (!subId) return { ignored: 'no_subscription' }
  const customerId = typeof inv.customer === 'string' ? inv.customer : inv.customer?.id

  const sub     = await stripe.subscriptions.retrieve(subId)
  const patch   = subscriptionToProfilePatch(sub)
  const profile = await findProfile(supabase, { subscriptionId: subId, customerId })
  if (!profile) return flagProfileMiss(ctx, { event: 'invoice.paid', customerId, subId })

  await runEffect(supabase, eventId, 'profile_patch', async () => {
    const { error } = await supabase.from('profiles')
      .update({ ...patch, last_payment_at: iso() })
      .eq('id', profile.id)
    if (error) throw new Error(`profile_update: ${error.message}`)
    return { status: patch.subscription_status }
  })

  await runEffect(supabase, eventId, 'payment_upsert', async () => {
    const { error } = await supabase.from('payments').upsert({
      user_id:            profile.id,
      email:              profile.email,
      plan:               patch.current_plan,
      amount_cents:       inv.amount_paid ?? 0,
      currency:           (inv.currency || 'usd').toLowerCase(),
      status:             'paid',
      stripe_session_id:  inv.id, // this column doubles as the invoice idempotency key
      stripe_payment_intent_id: typeof inv.payment_intent === 'string' ? inv.payment_intent : inv.payment_intent?.id || null,
      stripe_customer_id: customerId,
      granted_days:       null,
    }, { onConflict: 'stripe_session_id' })
    if (error) throw new Error(`payment_upsert: ${error.message}`)
    return { invoice: inv.id }
  })

  await runEffect(supabase, eventId, 'sub_event_log', () =>
    logSubEvent(ctx, {
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
      metadata: {
        hosted_invoice_url: inv.hosted_invoice_url || null,
        invoice_pdf:        inv.invoice_pdf || null,
        invoice_number:     inv.number || null,
      },
    }))

  if (profile.email) {
    await runEffect(supabase, eventId, 'email:receipt', () =>
      enqueueJob(supabase, {
        kind: 'email',
        dedupeKey: `receipt:${inv.id}`,
        payload: {
          template:         'receipt',
          userId:           profile.id,
          toEmail:          profile.email,
          name:             profile.full_name,
          plan:             patch.current_plan,
          amountCents:      inv.amount_paid ?? 0,
          currency:         (inv.currency || 'usd').toLowerCase(),
          invoiceNumber:    inv.number || null,
          invoicePdfUrl:    inv.invoice_pdf || null,
          hostedInvoiceUrl: inv.hosted_invoice_url || null,
          periodEnd:        patch.current_period_end,
          metadata:         { stripe_invoice_id: inv.id },
        },
      }))
  }

  return { profile: profile.id, invoice: inv.id }
}

async function handleInvoiceFailed(ctx) {
  const { payload: inv, supabase, eventId } = ctx
  const customerId = typeof inv.customer === 'string' ? inv.customer : inv.customer?.id
  const subId = invoiceSubscriptionId(inv)
  const profile = await findProfile(supabase, { subscriptionId: subId, customerId })
  if (!profile) return flagProfileMiss(ctx, { event: 'invoice.payment_failed', customerId, subId })

  await runEffect(supabase, eventId, 'profile_patch', async () => {
    const { error } = await supabase.from('profiles')
      .update({ subscription_status: 'past_due' })
      .eq('id', profile.id)
    if (error) throw new Error(`profile_update: ${error.message}`)
    return { status: 'past_due' }
  })

  await runEffect(supabase, eventId, 'sub_event_log', () =>
    logSubEvent(ctx, {
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
      metadata: { attempt_count: inv.attempt_count, next_payment_attempt: inv.next_payment_attempt },
    }))

  if (profile.email) {
    await runEffect(supabase, eventId, 'email:past_due', () =>
      enqueueJob(supabase, {
        kind: 'email',
        dedupeKey: `past_due:${inv.id}`,
        payload: {
          template:         'past_due',
          userId:           profile.id,
          toEmail:          profile.email,
          name:             profile.full_name,
          amountCents:      inv.amount_due ?? 0,
          currency:         (inv.currency || 'usd').toLowerCase(),
          hostedInvoiceUrl: inv.hosted_invoice_url || null,
          metadata:         { stripe_invoice_id: inv.id, attempt_count: inv.attempt_count },
        },
      }))
  }

  return { profile: profile.id, status: 'past_due' }
}

async function handleChargeRefunded(ctx) {
  const { payload: c, supabase, stripe, eventId } = ctx
  const pi = typeof c.payment_intent === 'string' ? c.payment_intent : c.payment_intent?.id
  const customerId = typeof c.customer === 'string' ? c.customer : c.customer?.id

  // Match on every id we might hold. Subscription-mode checkouts and invoice
  // renewals never carried a payment_intent on the object we stored, so the
  // old PI-only match silently found nothing and refunded payments stayed
  // 'paid' — which overstated revenue and undercounted "Refunded total".
  const invoiceId = typeof c.invoice === 'string' ? c.invoice : c.invoice?.id || null
  await runEffect(supabase, eventId, 'payment_mark_refunded', () =>
    markPaymentRefunded(supabase, { paymentIntentId: pi, chargeId: c.id, invoiceId }))

  // An admin-issued cancellation refund deducts the Stripe fee, so it is
  // *partial* (c.refunded stays false) but must still end access. Identify it
  // by the metadata the admin panel stamps on the refund.
  let adminRefund = (c.refunds?.data || []).find(r => r?.metadata?.source === 'admin_panel') || null
  if (!adminRefund) {
    try {
      const list = await stripe.refunds.list({ charge: c.id, limit: 1 })
      if (list.data?.[0]?.metadata?.source === 'admin_panel') adminRefund = list.data[0]
    } catch (e) {
      console.error('[worker] refund list error:', e?.message)
    }
  }

  const shouldRevoke = c.refunded || !!adminRefund
  const feeCents     = adminRefund ? Number(adminRefund.metadata?.fee_cents || 0) : 0
  const grossCents   = adminRefund ? Number(adminRefund.metadata?.gross_cents || c.amount || 0) : (c.amount || 0)
  const profile      = customerId ? await findProfile(supabase, { customerId }) : null

  if (profile && shouldRevoke) {
    await runEffect(supabase, eventId, 'profile_revoke', async () => {
      const { error } = await supabase.from('profiles').update({
        is_premium:           false,
        subscription_status:  'refunded',
        current_plan:         'free',
        premium_source:       'refund',
        premium_expires_at:   iso(),
        cancel_at_period_end: true,
      }).eq('id', profile.id)
      if (error) throw new Error(`profile_update: ${error.message}`)
      return { status: 'refunded' }
    })
  }

  await runEffect(supabase, eventId, 'sub_event_log', () =>
    logSubEvent(ctx, {
      user_id:            profile?.id || null,
      email:              profile?.email || null,
      new_status:         'refunded',
      amount_cents:       c.amount_refunded ?? 0,
      currency:           (c.currency || 'usd').toLowerCase(),
      stripe_customer_id: customerId,
      metadata: { payment_intent: pi, charge_id: c.id, fee_cents: feeCents, admin_refund: !!adminRefund },
    }))

  if (profile?.email) {
    await runEffect(supabase, eventId, 'email:refund', () =>
      enqueueJob(supabase, {
        kind: 'email',
        dedupeKey: `refund:${c.id}`,
        payload: {
          template:    'refund_processed',
          userId:      profile.id,
          toEmail:     profile.email,
          name:        profile.full_name,
          amountCents: c.amount_refunded ?? 0,
          currency:    (c.currency || 'usd').toLowerCase(),
          isPartial:   !shouldRevoke,
          grossCents:  adminRefund ? grossCents : null,
          feeCents:    adminRefund ? feeCents : null,
          metadata:    { charge_id: c.id, payment_intent: pi },
        },
      }))
  }

  return { profile: profile?.id || null, revoked: shouldRevoke }
}

// ── Shared bits ─────────────────────────────────────────────────────────────

function logSubEvent(ctx, row) {
  return tryDb(
    ctx.supabase.from('subscription_events').insert({
      stripe_event_id: ctx.eventId,
      event_type:      ctx.event.event_type,
      ...row,
    }),
    'subscription_events.insert'
  )
}

// We genuinely have no profile for this Stripe customer. Retrying will not
// conjure one, so record it and let the event settle as done — but make it
// loud, because it usually means a checkout bypassed signup.
//
// The DB note is threaded back through the return value rather than written
// here directly: processClaimedEvent() always calls markDone() right after
// the handler returns, and markDone() used to unconditionally null out
// processing_error, silently erasing whatever we wrote in this function a
// moment earlier. Handing the note to markDone() instead makes it the single
// writer of that column, so there's nothing left to race.
async function flagProfileMiss(ctx, lookup) {
  const msg = `profile_not_found: ${JSON.stringify(lookup)}`
  captureMessage(msg, { job: 'worker', event_type: ctx.event.event_type, stripe_event_id: ctx.eventId })
  return { profileMiss: true, lookup, note: msg }
}

const HANDLERS = {
  'checkout.session.completed':    handleCheckoutCompleted,
  'customer.subscription.created': handleSubscriptionUpsert,
  'customer.subscription.updated': handleSubscriptionUpsert,
  'customer.subscription.deleted': handleSubscriptionDeleted,
  'invoice.paid':                  handleInvoicePaid,
  'invoice.payment_failed':        handleInvoiceFailed,
  'charge.refunded':               handleChargeRefunded,
}

/**
 * Run one already-claimed event to completion and settle it.
 *
 * Shared by the batch worker and by the webhook's inline best-effort pass, so
 * there is exactly one implementation of "process this event" no matter who
 * drives it.
 *
 * @returns {Promise<{ outcome: 'done'|'retry'|'dead', ...}>}
 */
export async function processClaimedEvent({ event, supabase, stripe }) {
  const eventId = event.stripe_event_id
  const payload = event.payload?.data?.object
  const fn = HANDLERS[event.event_type]

  try {
    if (!fn) {
      await markDone(supabase, eventId)
      return { eventId, type: event.event_type, outcome: 'done', note: 'no_handler' }
    }
    if (!payload) throw new Error('malformed_payload: data.object missing')

    const result = await fn({ event, payload, supabase, stripe, eventId })
    await markDone(supabase, eventId, result?.note ?? null)
    return { eventId, type: event.event_type, outcome: 'done', ...result }
  } catch (err) {
    const { dead, attempts } = await markFailed(supabase, event, err)
    captureError(err, {
      job: 'worker',
      event_type: event.event_type,
      stripe_event_id: eventId,
      attempts,
      dead,
    }, dead ? 'fatal' : 'warning')
    return { eventId, type: event.event_type, outcome: dead ? 'dead' : 'retry', error: err.message }
  }
}

// ── Entry point ─────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  const stripeKey   = process.env.STRIPE_SECRET_KEY
  if (!supabaseUrl || !serviceKey || !stripeKey) {
    return res.status(500).json({ error: 'Worker not configured' })
  }

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' })

  const limit = Math.min(Number(req.query?.limit) || BATCH_SIZE, 25)
  const summary = { claimed: 0, done: 0, retried: 0, dead: 0, results: [] }

  let events = []
  try {
    events = await claimEvents(supabase, { limit, leaseSeconds: LEASE_SECONDS })
  } catch (err) {
    captureError(err, { job: 'worker', phase: 'claim' })
    return res.status(500).json({ error: 'claim_failed', message: err.message })
  }
  summary.claimed = events.length

  for (const event of events) {
    const result = await processClaimedEvent({ event, supabase, stripe })
    if      (result.outcome === 'done') summary.done++
    else if (result.outcome === 'dead') summary.dead++
    else                                summary.retried++
    summary.results.push(result)
  }

  // Same tick drains queued email/CRM work, so a single cron entry covers both.
  try {
    summary.outbox = await drainOutbox(supabase, { limit: 10 })
  } catch (err) {
    captureError(err, { job: 'worker', phase: 'outbox' })
    summary.outbox = { error: err.message }
  }

  return res.status(200).json({ ok: true, ...summary })
}
