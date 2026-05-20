/* global process */
// /api/cron-winback.js
// Daily win-back sequence for cancelled/expired Premium users.
//
//   day 3  → renderWinbackDay3   (your progress is saved)
//   day 14 → renderWinbackDay14  (value recap + CELPIP25 coupon)
//   day 30 → renderWinbackDay30  (final check-in)
//
// Eligibility (all must be true):
//   - profiles.marketing_consent = true
//   - profiles.marketing_unsubscribed_at is null
//   - profiles.is_premium = false
//   - profiles.subscription_status IN ('expired', 'canceled', 'refunded')
//   - profiles.premium_expires_at in the right window for that step (±1 day)
//   - no prior row in marketing_sends for (user_id, campaign_key)
//
// Idempotency: marketing_sends has UNIQUE(user_id, campaign_key). The INSERT
// happens BEFORE the actual send so a second cron run can never double-send.

import { createClient } from '@supabase/supabase-js'
import {
  sendEmail,
  renderWinbackDay3,
  renderWinbackDay14,
  renderWinbackDay30,
} from './_lib/email.js'

const STEPS = [
  { key: 'winback_d3',  daysSinceExpiry: 3,  render: renderWinbackDay3  },
  { key: 'winback_d14', daysSinceExpiry: 14, render: renderWinbackDay14 },
  { key: 'winback_d30', daysSinceExpiry: 30, render: renderWinbackDay30 },
]

const MAX_SENDS_PER_RUN = 200

const WINBACK_STATUSES = ['expired', 'canceled', 'refunded']

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

    // Window: premium expired between (now - day - 1) and (now - day).
    const upperIso = new Date(Date.now() - step.daysSinceExpiry * 86400_000).toISOString()
    const lowerIso = new Date(Date.now() - (step.daysSinceExpiry + 1) * 86400_000).toISOString()

    const { data: candidates, error: selErr } = await supabase
      .from('profiles')
      .select('id, email, full_name, marketing_consent, marketing_unsubscribed_at, is_premium, subscription_status, premium_expires_at')
      .eq('marketing_consent', true)
      .is('marketing_unsubscribed_at', null)
      .eq('is_premium', false)
      .in('subscription_status', WINBACK_STATUSES)
      .gte('premium_expires_at', lowerIso)
      .lt('premium_expires_at', upperIso)
      .limit(budget)

    if (selErr) {
      console.error('[cron-winback] candidate select failed:', selErr.message, 'step=', step.key)
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
          .insert({ user_id: profile.id, campaign_key: step.key, metadata: { step: step.key } })
          .select('id')
          .maybeSingle()

        if (lockErr) {
          if (lockErr.code === '23505') { stepResult.skipped++; continue }
          console.error('[cron-winback] lock insert failed:', lockErr.message)
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
          metadata: { campaign: 'winback', step: step.key },
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
          await supabase.from('marketing_sends').delete()
            .eq('user_id', profile.id).eq('campaign_key', step.key).catch(() => {})
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
