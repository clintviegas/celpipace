// /api/admin.js
// Single dispatcher for admin-only operations. Keeps us under Vercel's 12-fn
// limit while still allowing one-click refunds, manual premium grants, and
// future admin actions without adding more endpoints.
//
// All requests require:
//   Authorization: Bearer <supabase access_token>
//   Body: { action: 'refund' | 'sms_test' | ..., ...action-specific fields }
//
// Auth model: the bearer-token user must equal ADMIN_EMAIL.

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

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

// Best-effort admin SMS via Twilio. Silently skips if not configured so the
// rest of the flow (refund issuance) still works without it.
async function notifyAdminSms(message) {
  const sid   = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from  = process.env.TWILIO_FROM_PHONE
  const to    = process.env.ADMIN_PHONE
  if (!sid || !token || !from || !to) {
    return { sent: false, reason: 'twilio_not_configured' }
  }
  try {
    const auth = Buffer.from(`${sid}:${token}`).toString('base64')
    const body = new URLSearchParams({ From: from, To: to, Body: message.slice(0, 300) })
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
    if (!res.ok) {
      const text = await res.text()
      console.error('[admin] twilio sms error:', res.status, text.slice(0, 200))
      return { sent: false, reason: `http_${res.status}` }
    }
    return { sent: true }
  } catch (err) {
    console.error('[admin] twilio sms exception:', err?.message || err)
    return { sent: false, reason: err?.message || 'sms_error' }
  }
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
      if (!payment_intent_id && !charge_id) {
        return res.status(400).json({ error: 'Need payment_intent_id or charge_id' })
      }

      try {
        const refund = await stripe.refunds.create({
          ...(payment_intent_id ? { payment_intent: payment_intent_id } : { charge: charge_id }),
          reason: reason || 'requested_by_customer',
          metadata: { issued_by: authData.user.email, source: 'admin_panel' },
        })

        // Fire admin SMS — non-blocking, never errors out the refund response.
        notifyAdminSms(
          `CELPIPACE refund issued: ${refund.amount / 100} ${(refund.currency || 'usd').toUpperCase()} ` +
          `(${refund.id}) by ${authData.user.email}`
        ).catch(() => {})

        return res.status(200).json({
          ok: true,
          refund_id: refund.id,
          amount: refund.amount,
          currency: refund.currency,
          status: refund.status,
        })
      } catch (err) {
        console.error('[admin/refund] stripe error:', err?.message || err)
        return res.status(400).json({ error: err?.message || 'Refund failed' })
      }
    }

    case 'sms_test': {
      const result = await notifyAdminSms('CELPIPACE admin SMS test ✅')
      return res.status(result.sent ? 200 : 503).json(result)
    }

    default:
      return res.status(400).json({ error: `Unknown action: ${action || '(empty)'}` })
  }
}
