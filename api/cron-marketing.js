/* global process */
// /api/cron-marketing.js
// Daily marketing scheduler. Drives the Free → Premium nudge sequence:
//   day 2  → renderFreeNudgeDay2   (study tips)
//   day 5  → renderFreeNudgeDay5   (mock report sample)
//   day 14 → renderFreeNudgeDay14  (CELPIP25 coupon)
//
// Eligibility (all must be true):
//   - profiles.marketing_consent = true
//   - profiles.marketing_unsubscribed_at is null
//   - profiles.is_premium = false
//   - signed up in the right window for that step (±1 day tolerance)
//   - no prior row in marketing_sends for (user_id, campaign_key)
//
// Idempotency: marketing_sends has UNIQUE(user_id, campaign_key). The INSERT
// happens BEFORE the actual Resend call so a second cron run in the same day
// can never double-send.
//
// Vercel auto-protects with CRON_SECRET; we also accept manual trigger when
// no secret is set (dev/admin).

import { createClient } from '@supabase/supabase-js'
import {
  sendEmail,
  renderFreeNudgeDay2,
  renderFreeNudgeDay5,
  renderFreeNudgeDay14,
} from './_lib/email.js'

const STEPS = [
  { key: 'free2premium_d2',  daysSinceSignup: 2,  render: renderFreeNudgeDay2  },
  { key: 'free2premium_d5',  daysSinceSignup: 5,  render: renderFreeNudgeDay5  },
  { key: 'free2premium_d14', daysSinceSignup: 14, render: renderFreeNudgeDay14 },
]

// Per-cron safety cap so a misconfiguration can't blast thousands of users
// before someone notices. Tune up once steady-state is verified.
const MAX_SENDS_PER_RUN = 200

export default async function handler(req, res) {
  const supaUrl     = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  const cronSecret  = process.env.CRON_SECRET

  if (!supaUrl || !serviceKey) return res.status(500).json({ error: 'Server not configured' })

  if (cronSecret) {
    const auth = req.headers.authorization || ''
    if (auth !== `Bearer ${cronSecret}`) return res.status(401).json({ error: 'Unauthorized' })
  }

  const supabase = createClient(supaUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const dryRun = req.query?.dry === '1' || req.body?.dryRun === true
  const summary = { steps: {}, totalSent: 0, totalSkipped: 0, totalFailed: 0, dryRun }
  let budget = MAX_SENDS_PER_RUN

  for (const step of STEPS) {
    const stepResult = { eligible: 0, sent: 0, skipped: 0, failed: 0 }

    // Window: signed up between (now - day - 1) and (now - day) so we catch
    // users on a daily cron tick regardless of what time they signed up.
    const upperIso = new Date(Date.now() - step.daysSinceSignup * 86400_000).toISOString()
    const lowerIso = new Date(Date.now() - (step.daysSinceSignup + 1) * 86400_000).toISOString()

    const { data: candidates, error: selErr } = await supabase
      .from('profiles')
      .select('id, email, full_name, marketing_consent, marketing_unsubscribed_at, is_premium, created_at')
      .eq('marketing_consent', true)
      .is('marketing_unsubscribed_at', null)
      .eq('is_premium', false)
      .gte('created_at', lowerIso)
      .lt('created_at', upperIso)
      .limit(budget)

    if (selErr) {
      console.error('[cron-marketing] candidate select failed:', selErr.message, 'step=', step.key)
      summary.steps[step.key] = { ...stepResult, error: selErr.message }
      continue
    }

    stepResult.eligible = candidates?.length || 0

    for (const profile of candidates || []) {
      if (budget <= 0) break
      if (!profile.email) { stepResult.skipped++; continue }

      // Reserve the send slot first (idempotency lock). If another cron run
      // already inserted this (user_id, campaign_key), ON CONFLICT skips.
      if (!dryRun) {
        const { error: lockErr, data: locked } = await supabase
          .from('marketing_sends')
          .insert({ user_id: profile.id, campaign_key: step.key, metadata: { step: step.key } })
          .select('id')
          .maybeSingle()
        if (lockErr) {
          // 23505 = unique_violation → already sent (good — skip)
          if (lockErr.code === '23505') { stepResult.skipped++; continue }
          console.error('[cron-marketing] lock insert failed:', lockErr.message)
          stepResult.failed++; continue
        }
        if (!locked) { stepResult.skipped++; continue }

        const { subject, html } = step.render({ name: profile.full_name, userId: profile.id })
        const sendResult = await sendEmail({
          supabase,
          userId:   profile.id,
          toEmail:  profile.email,
          kind:     step.key,
          subject,
          html,
          metadata: { campaign: 'free2premium', step: step.key },
        })

        if (sendResult.ok) {
          stepResult.sent++
          budget--
          if (sendResult.logId) {
            await supabase.from('marketing_sends').update({ email_log_id: sendResult.logId })
              .eq('user_id', profile.id).eq('campaign_key', step.key).catch(() => {})
          }
        } else {
          stepResult.failed++
          // Roll back the lock so the user can be retried tomorrow if it was
          // a transient Resend outage. (We DON'T retry the same day — that's
          // the point of the cron-tick model.)
          await supabase.from('marketing_sends').delete()
            .eq('user_id', profile.id).eq('campaign_key', step.key).catch(() => {})
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
