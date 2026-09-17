/* global process */
// /api/_lib/job-reconcile-billing.js
// Registered as ?job=reconcile-billing. Hourly.
//
// This is the job that makes webhook delivery optional.
//
//   (a) BACKFILL — poll the Stripe Events API for everything since our
//       watermark and enqueue any event id the inbox has never seen. If our
//       endpoint was down, misconfigured, or Stripe's delivery failed
//       permanently, the event still gets processed. Webhook delivery becomes
//       a latency optimisation rather than a dependency.
//
//   (b) DRIFT REPAIR — walk profiles that hold a Stripe subscription, compare
//       against live Stripe state, and correct any difference. This catches
//       whole classes of bug the event stream cannot: a handler that wrote the
//       wrong value, a manual edit, a migration that clobbered a column.
//
// A healthy system reports zero on both. Non-zero drift is a signal, so it is
// reported to Sentry rather than just logged.

import Stripe from 'stripe'
import { subscriptionToProfilePatch, findProfile } from './billing.js'
import { enqueueEvent } from './inbox.js'
import { tryDb } from './db.js'
import { captureError, captureMessage } from './observability.js'

const WATERMARK_KEY = 'stripe_events_watermark'
// Stripe retains events for 30 days; never look further back than that.
const MAX_LOOKBACK_SECONDS = 30 * 24 * 3600
const DEFAULT_LOOKBACK_SECONDS = 3 * 3600

const HANDLED = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_failed',
  'charge.refunded',
]

async function readWatermark(supabase) {
  const { data } = await supabase
    .from('system_state').select('value').eq('key', WATERMARK_KEY).maybeSingle()
  const stored = Number(data?.value?.created_gte)
  const floor = Math.floor(Date.now() / 1000) - MAX_LOOKBACK_SECONDS
  if (!stored || Number.isNaN(stored)) {
    return Math.floor(Date.now() / 1000) - DEFAULT_LOOKBACK_SECONDS
  }
  return Math.max(stored, floor)
}

async function writeWatermark(supabase, seconds) {
  await tryDb(
    supabase.from('system_state').upsert({
      key: WATERMARK_KEY,
      value: { created_gte: seconds },
      updated_at: new Date().toISOString(),
    }, { onConflict: 'key' }),
    'system_state.watermark'
  )
}

/** (a) Re-ingest anything Stripe has that our inbox does not. */
async function backfillMissedEvents(supabase, stripe, summary) {
  const since = await readWatermark(supabase)
  // Small overlap so an event created in the same second as the last cursor
  // is never skipped. Duplicates are free — the inbox dedupes on event id.
  const createdGte = since - 60

  let newest = since
  let scanned = 0

  for await (const event of stripe.events.list({
    created: { gte: createdGte },
    limit: 100,
  })) {
    scanned++
    if (event.created > newest) newest = event.created
    if (!HANDLED.includes(event.type)) continue

    const { data: existing } = await supabase
      .from('webhook_events').select('stripe_event_id').eq('stripe_event_id', event.id).maybeSingle()
    if (existing) continue

    await enqueueEvent(supabase, {
      source: 'stripe-reconciler',
      eventId: event.id,
      eventType: event.type,
      payload: event,
    })
    summary.recovered.push({ id: event.id, type: event.type, created: event.created })

    // A recovered event means webhook delivery failed. That is worth knowing
    // about even though we healed it.
    captureMessage('webhook event recovered by reconciler', {
      job: 'reconcile-billing', stripe_event_id: event.id, event_type: event.type,
    }, 'warning')

    // Bound the work per tick so a long outage backfills across several runs
    // instead of timing out on Hobby.
    if (summary.recovered.length >= 50) break
  }

  summary.scanned = scanned
  await writeWatermark(supabase, newest)
}

