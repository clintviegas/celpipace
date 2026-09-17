/* global process */
// /api/admin.js
// Single dispatcher for admin-only operations. Keeps us under Vercel's 12-fn
// limit while still allowing one-click refunds, manual premium grants, and
// future admin actions without adding more endpoints.
//
// Most requests require:
//   Authorization: Bearer <supabase access_token>
//   Body: { action: 'refund' | 'sync-subscription' | ..., ...action-specific fields }
//
// Auth model: the bearer-token user must equal ADMIN_EMAIL.
// Exception: action=request-password-reset is public (rate-limited, admin email only).

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { addToBrevoList, checkBrevoConnection, getBrevoConfig, upsertBrevoContact } from './_lib/brevo.js'
import { checkRateLimit } from './_lib/rateLimit.js'
import { sendEmail, renderAdminPasswordReset } from './_lib/email.js'
import { subscriptionToProfilePatch, findProfile } from './_lib/billing.js'
import { issueRefund } from './_lib/refunds.js'

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

function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for']
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim()
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown'
}

async function handleAdminPasswordReset(req, res, supabase) {
  const ip = getClientIp(req)
  const rl = await checkRateLimit({ supabase, scope: 'admin_pw_reset', key: ip, limit: 3, windowSec: 3600 })
  if (!rl.ok) {
    return res.status(429).json({ error: 'too_many_requests', message: rl.message })
  }

  const site = (process.env.PUBLIC_SITE_URL || process.env.VITE_SITE_URL || 'https://www.celpipace.ca').replace(/\/$/, '')
  const redirectTo = `${site}/admin`

  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email: ADMIN_EMAIL,
    options: { redirectTo },
  })

  if (error) {
    console.error('[admin/request-password-reset] generateLink:', error.message)
    return res.status(500).json({
      error: 'reset_failed',
      message: 'Could not create a password reset link. Contact support if this persists.',
    })
  }

  const actionLink = data?.properties?.action_link
  if (!actionLink) {
    return res.status(500).json({ error: 'reset_failed', message: 'Reset link was not generated.' })
  }

  const { data: profile } = await supabase.from('profiles').select('id').eq('email', ADMIN_EMAIL).maybeSingle()
  const tpl = renderAdminPasswordReset({ actionLink })
  const sent = await sendEmail({
    supabase,
    userId: profile?.id || null,
    toEmail: ADMIN_EMAIL,
    kind: 'admin_password_reset',
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
    metadata: { source: 'admin_console' },
  })

  if (!sent.ok) {
    console.error('[admin/request-password-reset] email:', sent.error)
    return res.status(502).json({
      error: 'email_failed',
      message: 'Could not send the reset email. Check Brevo configuration and try again.',
    })
  }

  return res.status(200).json({
    ok: true,
    message: `Password reset email sent to ${ADMIN_EMAIL}.`,
  })
}

