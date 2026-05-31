/* global process */
// /api/admin.js
// Single dispatcher for admin-only operations. Keeps us under Vercel's 12-fn
// limit while still allowing one-click refunds, manual premium grants, and
// future admin actions without adding more endpoints.
//
// All requests require:
//   Authorization: Bearer <supabase access_token>
//   Body: { action: 'refund' | 'sync-subscription' | ..., ...action-specific fields }
//
// Auth model: the bearer-token user must equal ADMIN_EMAIL.

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { addToBrevoList, checkBrevoConnection, getBrevoConfig, upsertBrevoContact } from './_lib/brevo.js'

const ADMIN_EMAIL = 'clint.viegas@gmail.com'

function getBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization || ''
  const match = String(header).match(/^Bearer\s+(.+)$/i)
  return match?.[1] || ''
}

function getBody(req) {
  if (!req.body) return {}
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body) } catch { return {} }
  }
  return req.body
}

const PLAN_BY_PRICE = {
  [process.env.STRIPE_PRICE_WEEKLY    || '']: 'weekly',
  [process.env.STRIPE_PRICE_MONTHLY   || '']: 'monthly',
  [process.env.STRIPE_PRICE_ANNUAL    || '']: 'annual',
  [process.env.STRIPE_PRICE_QUARTERLY || '']: 'annual',
}

const PLAN_ALIASES = {
  quarterly: 'annual',
}

function normalizePlanSlug(plan) {
  const cleanPlan = String(plan || '').trim().toLowerCase()
  if (cleanPlan === 'weekly' || cleanPlan === 'monthly' || cleanPlan === 'annual') return cleanPlan
  return PLAN_ALIASES[cleanPlan] || ''
}

function stripeTimeToIso(seconds) {
  return seconds ? new Date(seconds * 1000).toISOString() : null
}

function subscriptionToProfilePatch(sub, fallbackPlan) {
  const item = sub.items?.data?.[0]
  const priceId = item?.price?.id
  const plan = PLAN_BY_PRICE[priceId] || normalizePlanSlug(sub.metadata?.plan) || normalizePlanSlug(fallbackPlan) || 'premium'

  let status = sub.status
  if (sub.status === 'canceled') status = 'canceled'
  else if (sub.status === 'trialing') status = 'trialing'
  else if (sub.status === 'unpaid') status = 'expired'
  else if (sub.status === 'incomplete') status = 'incomplete'
  else if (sub.status === 'past_due') status = 'past_due'
  else status = 'active'

  const periodStart = stripeTimeToIso(sub.current_period_start || item?.current_period_start)
  const periodEnd = stripeTimeToIso(sub.current_period_end || item?.current_period_end)
  const stillPremium = status === 'active' || status === 'trialing' || status === 'past_due'

  return {
    is_premium: stillPremium,
    subscription_status: status,
    current_plan: stillPremium ? plan : 'free',
    stripe_subscription_id: sub.id,
    cancel_at_period_end: !!sub.cancel_at_period_end,
    current_period_start: periodStart,
    current_period_end: periodEnd,
    premium_expires_at: periodEnd,
    premium_source: `stripe:${plan}`,
  }
}

