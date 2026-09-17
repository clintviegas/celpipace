// /api/cancel-subscription.js
// Schedules the signed-in user's Stripe subscription to stop renewing.
//
// If the user ticks "request a refund review" and they are inside the
// money-back window for their plan (see AUTO_REFUND_DAYS in _lib/refunds.js),
// the refund is issued on the spot: money back minus Stripe's fee, subscription
// cancelled immediately, premium revoked. Outside the window — or if the
// refund call fails for any reason — it falls back to the manual review queue
// exactly as before, so nothing is ever silently dropped.

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, renderCancelScheduled, renderCancellationFeedbackNotice } from './_lib/email.js'
import { evaluateAutoRefund, issueRefund } from './_lib/refunds.js'
import { checkRateLimit } from './_lib/rateLimit.js'

const SUPPORT_EMAIL = process.env.CONTACT_TO_EMAIL || 'hello@celpipace.ca'

function getBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization || ''
  const match = String(header).match(/^Bearer\s+(.+)$/i)
  return match?.[1] || ''
}

function toIso(seconds) {
  return seconds ? new Date(seconds * 1000).toISOString() : null
}

function getBody(req) {
  if (!req.body) return {}
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body) } catch { return {} }
  }
  return req.body
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const secret = process.env.STRIPE_SECRET_KEY
  const supaUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!secret || !supaUrl || !svcKey) {
    return res.status(500).json({ error: 'Server not configured' })
  }

  const supabase = createClient(supaUrl, svcKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const token = getBearerToken(req)
  if (!token) return res.status(401).json({ error: 'Missing authorization' })

  const { data: authData, error: authError } = await supabase.auth.getUser(token)
  if (authError || !authData?.user) return res.status(401).json({ error: 'Invalid session' })

  const body = getBody(req)
  const requestedUserId = body?.userId
  const userId = authData.user.id
  if (requestedUserId && requestedUserId !== userId) {
    return res.status(403).json({ error: 'Cannot cancel another user subscription' })
  }

  // Rate limit: 5 cancel attempts per 10 minutes per user
  const rl = await checkRateLimit({ supabase, scope: 'cancel', key: userId, limit: 5, windowSec: 600 })
  if (!rl.ok) return res.status(429).json({ error: 'too_many_requests', message: rl.message })

  const reason       = typeof body?.reason === 'string' ? body.reason.slice(0, 80) : null
  const freeText     = typeof body?.feedback === 'string' ? body.feedback.slice(0, 2000) : null
  const wouldReturn  = typeof body?.wouldReturn === 'boolean' ? body.wouldReturn : null
  const refundReview = body?.refundReview === true

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('stripe_customer_id, stripe_subscription_id, current_period_end, email, current_plan')
    .eq('id', userId)
    .maybeSingle()

  if (profileError) return res.status(500).json({ error: profileError.message })
  if (!profile?.stripe_subscription_id && !profile?.stripe_customer_id) {
    return res.status(404).json({ error: 'no_subscription', message: 'No active Stripe subscription was found for this account.' })
  }

  const stripe = new Stripe(secret, { apiVersion: '2024-06-20' })

  try {
    let subscriptionId = profile.stripe_subscription_id
    if (!subscriptionId && profile.stripe_customer_id) {
      const subscriptions = await stripe.subscriptions.list({ customer: profile.stripe_customer_id, status: 'all', limit: 10 })
      subscriptionId = subscriptions.data.find(sub => ['active', 'trialing', 'past_due'].includes(sub.status))?.id
    }

    if (!subscriptionId) {
      return res.status(404).json({ error: 'no_active_subscription', message: 'No active subscription was found to cancel.' })
    }

    const cancelDetails = reason
      ? { comment: freeText || undefined, feedback: mapReasonToStripeFeedback(reason) }
      : undefined

    // ── Auto-refund decision ───────────────────────────────────────────────
    // Evaluated before we touch Stripe so a refund (which cancels immediately)
    // and a scheduled cancel (period end) never both run on the same request.
    let autoRefund = { issued: false, reason: 'not_requested' }
    if (refundReview) {
      const verdict = await evaluateAutoRefund({ supabase, userId, plan: profile.current_plan })
      if (verdict.eligible) {
        try {
          const r = await issueRefund({
            stripe, supabase,
            paymentIntentId: verdict.payment.stripe_payment_intent_id || null,
            sessionId:       verdict.payment.stripe_session_id || null,
            subscriptionId,
            reason:          'requested_by_customer',
            issuedBy:        `user:${userId}`,
            source:          'self_serve_auto',
          })
          autoRefund = { issued: true, reason: verdict.reason, windowDays: verdict.windowDays, ...r, paymentId: verdict.payment.id }
        } catch (err) {
          // Money didn't move. Fall through to the manual queue and say why.
          console.error('[cancel-subscription] auto-refund failed:', err?.message || err)
          autoRefund = { issued: false, reason: `refund_failed:${err?.code || 'error'}`, error: err?.message || String(err), windowDays: verdict.windowDays }
        }
      } else {
        autoRefund = { issued: false, reason: verdict.reason, windowDays: verdict.windowDays, ageDays: verdict.ageDays }
      }
    }

    let periodEnd = profile.current_period_end || null
    if (autoRefund.issued) {
      // issueRefund() already cancelled the subscription in Stripe and revoked
      // premium; access ended now, not at period end.
      periodEnd = new Date().toISOString()
    } else {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
        ...(cancelDetails ? { cancellation_details: cancelDetails } : {}),
      })

      periodEnd = toIso(subscription.current_period_end) || profile.current_period_end || null
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({
          cancel_at_period_end: true,
          subscription_status: subscription.status === 'past_due' ? 'past_due' : 'active',
          current_period_end: periodEnd,
          premium_expires_at: periodEnd,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
      if (updateErr) {
        console.error('[cancel-subscription] profile update error:', updateErr.message)
        return res.status(500).json({ error: 'Failed to update subscription state', details: updateErr.message })
      }
    }

    let feedbackInserted = false
    if (reason) {
      // Idempotency: if the same user submitted cancellation feedback in the
      // last 60s, skip the duplicate insert. Stripe's subscription update is
      // already idempotent (cancel_at_period_end=true is a no-op the 2nd time).
      const sinceIso = new Date(Date.now() - 60_000).toISOString()
      const { data: recent } = await supabase
        .from('cancellation_feedback')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', sinceIso)
        .limit(1)
      if (!recent || recent.length === 0) {
        const { error: fbErr } = await supabase.from('cancellation_feedback').insert({
          user_id:                userId,
          email:                  profile.email,
          reason,
          free_text:              freeText,
          would_return:           wouldReturn,
          plan_at_cancel:         profile.current_plan || null,
          stripe_subscription_id: subscriptionId,
          current_period_end:     periodEnd,
        })
        if (fbErr) console.error('[cancel-subscription] cancellation_feedback insert error:', fbErr.message)
        else feedbackInserted = true
      }
    }

    const { error: evErr } = await supabase.from('subscription_events').insert({
      user_id:                userId,
      email:                  profile.email,
      event_type:             autoRefund.issued ? 'refund.auto_issued' : 'user.cancel_requested',
      new_status:             autoRefund.issued ? 'refunded' : 'active',
      plan:                   profile.current_plan || null,
      amount_cents:           autoRefund.issued ? autoRefund.netCents : null,
      currency:               autoRefund.issued ? autoRefund.currency : null,
      cancel_at_period_end:   !autoRefund.issued,
      current_period_end:     periodEnd,
      stripe_subscription_id: subscriptionId,
      stripe_customer_id:     profile.stripe_customer_id,
      reason,
      metadata: {
        free_text: freeText, would_return: wouldReturn, refund_review_requested: refundReview,
        source: 'self_serve_cancel_endpoint',
        auto_refund: autoRefund,
      },
    })
    if (evErr) console.error('[cancel-subscription] subscription_events insert error:', evErr.message)

    // IMPORTANT: must await these sendEmail calls. On Vercel serverless,
    // returning the response triggers container teardown — any in-flight
    // fire-and-forget promise gets killed before Brevo is reached, leaving
    // the email_log row stuck at status='queued' forever.
    if (reason && feedbackInserted && SUPPORT_EMAIL) {
      const { subject, html } = renderCancellationFeedbackNotice({
        name: authData.user.user_metadata?.full_name || null,
        email: profile.email,
        userId,
        plan: profile.current_plan,
        periodEnd,
        reason,
        feedback: freeText,
        wouldReturn,
        refundReview,
        autoRefund,
        stripeSubscriptionId: subscriptionId,
      })
      try {
        await sendEmail({
          supabase,
          userId,
          toEmail: SUPPORT_EMAIL,
          kind: 'cancellation_feedback_admin',
          subject,
          html,
          metadata: { reason, refund_review_requested: refundReview, stripe_subscription_id: subscriptionId },
        })
      } catch (err) {
        console.error('[cancel-subscription] support feedback email error:', err?.message || err)
      }
    }

    // When auto-refunded, charge.refunded → refund_processed email covers the
    // customer; a "your access continues until…" email would be wrong.
    if (profile.email && !autoRefund.issued) {
      const { subject, html } = renderCancelScheduled({
        name:      authData.user.user_metadata?.full_name || null,
        plan:      profile.current_plan,
        periodEnd,
      })
      try {
        await sendEmail({
          supabase,
          userId,
          toEmail:  profile.email,
          kind:     'cancel_scheduled',
          subject,
          html,
          metadata: { reason, would_return: wouldReturn, refund_review_requested: refundReview, stripe_subscription_id: subscriptionId },
        })
      } catch (err) {
        console.error('[cancel-subscription] sendEmail error:', err?.message || err)
      }
    }

    if (autoRefund.issued) {
      const amt = `${(autoRefund.netCents / 100).toFixed(2)} ${String(autoRefund.currency || 'usd').toUpperCase()}`
      return res.status(200).json({
        success: true,
        refunded: true,
        refundNetCents: autoRefund.netCents,
        refundFeeCents: autoRefund.feeCents,
        currentPeriodEnd: periodEnd,
        message: `Your subscription is cancelled and ${amt} has been refunded to your original payment method (Stripe's processing fee is non-refundable). It usually appears within 3-4 business days.`,
      })
    }

    const refundMessage = refundReview
      ? ' Your refund review request was sent to support. Approved refunds usually appear within 3-4 business days.'
      : ''

    return res.status(200).json({
      success: true,
      refunded: false,
      currentPeriodEnd: periodEnd,
      message: periodEnd
        ? `Cancellation scheduled. Your Premium access remains active until ${new Date(periodEnd).toLocaleDateString('en-CA')}.${refundMessage}`
        : `Cancellation scheduled. Your Premium access remains active until the end of the paid billing period.${refundMessage}`,
    })
  } catch (err) {
    console.error('[cancel-subscription] error:', err)
    return res.status(500).json({ error: err.message || 'Stripe cancellation failed' })
  }
}

// Stripe expects one of these enum values on cancellation_details.feedback.
// Anything else we treat as 'other' and keep the human-readable label in our DB.
const STRIPE_FEEDBACK_VALUES = new Set([
  'too_expensive', 'missing_features', 'switched_service', 'unused', 'customer_service',
  'too_complex', 'low_quality', 'other',
])
function mapReasonToStripeFeedback(reason) {
  return STRIPE_FEEDBACK_VALUES.has(reason) ? reason : 'other'
}