// Stripe → profile mapping lives in api/_lib/billing.js so this handler and
// the webhook worker can never drift apart on who counts as paid.
function findProfileForPayment(supabase, payment, { customerId, subscriptionId }) {
  return findProfile(supabase, {
    userId: payment?.user_id,
    subscriptionId,
    customerId,
    email: payment?.email,
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const supaUrl    = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supaUrl || !serviceKey) return res.status(500).json({ error: 'Server not configured' })

  const supabase = createClient(supaUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const body = getBody(req)
  const action = String(body.action || '').trim()

  if (action === 'request-password-reset') {
    return handleAdminPasswordReset(req, res, supabase)
  }

  // Auth: verify bearer token and that the user is the admin.
  const token = getBearerToken(req)
  if (!token) return res.status(401).json({ error: 'Missing auth token' })
  const { data: authData, error: authError } = await supabase.auth.getUser(token)
  if (authError || !authData?.user) return res.status(401).json({ error: 'Invalid session' })
  if ((authData.user.email || '').toLowerCase() !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Admin only' })
  }

  switch (action) {
    case 'refund': {
      // Manual refund from the Billing tab. The actual money/cancel/revoke
      // logic lives in _lib/refunds.js so the self-serve auto-refund path and
      // this button can never drift apart on what a refund means.
      const stripeSecret = process.env.STRIPE_SECRET_KEY
      if (!stripeSecret) return res.status(500).json({ error: 'Stripe not configured' })
      const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' })

      try {
        const r = await issueRefund({
          stripe, supabase,
          paymentIntentId: body.payment_intent_id || null,
          chargeId:        body.charge_id || null,
          sessionId:       String(body.stripe_session_id || '').trim() || null,
          subscriptionId:  body.stripe_subscription_id || null,
          reason:          body.reason || 'requested_by_customer',
          issuedBy:        authData.user.email,
          source:          'admin_panel',
        })
        return res.status(200).json({
          ok: true,
          refund_id:              r.refundId,
          amount:                 r.netCents,
          currency:               r.currency,
          status:                 r.status,
          gross_cents:            r.grossCents,
          fee_cents:              r.feeCents,
          net_refunded_cents:     r.netCents,
          subscription_cancelled: r.subscriptionCancelled,
        })
      } catch (err) {
        console.error('[admin/refund] error:', err?.message || err)
        return res.status(err?.status || 400).json({ error: err?.message || 'Refund failed', code: err?.code })
      }
    }

    case 'set-premium': {
      // Grant or revoke manual premium access from the admin Users table.
      //
      // Revoke used to be a client-side toggle that only flipped our own
      // profiles columns. If the account had a real Stripe subscription
      // attached, Stripe never heard about it: the subscription kept renewing
      // and the customer got charged again at the next period even though the
      // dashboard showed them as revoked. Route it through here instead so a
      // revoke on a paying account actually tells Stripe to stop.
      const userId = String(body.user_id || '').trim()
      const next = !!body.next
      const cancelMode = body.cancel_mode === 'immediate' ? 'immediate' : 'period_end'
      if (!userId) return res.status(400).json({ error: 'user_id_required' })

      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('id, email, is_premium, current_plan, subscription_status, premium_source, stripe_customer_id, stripe_subscription_id')
        .eq('id', userId)
        .maybeSingle()
      if (profErr) return res.status(500).json({ error: profErr.message })
      if (!profile) return res.status(404).json({ error: 'profile_not_found' })

      let stripeSubscriptionCancelled = null
      let patch

      if (next) {
        // Manual grant. Deliberately doesn't touch Stripe — this is for
        // comping access, not for changing what a paying subscription does.
        patch = {
          is_premium:           true,
          premium_source:       'admin',
          premium_granted_at:   new Date().toISOString(),
          premium_expires_at:   null,
          current_plan:         'admin',
          subscription_status:  'active',
          cancel_at_period_end: false,
        }
      } else {
        const subId = profile.stripe_subscription_id
        if (subId) {
          const stripeSecret = process.env.STRIPE_SECRET_KEY
          if (!stripeSecret) return res.status(500).json({ error: 'Stripe not configured' })
          const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' })
          try {
            const updatedSub = cancelMode === 'immediate'
              ? await stripe.subscriptions.cancel(subId)
              : await stripe.subscriptions.update(subId, { cancel_at_period_end: true })
            stripeSubscriptionCancelled = updatedSub.id
          } catch (err) {
            // Already-cancelled subscriptions 404 here, which is fine — our
            // columns still need to catch up either way.
            if (err?.statusCode !== 404 && err?.code !== 'resource_missing') {
              console.error('[admin/set-premium] stripe cancel failed:', err?.message || err)
              return res.status(502).json({ error: `Stripe cancel failed: ${err?.message || err}` })
            }
          }
        }

        patch = cancelMode === 'immediate'
          ? {
              is_premium:            false,
              premium_source:        null,
              premium_granted_at:    null,
              premium_expires_at:    new Date().toISOString(),
              current_plan:          'free',
              subscription_status:   'expired',
              cancel_at_period_end:  false,
            }
          : {
              // Access continues until Stripe ends the subscription at period
              // end; customer.subscription.deleted flips is_premium off then.
              // Nothing to change locally but the intent flag.
              cancel_at_period_end: true,
              subscription_status:  profile.subscription_status === 'past_due' ? 'past_due' : 'active',
            }
      }

      const { data: updated, error: updateErr } = await supabase
        .from('profiles')
        .update(patch)
        .eq('id', userId)
        .select('id, email, is_premium, current_plan, subscription_status, premium_source, premium_expires_at, cancel_at_period_end, stripe_customer_id, stripe_subscription_id')
        .maybeSingle()
      if (updateErr) return res.status(500).json({ error: updateErr.message })

      await supabase.from('subscription_events').insert({
        user_id:                 userId,
        email:                   profile.email,
        event_type:              next ? 'admin.premium_granted' : 'admin.premium_revoked',
        prev_status:              profile.subscription_status,
        new_status:               updated?.subscription_status ?? null,
        plan:                     updated?.current_plan ?? null,
        cancel_at_period_end:     !!patch.cancel_at_period_end,
        stripe_subscription_id:   profile.stripe_subscription_id,
        stripe_customer_id:       profile.stripe_customer_id,
        reason:                   next ? null : cancelMode,
        metadata: {
          issued_by:                       authData.user.email,
          source:                          'admin_panel',
          mode:                            next ? 'grant' : cancelMode,
          stripe_subscription_cancelled:   stripeSubscriptionCancelled,
        },
      }).then(({ error }) => {
        if (error) console.error('[admin/set-premium] subscription_events insert error:', error.message)
      })

      return res.status(200).json({
        ok: true,
        profile: updated,
        stripe_subscription_cancelled: stripeSubscriptionCancelled,
        mode: next ? 'grant' : cancelMode,
      })
    }

    case 'sync-user-subscription': {
      // Pull live Stripe state for one user, on demand.
      //
      // The hourly/daily reconciler already does this for everyone, but "I just
      // cancelled in the Stripe dashboard and the panel still says Renews" is a
      // 24-hour wait on the current cron cadence. This makes the panel
      // authoritative the moment you ask it to be.
      //
      // Unlike 'sync-subscription' (which works backwards from a payment row and
      // needs an original cs_… Checkout Session), this works off the
      // subscription id already on the profile.
      const stripeSecret = process.env.STRIPE_SECRET_KEY
      if (!stripeSecret) return res.status(500).json({ error: 'Stripe not configured' })
      const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' })

      const userId = String(body.user_id || '').trim()
      if (!userId) return res.status(400).json({ error: 'user_id_required' })

      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('id, email, is_premium, current_plan, subscription_status, premium_source, cancel_at_period_end, stripe_customer_id, stripe_subscription_id')
        .eq('id', userId)
        .maybeSingle()
      if (profErr) return res.status(500).json({ error: profErr.message })
      if (!profile) return res.status(404).json({ error: 'profile_not_found' })

      // No subscription id on file? Fall back to asking Stripe what this
      // customer has — covers rows where the id was never linked.
      let subId = profile.stripe_subscription_id
      if (!subId && profile.stripe_customer_id) {
        try {
          const list = await stripe.subscriptions.list({ customer: profile.stripe_customer_id, status: 'all', limit: 10 })
          subId = list.data.find(s => ['active', 'trialing', 'past_due'].includes(s.status))?.id || list.data[0]?.id || null
        } catch (err) {
          console.error('[admin/sync-user-subscription] list failed:', err?.message || err)
        }
      }
      if (!subId) {
        return res.status(404).json({ error: 'no_subscription', message: 'No Stripe subscription on file for this account.' })
      }

      let patch
      let stripeStatus = null
      try {
        const sub = await stripe.subscriptions.retrieve(subId)
        stripeStatus = sub.status
        patch = { ...subscriptionToProfilePatch(sub, profile.current_plan), stripe_subscription_id: sub.id }
      } catch (err) {
        // Subscription deleted outright in Stripe — that is information, not a
        // failure: the account has no live subscription, so mark it expired.
        if (err?.statusCode === 404 || err?.code === 'resource_missing') {
          stripeStatus = 'missing'
          patch = {
            is_premium:           false,
            subscription_status:  'expired',
            current_plan:         'free',
            cancel_at_period_end: false,
            premium_expires_at:   new Date().toISOString(),
          }
        } else {
          console.error('[admin/sync-user-subscription] retrieve failed:', err?.message || err)
          return res.status(502).json({ error: `Stripe lookup failed: ${err?.message || err}` })
        }
      }

      const { data: updated, error: updateErr } = await supabase
        .from('profiles')
        .update(patch)
        .eq('id', userId)
        .select('id, email, is_premium, current_plan, subscription_status, premium_source, premium_expires_at, cancel_at_period_end, current_period_end, stripe_customer_id, stripe_subscription_id')
        .maybeSingle()
      if (updateErr) return res.status(500).json({ error: updateErr.message })

      // Only log when something actually moved, so the timeline stays readable.
      const changed = Object.keys(patch).filter(k => {
        const before = profile[k]
        const after = patch[k]
        return before !== after && !(before == null && after == null)
      })
      if (changed.length) {
        await supabase.from('subscription_events').insert({
          user_id:                userId,
          email:                  profile.email,
          event_type:             'admin.subscription_resynced',
          prev_status:            profile.subscription_status,
          new_status:             updated?.subscription_status ?? null,
          plan:                   updated?.current_plan ?? null,
          cancel_at_period_end:   !!updated?.cancel_at_period_end,
          current_period_end:     updated?.current_period_end ?? null,
          stripe_subscription_id: subId,
          stripe_customer_id:     profile.stripe_customer_id,
          reason:                 'manual_resync',
          metadata: {
            issued_by:     authData.user.email,
            source:        'admin_panel',
            stripe_status: stripeStatus,
            fields:        changed,
          },
        }).then(({ error }) => {
          if (error) console.error('[admin/sync-user-subscription] subscription_events insert error:', error.message)
        })
      }

      return res.status(200).json({
        ok: true,
        profile: updated,
        stripe_status: stripeStatus,
        changed,
      })
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

    case 'list-contact-messages': {
      const since = body.since ? new Date(body.since) : new Date(Date.now() - 30 * 864e5)
      if (Number.isNaN(since.getTime())) {
        return res.status(400).json({ error: 'invalid_since' })
      }
      const limit = Math.min(Math.max(Number(body.limit) || 500, 1), 1000)
      const { data, error } = await supabase
        .from('contact_messages')
        .select('id, user_id, request_type, section, urgency, name, email, message, status, created_at')
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false })
        .limit(limit)
      if (error) {
        console.error('[admin/list-contact-messages]', error.message)
        return res.status(500).json({ error: error.message })
      }
      return res.status(200).json({ ok: true, rows: data ?? [] })
    }

    case 'list-coupons': {
      const { data, error } = await supabase
        .from('coupons')
        .select('code, active, max_redemptions, times_redeemed, grants_days, note, created_at')
        .order('created_at', { ascending: false })
      if (error) {
        console.error('[admin/list-coupons]', error.message)
        return res.status(500).json({ error: error.message })
      }
      return res.status(200).json({ ok: true, rows: data ?? [] })
    }

    case 'create-coupon': {
      const code = String(body.code || '').trim().toUpperCase()
      if (!code) return res.status(400).json({ error: 'code_required' })
      const grantsDays = body.grants_days != null && body.grants_days !== ''
        ? parseInt(body.grants_days, 10)
        : null
      const maxRedemptions = body.max_redemptions != null && body.max_redemptions !== ''
        ? parseInt(body.max_redemptions, 10)
        : null
      const { data, error } = await supabase
        .from('coupons')
        .insert({
          code,
          active: true,
          grants_days: Number.isFinite(grantsDays) ? grantsDays : null,
          max_redemptions: Number.isFinite(maxRedemptions) ? maxRedemptions : null,
          note: body.note || null,
        })
        .select('code, active, max_redemptions, times_redeemed, grants_days, note, created_at')
        .single()
      if (error) {
        console.error('[admin/create-coupon]', error.message)
        return res.status(500).json({ error: error.message })
      }
      return res.status(200).json({ ok: true, row: data })
    }

    case 'update-coupon': {
      const code = String(body.code || '').trim().toUpperCase()
      if (!code) return res.status(400).json({ error: 'code_required' })
      const patch = {}
      if (typeof body.active === 'boolean') patch.active = body.active
      if (body.grants_days !== undefined) {
        patch.grants_days = body.grants_days === null || body.grants_days === ''
          ? null
          : parseInt(body.grants_days, 10)
      }
      if (body.max_redemptions !== undefined) {
        patch.max_redemptions = body.max_redemptions === null || body.max_redemptions === ''
          ? null
          : parseInt(body.max_redemptions, 10)
      }
      if (body.note !== undefined) patch.note = body.note
      if (!Object.keys(patch).length) return res.status(400).json({ error: 'no_updates' })
      const { data, error } = await supabase
        .from('coupons')
        .update(patch)
        .eq('code', code)
        .select('code, active, max_redemptions, times_redeemed, grants_days, note, created_at')
        .single()
      if (error) {
        console.error('[admin/update-coupon]', error.message)
        return res.status(500).json({ error: error.message })
      }
      return res.status(200).json({ ok: true, row: data })
    }

    case 'support-alert-counts': {
      const since7d = new Date(Date.now() - 7 * 864e5).toISOString()
      const since72h = new Date(Date.now() - 72 * 3600e3).toISOString()
      const [supportRes, checkoutRes] = await Promise.all([
        supabase
          .from('contact_messages')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', since7d)
          .in('request_type', ['Billing or refund', 'Technical problem'])
          .eq('status', 'new'),
        supabase
          .from('checkout_intents')
          .select('id', { count: 'exact', head: true })
          .is('converted_at', null)
          .gte('created_at', since72h),
      ])
      if (supportRes.error || checkoutRes.error) {
        const msg = supportRes.error?.message || checkoutRes.error?.message
        console.error('[admin/support-alert-counts]', msg)
        return res.status(500).json({ error: msg })
      }
      return res.status(200).json({
        ok: true,
        supportOpen: supportRes.count ?? 0,
        checkoutHot: checkoutRes.count ?? 0,
      })
    }

    default:
      return res.status(400).json({ error: `Unknown action: ${action || '(empty)'}` })
  }
}