async function findProfileForPayment(supabase, payment, { customerId, subscriptionId }) {
  if (payment?.user_id) {
    const { data } = await supabase.from('profiles').select('*').eq('id', payment.user_id).maybeSingle()
    if (data) return data
  }
  if (subscriptionId) {
    const { data } = await supabase.from('profiles').select('*').eq('stripe_subscription_id', subscriptionId).maybeSingle()
    if (data) return data
  }
  if (customerId) {
    const { data } = await supabase.from('profiles').select('*').eq('stripe_customer_id', customerId).maybeSingle()
    if (data) return data
  }
  if (payment?.email) {
    const { data } = await supabase.from('profiles').select('*').eq('email', payment.email).maybeSingle()
    if (data) return data
  }
  return null
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const supaUrl    = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supaUrl || !serviceKey) return res.status(500).json({ error: 'Server not configured' })

  const supabase = createClient(supaUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // Auth: verify bearer token and that the user is the admin.
  const token = getBearerToken(req)
  if (!token) return res.status(401).json({ error: 'Missing auth token' })
  const { data: authData, error: authError } = await supabase.auth.getUser(token)
  if (authError || !authData?.user) return res.status(401).json({ error: 'Invalid session' })
  if ((authData.user.email || '').toLowerCase() !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Admin only' })
  }

  const body = getBody(req)
  const action = String(body.action || '').trim()

  switch (action) {
    case 'refund': {
      // Issues a full refund on a Stripe payment. Stripe sends charge.refunded
      // → stripe-webhook downgrades the user + sends refund_processed email.
      const stripeSecret = process.env.STRIPE_SECRET_KEY
      if (!stripeSecret) return res.status(500).json({ error: 'Stripe not configured' })
      const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' })

      const { payment_intent_id, charge_id, reason } = body
      const sessionId = String(body.stripe_session_id || '').trim()

      // Resolve a payment_intent / charge to refund. Subscription renewals only
      // store the invoice id (in_…) on the payment row, so fall back to looking
      // it up from the invoice or the original Checkout Session.
      let resolvedPaymentIntent = payment_intent_id || null
      let resolvedCharge = charge_id || null

      try {
        if (!resolvedPaymentIntent && !resolvedCharge && sessionId) {
          if (sessionId.startsWith('in_')) {
            const invoice = await stripe.invoices.retrieve(sessionId)
            resolvedPaymentIntent = typeof invoice.payment_intent === 'string'
              ? invoice.payment_intent
              : invoice.payment_intent?.id || null
            if (!resolvedPaymentIntent) {
              resolvedCharge = typeof invoice.charge === 'string'
                ? invoice.charge
                : invoice.charge?.id || null
            }
          } else if (sessionId.startsWith('cs_')) {
            const checkout = await stripe.checkout.sessions.retrieve(sessionId)
            resolvedPaymentIntent = typeof checkout.payment_intent === 'string'
              ? checkout.payment_intent
              : checkout.payment_intent?.id || null
          } else if (sessionId.startsWith('pi_')) {
            resolvedPaymentIntent = sessionId
          } else if (sessionId.startsWith('ch_')) {
            resolvedCharge = sessionId
          }
        }
      } catch (lookupErr) {
        console.error('[admin/refund] lookup error:', lookupErr?.message || lookupErr)
        return res.status(400).json({ error: `Could not resolve a charge to refund: ${lookupErr?.message || lookupErr}` })
      }

      if (!resolvedPaymentIntent && !resolvedCharge) {
        return res.status(400).json({ error: 'Need payment_intent_id or charge_id' })
      }

      try {
        // Load the underlying charge + its balance transaction so we know the
        // exact, non-refundable Stripe processing fee. Stripe does NOT return
        // the original fee on a refund, so we deduct it from what we send back
        // to the customer to keep the platform whole.
        let charge = null
        if (resolvedCharge) {
          charge = await stripe.charges.retrieve(resolvedCharge, { expand: ['balance_transaction'] })
        } else {
          const pi = await stripe.paymentIntents.retrieve(resolvedPaymentIntent, {
            expand: ['latest_charge.balance_transaction'],
          })
          charge = typeof pi.latest_charge === 'object' ? pi.latest_charge : null
          if (!charge && pi.latest_charge) {
            charge = await stripe.charges.retrieve(pi.latest_charge, { expand: ['balance_transaction'] })
          }
        }
        if (!charge) return res.status(400).json({ error: 'Could not load the charge to refund' })
        if (!resolvedCharge) resolvedCharge = charge.id
        if (!resolvedPaymentIntent) {
          resolvedPaymentIntent = typeof charge.payment_intent === 'string'
            ? charge.payment_intent
            : charge.payment_intent?.id || null
        }

        const bt = typeof charge.balance_transaction === 'object' ? charge.balance_transaction : null
        const stripeFee = Math.max(0, bt?.fee || 0)
        const alreadyRefunded = charge.amount_refunded || 0
        const refundable = Math.max(0, charge.amount - alreadyRefunded)
        // Deduct the fee from the refundable balance; never go below zero.
        const refundAmount = Math.max(0, refundable - stripeFee)

        if (refundAmount <= 0) {
          return res.status(400).json({
            error: `Nothing to refund after the $${(stripeFee / 100).toFixed(2)} processing fee (refundable was $${(refundable / 100).toFixed(2)}).`,
          })
        }

        const refund = await stripe.refunds.create({
          ...(resolvedPaymentIntent ? { payment_intent: resolvedPaymentIntent } : { charge: resolvedCharge }),
          amount: refundAmount,
          reason: reason || 'requested_by_customer',
          metadata: {
            issued_by: authData.user.email,
            source: 'admin_panel',
            kind: 'cancellation_refund',
            gross_cents: String(charge.amount),
            fee_cents: String(stripeFee),
          },
        })

        // Revoke premium + mark the payment refunded immediately. A fee-deducted
        // refund is technically a *partial* refund (charge.refunded stays false),
        // so we can't rely on the webhook's full-refund check alone.
        const customerId = typeof charge.customer === 'string' ? charge.customer : charge.customer?.id || null
        try {
          if (resolvedPaymentIntent) {
            await supabase.from('payments').update({ status: 'refunded' }).eq('stripe_payment_intent_id', resolvedPaymentIntent)
          }
          let profile = null
          if (customerId) {
            const { data } = await supabase.from('profiles').select('id').eq('stripe_customer_id', customerId).maybeSingle()
            profile = data || null
          }
          if (!profile && charge.billing_details?.email) {
            const { data } = await supabase.from('profiles').select('id').eq('email', charge.billing_details.email).maybeSingle()
            profile = data || null
          }
          if (profile) {
            await supabase.from('profiles').update({
              is_premium: false,
              subscription_status: 'refunded',
              current_plan: 'free',
              premium_source: 'refund',
              premium_expires_at: new Date().toISOString(),
              cancel_at_period_end: true,
            }).eq('id', profile.id)
          }
        } catch (revokeErr) {
          console.error('[admin/refund] revoke error:', revokeErr?.message || revokeErr)
        }

        return res.status(200).json({
          ok: true,
          refund_id: refund.id,
          amount: refund.amount,
          currency: refund.currency,
          status: refund.status,
          gross_cents: charge.amount,
          fee_cents: stripeFee,
          net_refunded_cents: refundAmount,
        })
      } catch (err) {
        console.error('[admin/refund] stripe error:', err?.message || err)
        return res.status(400).json({ error: err?.message || 'Refund failed' })
      }
    }

    case 'sync-subscription': {
      const stripeSecret = process.env.STRIPE_SECRET_KEY
      if (!stripeSecret) return res.status(500).json({ error: 'Stripe not configured' })
      const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' })

      const paymentId = String(body.payment_id || '').trim()
      const sessionId = String(body.stripe_session_id || '').trim()
      if (!paymentId && !sessionId) return res.status(400).json({ error: 'Need payment_id or stripe_session_id' })

      let query = supabase.from('payments').select('*').eq('status', 'paid').limit(1)
      query = paymentId ? query.eq('id', paymentId) : query.eq('stripe_session_id', sessionId)
      const { data: paymentRows, error: paymentErr } = await query
      if (paymentErr) return res.status(500).json({ error: paymentErr.message })
      const payment = paymentRows?.[0]
      if (!payment) return res.status(404).json({ error: 'Paid payment row not found' })
      if (!payment.stripe_session_id?.startsWith('cs_')) {
        return res.status(400).json({ error: 'This repair needs an original Stripe Checkout Session row.' })
      }

      try {
        const checkout = await stripe.checkout.sessions.retrieve(payment.stripe_session_id, {
          expand: ['subscription'],
        })
        if (checkout.mode !== 'subscription') return res.status(400).json({ error: 'Checkout Session is not a subscription' })

        let sub = checkout.subscription
        if (!sub) return res.status(400).json({ error: 'Checkout Session has no subscription' })
        if (typeof sub === 'string') sub = await stripe.subscriptions.retrieve(sub)

        const customerId = typeof checkout.customer === 'string' ? checkout.customer : checkout.customer?.id || null
        const patch = subscriptionToProfilePatch(sub, payment.plan || checkout.metadata?.plan)
        const profile = await findProfileForPayment(supabase, payment, { customerId, subscriptionId: sub.id })
        if (!profile) return res.status(404).json({ error: `Profile not found for ${payment.email}` })

        const grantedAt = payment.created_at || new Date().toISOString()
        const { data: updated, error: updateErr } = await supabase
          .from('profiles')
          .update({
            ...patch,
            stripe_customer_id: customerId || payment.stripe_customer_id || profile.stripe_customer_id,
            premium_granted_at: grantedAt,
            last_payment_at: payment.created_at || new Date().toISOString(),
          })
          .eq('id', profile.id)
          .select('id, email, is_premium, current_plan, subscription_status, premium_source, premium_expires_at, stripe_customer_id, stripe_subscription_id')
          .maybeSingle()
        if (updateErr) return res.status(500).json({ error: updateErr.message })

        await supabase.from('payments').update({
          plan: patch.current_plan === 'free' ? payment.plan : patch.current_plan,
          stripe_customer_id: customerId || payment.stripe_customer_id,
        }).eq('id', payment.id).then(({ error }) => {
          if (error) console.error('[admin/sync-subscription] payment update error:', error.message)
        })

        await supabase.from('subscription_events').insert({
          user_id: profile.id,
          email: profile.email,
          event_type: 'admin.subscription_synced',
          prev_status: profile.subscription_status,
          new_status: patch.subscription_status,
          plan: patch.current_plan,
          amount_cents: payment.amount_cents,
          currency: payment.currency,
          cancel_at_period_end: patch.cancel_at_period_end,
          current_period_end: patch.current_period_end,
          stripe_subscription_id: sub.id,
          stripe_customer_id: customerId,
          metadata: {
            issued_by: authData.user.email,
            payment_id: payment.id,
            stripe_session_id: payment.stripe_session_id,
            source: 'admin_panel',
          },
        }).then(({ error }) => {
          if (error) console.error('[admin/sync-subscription] subscription event insert error:', error.message)
        })

        return res.status(200).json({ ok: true, profile: updated })
      } catch (err) {
        console.error('[admin/sync-subscription] error:', err?.message || err)
        return res.status(400).json({ error: err?.message || 'Subscription sync failed' })
      }
    }

    case 'deploy': {
      // Trigger a fresh Vercel deploy via Deploy Hook so newly published
      // blog posts get their per-slug pre-rendered HTML (prerender-seo.mjs
      // pulls from Supabase at build time).
      const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL
      if (!hookUrl) {
        return res.status(500).json({ error: 'VERCEL_DEPLOY_HOOK_URL not set in Vercel env vars.' })
      }
      try {
        const r = await fetch(hookUrl, { method: 'POST' })
        const body = await r.json().catch(() => ({}))
        if (!r.ok) {
          console.error('[admin/deploy] hook returned', r.status, body)
          return res.status(502).json({ error: `Deploy hook responded ${r.status}` })
        }
        return res.status(200).json({
          ok: true,
          job_id: body?.job?.id || null,
          state: body?.job?.state || 'PENDING',
        })
      } catch (err) {
        console.error('[admin/deploy] error:', err?.message || err)
        return res.status(500).json({ error: err?.message || 'Deploy hook failed' })
      }
    }

    case 'brevo-status': {
      const result = await checkBrevoConnection()
      return res.status(result.ok ? 200 : 500).json(result)
    }

    case 'brevo-test-contact': {
      const email = String(body.email || authData.user.email || '').trim().toLowerCase()
      if (!email) return res.status(400).json({ error: 'email_required' })

      const name = String(body.name || 'CELPIPACE Test').trim()
      const [firstName, ...lastParts] = name.split(/\s+/)
      const config = getBrevoConfig()
      const listKey = String(body.list || 'users')
      const listId = config.lists[listKey] || config.lists.users

      const upsert = await upsertBrevoContact({
        email,
        firstName,
        lastName: lastParts.join(' '),
        emailBlacklisted: false,
      })
      if (!upsert.ok) return res.status(502).json(upsert)

      const listed = listId ? await addToBrevoList({ email, listId }) : { ok: false, error: 'brevo_list_not_configured' }
      return res.status(listed.ok ? 200 : 207).json({ ok: upsert.ok && listed.ok, upsert, listed, listId })
    }

    default:
      return res.status(400).json({ error: `Unknown action: ${action || '(empty)'}` })
  }
}
