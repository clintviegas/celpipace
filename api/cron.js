/* global process */
// /api/cron.js
// Single serverless function that dispatches all scheduled jobs.
// This keeps us under Vercel Hobby's 12-function limit.
//
// Vercel cron entries in vercel.json:
//   { "path": "/api/cron?job=sweep",         "schedule": "0 0 * * *"  }
//   { "path": "/api/cron?job=marketing",     "schedule": "0 10 * * *" }
//   { "path": "/api/cron?job=winback",       "schedule": "0 11 * * *" }
//   { "path": "/api/cron?job=reminders",     "schedule": "0 16 * * *" }
//   { "path": "/api/cron?job=examcountdown", "schedule": "0 13 * * *" }
//   { "path": "/api/cron?job=abandoned",     "schedule": "0 15 * * *" }
//   { "path": "/api/cron?job=digest",        "schedule": "0 14 * * *" }
//   { "path": "/api/cron?job=broadcast",     "schedule": "0 17 * * *" }
//   { "path": "/api/cron?job=gsc-summary",   "schedule": "0 14 * * 1" }
//
// Manual trigger (admin / dev):
//   POST /api/cron?job=sweep
//   Authorization: Bearer <CRON_SECRET>

import sweepHandler    from './_lib/job-sweep.js'
import marketingHandler from './_lib/job-marketing.js'
import winbackHandler  from './_lib/job-winback.js'
import remindersHandler from './_lib/job-reminders.js'
import examCountdownHandler from './_lib/job-examcountdown.js'
import abandonedHandler from './_lib/job-abandoned.js'
import digestHandler   from './_lib/job-digest.js'
import broadcastHandler from './_lib/job-broadcast.js'
import gscSummaryHandler from './_lib/job-gsc-summary.js'

const JOBS = {
  sweep:         sweepHandler,
  marketing:     marketingHandler,
  winback:       winbackHandler,
  reminders:     remindersHandler,
  examcountdown: examCountdownHandler,
  abandoned:     abandonedHandler,
  digest:        digestHandler,
  broadcast:     broadcastHandler,
  'gsc-summary': gscSummaryHandler,
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

  return jobHandler(req, res)
}
