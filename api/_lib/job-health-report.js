/* global process */
// /api/_lib/job-health-report.js
// Registered as ?job=health-report. Every 15 minutes.
//
// Reports the numbers that would have caught the 2026-07-27 incident on day
// one instead of day ten: dead events, stuck events, dead outbox jobs, failed
// emails. Anything non-zero raises a Sentry event so an alert rule can fire.
//
// This is the control loop the audit tables were always missing — they
// recorded the failure faithfully, but nothing ever read them.

import { captureMessage } from './observability.js'

// Beyond this, a pending event is not "waiting", it is stuck.
const STUCK_MINUTES = 30

async function count(supabase, table, apply) {
  const q = apply(supabase.from(table).select('id', { count: 'exact', head: true }))
  const { count: n, error } = await q
  if (error) throw new Error(`${table}: ${error.message}`)
  return n || 0
}

export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) return res.status(500).json({ error: 'Not configured' })

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const stuckBefore = new Date(Date.now() - STUCK_MINUTES * 60_000).toISOString()
  const dayAgo      = new Date(Date.now() - 24 * 3600_000).toISOString()

  let health
  try {
    const [inboxDead, inboxStuck, outboxDead, outboxPending, emailFailed, profileMiss] = await Promise.all([
      count(supabase, 'webhook_events', q => q.eq('status', 'dead')),
      count(supabase, 'webhook_events', q => q.eq('status', 'pending').lt('received_at', stuckBefore)),
      count(supabase, 'job_queue',      q => q.eq('status', 'dead')),
      count(supabase, 'job_queue',      q => q.eq('status', 'pending').lt('created_at', stuckBefore)),
      count(supabase, 'email_log',      q => q.eq('status', 'failed').gte('created_at', dayAgo)),
      count(supabase, 'webhook_events', q => q.not('processing_error', 'is', null).gte('received_at', dayAgo)),
    ])
    health = { inboxDead, inboxStuck, outboxDead, outboxPending, emailFailed, profileMiss }
  } catch (err) {
    captureMessage(`health-report query failed: ${err.message}`, { job: 'health-report' }, 'error')
    return res.status(500).json({ error: 'health_query_failed', message: err.message })
  }

  // Severity is deliberately graded: buried work needs a human, merely stuck
  // work usually means the worker is not ticking.
  const alerts = []
  if (health.inboxDead   > 0) alerts.push({ level: 'error',   metric: 'inboxDead',     value: health.inboxDead })
  if (health.outboxDead  > 0) alerts.push({ level: 'error',   metric: 'outboxDead',    value: health.outboxDead })
  if (health.inboxStuck  > 0) alerts.push({ level: 'warning', metric: 'inboxStuck',    value: health.inboxStuck })
  if (health.outboxPending > 0) alerts.push({ level: 'warning', metric: 'outboxPending', value: health.outboxPending })
  if (health.emailFailed > 0) alerts.push({ level: 'warning', metric: 'emailFailed',   value: health.emailFailed })
  if (health.profileMiss > 0) alerts.push({ level: 'warning', metric: 'profileMiss',   value: health.profileMiss })

  for (const alert of alerts) {
    captureMessage(`health: ${alert.metric}=${alert.value}`, {
      job: 'health-report',
      metric: alert.metric,
      value: alert.value,
    }, alert.level)
  }

  return res.status(200).json({ ok: true, healthy: alerts.length === 0, health, alerts })
}