/** (b) Correct profiles that disagree with Stripe. */
async function repairDrift(supabase, stripe, summary, { limit }) {
  const { data: profiles, error } = await supabase
    .from('profiles')
    // Must include every key subscriptionToProfilePatch() emits — a column
    // that's compared but not selected reads as undefined and shows up as
    // phantom drift on every single run.
    .select('id, email, full_name, is_premium, subscription_status, current_plan, current_period_start, current_period_end, premium_expires_at, premium_source, cancel_at_period_end, stripe_subscription_id, stripe_customer_id')
    .not('stripe_subscription_id', 'is', null)
    .order('updated_at', { ascending: true, nullsFirst: true })
    .limit(limit)

  if (error) throw new Error(`profile_scan_failed: ${error.message}`)

  for (const profile of profiles || []) {
    try {
      const sub = await stripe.subscriptions.retrieve(profile.stripe_subscription_id)
      const patch = subscriptionToProfilePatch(sub, profile.current_plan)

      // STICKY LOCAL REVOCATIONS.
      //
      // The reconciler exists to fix drift, but an admin's deliberate
      // revocation is not drift. 'refunded' is set by the refund flow, which
      // gives the money back and cuts access — while (today) leaving the Stripe
      // subscription running. Stripe therefore still reports 'active', and a
      // naive "make the profile match Stripe" pass silently hands premium back
      // to someone who has been refunded. That happened once in production
      // (2026-08-07) before this guard existed.
      //
      // So: never let Stripe re-grant premium over a local revocation. Report
      // it instead — a profile in this state means Stripe and our intent
      // disagree, and the subscription probably needs cancelling.
      if (profile.subscription_status === 'refunded' && patch.is_premium) {
        summary.blockedResurrections.push({
          profile: profile.id,
          email: profile.email,
          stripeStatus: sub.status,
          subscription: sub.id,
        })
        captureMessage('reconciler blocked premium resurrection of a refunded account', {
          job: 'reconcile-billing',
          user_id: profile.id,
          stripe_status: sub.status,
          subscription: sub.id,
        }, 'error')
        summary.checked++
        continue
      }

      // Compare only the fields we own. Timestamps are compared as instants so
      // formatting differences do not read as drift.
      const diffs = {}
      for (const [key, next] of Object.entries(patch)) {
        const current = profile[key]
        const same = key.endsWith('_at') || key.endsWith('_end') || key.endsWith('_start')
          ? datesEqual(current, next)
          : current === next
        if (!same) diffs[key] = { from: current ?? null, to: next ?? null }
      }
      if (Object.keys(diffs).length === 0) { summary.checked++; continue }

      const { error: updErr } = await supabase.from('profiles').update(patch).eq('id', profile.id)
      if (updErr) throw new Error(`profile_update: ${updErr.message}`)

      await tryDb(
        supabase.from('subscription_events').insert({
          user_id: profile.id,
          email: profile.email,
          event_type: 'reconciler.repair',
          prev_status: profile.subscription_status,
          new_status: patch.subscription_status,
          plan: patch.current_plan,
          cancel_at_period_end: patch.cancel_at_period_end,
          current_period_end: patch.current_period_end,
          stripe_subscription_id: sub.id,
          stripe_customer_id: profile.stripe_customer_id,
          reason: 'drift_repair',
          metadata: { diffs },
        }),
        'subscription_events.reconciler'
      )

      summary.repaired.push({ profile: profile.id, fields: Object.keys(diffs) })
      captureMessage('billing drift repaired', {
        job: 'reconcile-billing',
        user_id: profile.id,
        fields: Object.keys(diffs).join(','),
      }, 'warning')
      summary.checked++
    } catch (err) {
      // A deleted subscription 404s — that is information, not a failure.
      if (err?.statusCode === 404 || err?.code === 'resource_missing') {
        summary.missingInStripe.push(profile.id)
        summary.checked++
        continue
      }
      summary.errors.push({ profile: profile.id, error: err.message })
      captureError(err, { job: 'reconcile-billing', user_id: profile.id })
    }
  }
}

function datesEqual(a, b) {
  if (!a && !b) return true
  if (!a || !b) return false
  return new Date(a).getTime() === new Date(b).getTime()
}

export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  const stripeKey   = process.env.STRIPE_SECRET_KEY
  if (!supabaseUrl || !serviceKey || !stripeKey) {
    return res.status(500).json({ error: 'Reconciler not configured' })
  }

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' })

  const dryRun = req.query?.dry === '1' || req.query?.dryRun === '1'
  const limit  = Math.min(Number(req.query?.limit) || 25, 100)

  const summary = {
    dryRun,
    scanned: 0,
    recovered: [],
    checked: 0,
    repaired: [],
    blockedResurrections: [],
    missingInStripe: [],
    errors: [],
  }

  try {
    if (!dryRun) await backfillMissedEvents(supabase, stripe, summary)
    await repairDrift(supabase, stripe, summary, { limit })
  } catch (err) {
    captureError(err, { job: 'reconcile-billing' })
    return res.status(500).json({ error: 'reconcile_failed', message: err.message, ...summary })
  }

  return res.status(200).json({
    ok: true,
    ...summary,
    recoveredCount: summary.recovered.length,
    repairedCount: summary.repaired.length,
    blockedCount: summary.blockedResurrections.length,
  })
}
