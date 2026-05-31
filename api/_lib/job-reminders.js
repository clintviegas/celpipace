/* global process */
// /api/_lib/job-reminders.js
// Daily study-reminder / re-engagement sequence for learners who practised
// before but have gone quiet. Dispatched via /api/cron?job=reminders.
//
//   day 3  → renderStudyReminderD3   (keep your momentum)
//   day 7  → renderStudyReminderD7   (a week off…)
//   day 14 → renderStudyReminderD14  (back on track — take a mock)
//
// Eligibility (enforced in the reminder_candidates RPC + here):
//   - profiles.marketing_consent = true
//   - profiles.marketing_unsubscribed_at is null
//   - has at least one practice_attempt
//   - most-recent practice_attempt falls in the window for that step (±1 day)
//   - no prior row in marketing_sends for (user_id, campaign_key)
//
// Idempotency: marketing_sends has UNIQUE(user_id, campaign_key). The lock
// INSERT happens BEFORE the send, so a second cron run can never double-send.

import { createClient } from '@supabase/supabase-js'
import {
  sendEmail,
  renderStudyReminderD3,
  renderStudyReminderD7,
  renderStudyReminderD14,
} from './email.js'

const STEPS = [
  { key: 'reminder_d3',  daysInactive: 3,  render: renderStudyReminderD3  },
  { key: 'reminder_d7',  daysInactive: 7,  render: renderStudyReminderD7  },
  { key: 'reminder_d14', daysInactive: 14, render: renderStudyReminderD14 },
]

const MAX_SENDS_PER_RUN = 200

export default async function handler(req, res) {
  const supaUrl    = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const cronSecret = process.env.CRON_SECRET

  if (!supaUrl || !serviceKey) return res.status(500).json({ error: 'Server not configured' })

  if (cronSecret) {
    const auth = req.headers.authorization || ''
    if (auth !== `Bearer ${cronSecret}`) return res.status(401).json({ error: 'Unauthorized' })
  }

  const supabase = createClient(supaUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const dryRun  = req.query?.dry === '1' || req.body?.dryRun === true
  const summary = { steps: {}, totalSent: 0, totalSkipped: 0, totalFailed: 0, dryRun }
  let budget    = MAX_SENDS_PER_RUN

  for (const step of STEPS) {
    const stepResult = { eligible: 0, sent: 0, skipped: 0, failed: 0 }

    // Window: last attempt between (now - day - 1) and (now - day) so a daily
    // cron tick catches users regardless of the time of day they last practised.
    const upperIso = new Date(Date.now() - step.daysInactive * 86400_000).toISOString()
    const lowerIso = new Date(Date.now() - (step.daysInactive + 1) * 86400_000).toISOString()

    const { data: candidates, error: selErr } = await supabase.rpc('reminder_candidates', {
      p_lower: lowerIso,
      p_upper: upperIso,
      p_limit: budget,
    })

    if (selErr) {
      console.error('[cron-reminders] candidate select failed:', selErr.message, 'step=', step.key)
      summary.steps[step.key] = { ...stepResult, error: selErr.message }
      continue
    }

    stepResult.eligible = candidates?.length || 0

    for (const profile of candidates || []) {
      if (budget <= 0) break
      if (!profile.email) { stepResult.skipped++; continue }

      if (!dryRun) {
        const { error: lockErr, data: locked } = await supabase
          .from('marketing_sends')
          .insert({ user_id: profile.user_id, campaign_key: step.key, metadata: { step: step.key } })
          .select('id')
          .maybeSingle()

        if (lockErr) {
          if (lockErr.code === '23505') { stepResult.skipped++; continue } // already sent
          console.error('[cron-reminders] lock insert failed:', lockErr.message)
          stepResult.failed++; continue
        }
        if (!locked) { stepResult.skipped++; continue }

        const { subject, html } = step.render({ name: profile.full_name, userId: profile.user_id })
        const sendResult = await sendEmail({
          supabase,
          userId:   profile.user_id,
          toEmail:  profile.email,
          kind:     step.key,
          subject,
          html,
          metadata: { campaign: 'reminders', step: step.key },
        })

        if (sendResult.ok) {
          stepResult.sent++
          budget--
          if (sendResult.logId) {
            await supabase.from('marketing_sends').update({ email_log_id: sendResult.logId })
              .eq('user_id', profile.user_id).eq('campaign_key', step.key).catch(() => {})
          }
        } else {
          stepResult.failed++
          // Roll back the lock so the user can be retried on the next tick if
          // this was a transient send failure.
          await supabase.from('marketing_sends').delete()
            .eq('user_id', profile.user_id).eq('campaign_key', step.key).catch(() => {})
        }
      } else {
        stepResult.sent++ // dry-run: count what would have been sent
      }
    }

    summary.steps[step.key] = stepResult
    summary.totalSent    += stepResult.sent
    summary.totalSkipped += stepResult.skipped
    summary.totalFailed  += stepResult.failed
  }

  return res.status(200).json({ ok: true, ...summary })
}
