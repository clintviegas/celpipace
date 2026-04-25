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
//   charge.refunded                     → mark payment refunded
//
// Env required:
//   STRIPE_SECRET_KEY
//   STRIPE_WEBHOOK_SECRET
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

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
  [process.env.STRIPE_PRICE_QUARTERLY || '']: 'quarterly',
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
          console.warn('[stripe-webhook] no profile match for checkout.session.completed', { userId, email, customerId })
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
        await supabase.from('payments').upsert({
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

        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub        = event.data.object
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id
        const userId     = sub.metadata?.user_id || null
        const email      = sub.metadata?.email || null
        const profile    = await findProfile(supabase, { userId, customerId, subscriptionId: sub.id, email })
        if (!profile) break

        const patch = subscriptionToProfilePatch(sub)
        await supabase.from('profiles').update({
          ...patch,
          stripe_customer_id: customerId || profile.stripe_customer_id,
        }).eq('id', profile.id)
        break
      }

      // Final cancellation — Stripe sends this only when the period actually ends.
      case 'customer.subscription.deleted': {
        const sub        = event.data.object
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id
        const profile    = await findProfile(supabase, { customerId, subscriptionId: sub.id })
        if (!profile) break

        await supabase.from('profiles').update({
          is_premium:             false,
          subscription_status:    'expired',
          current_plan:           'free',
          cancel_at_period_end:   false,
          // Keep stripe_customer_id so they can resubscribe with same Stripe identity
        }).eq('id', profile.id)
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
        if (!profile) break

        const patch = subscriptionToProfilePatch(sub)
        await supabase.from('profiles').update({
          ...patch,
          last_payment_at: new Date().toISOString(),
        }).eq('id', profile.id)

        // Audit row
        await supabase.from('payments').upsert({
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
        break
      }

      case 'invoice.payment_failed': {
        const inv = event.data.object
        const customerId = typeof inv.customer === 'string' ? inv.customer : inv.customer?.id
        const subId = typeof inv.subscription === 'string' ? inv.subscription : inv.subscription?.id
        const profile = await findProfile(supabase, { customerId, subscriptionId: subId })
        if (!profile) break
        await supabase.from('profiles').update({ subscription_status: 'past_due' }).eq('id', profile.id)
        break
      }

      case 'charge.refunded': {
        const c = event.data.object
        const pi = typeof c.payment_intent === 'string' ? c.payment_intent : c.payment_intent?.id
        if (pi) {
          await supabase.from('payments').update({ status: 'refunded' }).eq('stripe_payment_intent_id', pi)
        }
        break
      }

      default:
        break
    }

    // Backstop: sweep any stale rows whose period has elapsed but webhook
    // didn't (e.g. delivery delay).
    await supabase.rpc('expire_premium_users').catch(() => {})

    return res.status(200).json({ received: true })
  } catch (err) {
    console.error('[stripe-webhook] handler error:', err)
    return res.status(500).json({ error: err.message || 'Handler error' })
  }
}
