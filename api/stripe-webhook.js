// /api/stripe-webhook.js
// Stripe webhook receiver — INGEST ONLY.
//
// This handler verifies the signature, writes the raw event to the inbox, and
// returns. It does not touch profiles, send email, or call Brevo. All of that
// happens in api/_lib/job-worker.js, driven off the inbox on a schedule.
//
// WHY: the previous version did every side effect inline across ~400 lines.
// When one of them threw — a `.catch()` on a query builder, in the real
// incident — the whole event was lost, and because the handler answered 200
// Stripe never retried. A handler that does almost nothing almost never fails,
// and anything that does fail is now retried by us rather than depending on
// Stripe's redelivery policy.
//
// STATUS CODES MATTER HERE:
//   200 — event is durably in the inbox (or was already). Stripe can forget it.
//   400 — signature did not verify. Never retry; this is not a real event.
//   500 — we could not persist it. Stripe SHOULD retry. The old code returned
//         200 on failure, which silently discarded events.
//
// Webhook delivery is a fast path, not the only path: ?job=reconcile-billing
// polls the Stripe Events API and re-ingests anything that never arrived here.
//
// Env: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_URL,
//      SUPABASE_SERVICE_ROLE_KEY

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { enqueueEvent } from './_lib/inbox.js'
import { captureError, flush } from './_lib/observability.js'

export const config = { api: { bodyParser: false } }

// Events the worker knows how to handle. Anything else is acknowledged and
// dropped rather than stored — no point growing the inbox with noise.
const HANDLED = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_failed',
  'charge.refunded',
])

async function readRawBody(req) {
  return await new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
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

  let event
  try {
    const raw = await readRawBody(req)
    event = stripe.webhooks.constructEvent(raw, req.headers['stripe-signature'], webhookSecret)
  } catch (err) {
    // Unverifiable payload — retrying will not help.
    console.error('[stripe-webhook] signature error:', err.message)
    return res.status(400).json({ error: `Webhook signature error: ${err.message}` })
  }

  if (!HANDLED.has(event.type)) {
    return res.status(200).json({ received: true, ignored: event.type })
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // ── Durable step. This, and only this, decides the status code. ───────────
  try {
    await enqueueEvent(supabase, {
      source:    'stripe',
      eventId:   event.id,
      eventType: event.type,
      payload:   event,
    })
  } catch (err) {
    // Ask Stripe to redeliver. If it never does, the reconciler will pick this
    // event up from the Stripe Events API within the hour.
    captureError(err, { scope: 'stripe-webhook', stripe_event_id: event.id, event_type: event.type })
    console.error('[stripe-webhook] enqueue failed:', err?.message)
    return res.status(500).json({ error: 'could_not_persist_event' })
  }

  // ── Best-effort inline pass. Never affects the response. ─────────────────
  //
  // WHY: Vercel Hobby crons fire at most once per day, so a Vercel cron cannot
  // tick the worker at the cadence billing needs. Until pg_cron is scheduled
  // (see supabase/migrations/*_pg_cron_schedule.sql) this inline pass is what
  // keeps activation immediate — without it a new subscriber would sit in
  // 'pending' until the next daily tick.
  //
  // This does NOT reintroduce the old fragility. The event is already durably
  // stored above; processing claims the row, and any failure leaves it pending
  // with a retry scheduled. If this throws, times out, or the container is
  // killed mid-run, the lease expires and the worker picks it up. The webhook
  // still answers 200 either way.
  //
  // It is also safe to keep after pg_cron is live: the claim means the worker
  // and this pass can never both process the same event.
  let processed = null
  try {
    const { data: claimed } = await supabase.rpc('claim_webhook_event_by_id', {
      p_event_id: event.id,
      p_lease_seconds: 60,
    })
    const row = claimed?.[0]
    if (row) {
      const { processClaimedEvent } = await import('./_lib/job-worker.js')
      const result = await processClaimedEvent({ event: row, supabase, stripe })
      processed = result.outcome
    } else {
      processed = 'already_claimed'
    }
  } catch (err) {
    // Deliberately swallowed: the row is stored and will be retried.
    captureError(err, {
      scope: 'stripe-webhook.inline',
      stripe_event_id: event.id,
      event_type: event.type,
    }, 'warning')
    processed = 'deferred'
  }

  await flush()
  return res.status(200).json({ received: true, queued: event.id, processed })
}
