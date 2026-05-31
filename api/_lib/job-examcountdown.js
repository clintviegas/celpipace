/* global process */
// /api/_lib/job-examcountdown.js  (dispatched via /api/cron?job=examcountdown)
// Exam-date countdown sequence. Fires timed prep emails as a learner's chosen
// test date (profiles.exam_date) approaches:
//
//   T-14 → renderExamCountdownT14   (build the 2-week plan)
//   T-7  → renderExamCountdownT7    (drill weakest section)
//   T-3  → renderExamCountdownT3    (test-day checklist)
//   T-1  → renderExamCountdownT1    (calm + encouragement)
//
// Eligibility:
//   - profiles.exam_date == today + N (exact date match)
//   - profiles.marketing_consent = true AND marketing_unsubscribed_at is null
//
// Idempotency: campaign_key embeds the exam date (exam_t7:<date>) so re-booking
// a new test later starts a fresh countdown. The marketing_sends UNIQUE lock
// is inserted BEFORE the send.

import { createClient } from '@supabase/supabase-js'
import {
  sendEmail,
  renderExamCountdownT14,
  renderExamCountdownT7,
  renderExamCountdownT3,
  renderExamCountdownT1,
} from './email.js'

const STEPS = [
  { key: 'exam_t14', daysBefore: 14, render: renderExamCountdownT14 },
  { key: 'exam_t7',  daysBefore: 7,  render: renderExamCountdownT7  },
  { key: 'exam_t3',  daysBefore: 3,  render: renderExamCountdownT3  },
  { key: 'exam_t1',  daysBefore: 1,  render: renderExamCountdownT1  },
]

const MAX_SENDS_PER_RUN = 200

// YYYY-MM-DD for (today + offset days), in UTC — matches a Postgres DATE column.
function dateOffset(days) {
  const d = new Date(Date.now() + days * 86400_000)
  return d.toISOString().slice(0, 10)
}

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
    const targetDate = dateOffset(step.daysBefore)

    const { data: candidates, error: selErr } = await supabase
      .from('profiles')
      .select('id, email, full_name, exam_date, marketing_consent, marketing_unsubscribed_at')
      .eq('marketing_consent', true)
      .is('marketing_unsubscribed_at', null)
      .eq('exam_date', targetDate)
      .limit(budget)

    if (selErr) {
      console.error('[cron-examcountdown] select failed:', selErr.message, 'step=', step.key)
      summary.steps[step.key] = { ...stepResult, error: selErr.message }
      continue
    }

    stepResult.eligible = candidates?.length || 0

    for (const profile of candidates || []) {
      if (budget <= 0) break
      if (!profile.email) { stepResult.skipped++; continue }

      const campaignKey = `${step.key}:${profile.exam_date}`

      if (!dryRun) {
        const { error: lockErr, data: locked } = await supabase
          .from('marketing_sends')
          .insert({ user_id: profile.id, campaign_key: campaignKey, metadata: { step: step.key, exam_date: profile.exam_date } })
          .select('id')
          .maybeSingle()

        if (lockErr) {
          if (lockErr.code === '23505') { stepResult.skipped++; continue }
          console.error('[cron-examcountdown] lock insert failed:', lockErr.message)
          stepResult.failed++; continue
        }
        if (!locked) { stepResult.skipped++; continue }

        const { subject, html } = step.render({ name: profile.full_name, userId: profile.id, examDate: profile.exam_date })
        const sendResult = await sendEmail({
          supabase,
          userId:   profile.id,
          toEmail:  profile.email,
          kind:     step.key,
          subject,
          html,
          metadata: { campaign: 'exam_countdown', step: step.key, exam_date: profile.exam_date },
        })

        if (sendResult.ok) {
          stepResult.sent++
          budget--
          if (sendResult.logId) {
            await supabase.from('marketing_sends').update({ email_log_id: sendResult.logId })
              .eq('user_id', profile.id).eq('campaign_key', campaignKey).catch(() => {})
          }
        } else {
          stepResult.failed++
          await supabase.from('marketing_sends').delete()
            .eq('user_id', profile.id).eq('campaign_key', campaignKey).catch(() => {})
        }
      } else {
        stepResult.sent++
      }
    }

    summary.steps[step.key] = stepResult
    summary.totalSent    += stepResult.sent
    summary.totalSkipped += stepResult.skipped
    summary.totalFailed  += stepResult.failed
  }

  return res.status(200).json({ ok: true, ...summary })
}
