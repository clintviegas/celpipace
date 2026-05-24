/* global process */
// /api/admin.js
// Single dispatcher for admin-only operations. Keeps us under Vercel's 12-fn
// limit while still allowing one-click refunds, manual premium grants, and
// future admin actions without adding more endpoints.
//
// All requests require:
//   Authorization: Bearer <supabase access_token>
//   Body: { action: 'refund' | ..., ...action-specific fields }
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
