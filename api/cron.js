/* global process */
// /api/cron.js
// Single serverless function that dispatches all scheduled jobs.
// This keeps us under Vercel Hobby's 12-function limit — api/ is at exactly 12,
// so every new scheduled endpoint must land here rather than as a new file.
//
// Scheduling is moving from vercel.json crons to pg_cron + pg_net (see
// supabase migration pg_cron_schedule). pg_cron has no job cap, fires on the
// minute rather than "some time within the hour", and records every run in
// cron.job_run_details. Both schedulers can run in parallel during the
// migration: every job below is idempotent.
//
// Jobs:
//   worker            every minute  — drains the webhook inbox + outbox
//   reconcile-billing hourly        — Stripe Events backfill + drift repair
//   health-report     every 15 min  — dead/stuck counters → Sentry
//   sweep             daily         — expire premium, prune rate log
//   marketing / winback / reminders / examcountdown / abandoned / digest /
//   broadcast / gsc-summary         — lifecycle email
//
// Manual trigger:
//   POST /api/cron?job=worker
//   Authorization: Bearer <CRON_SECRET>

import sweepHandler         from './_lib/job-sweep.js'
import marketingHandler     from './_lib/job-marketing.js'
import winbackHandler       from './_lib/job-winback.js'
import remindersHandler     from './_lib/job-reminders.js'
import examCountdownHandler from './_lib/job-examcountdown.js'
import abandonedHandler     from './_lib/job-abandoned.js'
import digestHandler        from './_lib/job-digest.js'
import broadcastHandler     from './_lib/job-broadcast.js'
import gscSummaryHandler    from './_lib/job-gsc-summary.js'
import workerHandler        from './_lib/job-worker.js'
import reconcileHandler     from './_lib/job-reconcile-billing.js'
import healthReportHandler  from './_lib/job-health-report.js'
import { withObservability, flush } from './_lib/observability.js'

const JOBS = {
  worker:              workerHandler,
  'reconcile-billing': reconcileHandler,
  'health-report':     healthReportHandler,
  sweep:               sweepHandler,
  marketing:           marketingHandler,
  winback:             winbackHandler,
  reminders:           remindersHandler,
  examcountdown:       examCountdownHandler,
  abandoned:           abandonedHandler,
  digest:              digestHandler,
  broadcast:           broadcastHandler,
  'gsc-summary':       gscSummaryHandler,
}

// The individual lifecycle-email jobs each check CRON_SECRET themselves. The
// new jobs do not, so the dispatcher enforces it centrally — otherwise
// /api/cron?job=worker would be an unauthenticated way to drive the queue.
// Vercel cron invocations carry the secret automatically; when CRON_SECRET is
// unset (local dev) we allow through, matching the existing job behaviour.
function authorized(req) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return true
  const auth = req.headers.authorization || req.headers.Authorization || ''
  return auth === `Bearer ${cronSecret}`
}

export default async function handler(req, res) {
  const job = (req.query?.job || req.query?.type || '').toLowerCase().trim()

  if (!job) {
    return res.status(400).json({
      error: 'Missing ?job= param. Valid values: ' + Object.keys(JOBS).join(', '),
      available: Object.keys(JOBS),
    })
  }

  const jobHandler = JOBS[job]
  if (!jobHandler) {
    return res.status(400).json({
      error: `Unknown job: "${job}". Valid values: ${Object.keys(JOBS).join(', ')}`,
    })
  }

  if (!authorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    return await withObservability(job, jobHandler)(req, res)
  } finally {
    // Vercel freezes the container the moment we respond, so buffered Sentry
    // events must be flushed before returning.
    await flush()
  }
}
