/* global process */
// /api/_lib/job-abandoned.js  (dispatched via /api/cron?job=abandoned)
// Abandoned-checkout recovery. A row is written to public.checkout_intents
// whenever we create a Stripe Checkout Session, and marked converted by the
// stripe-webhook on checkout.session.completed. This job re-engages learners
// who started checkout but never paid:
//
//   day 1 → renderAbandonedCheckoutD1   (gentle "finish signing up")
//   day 3 → renderAbandonedCheckoutD3   (CELPIP25 first-time discount)
//
// Eligibility (enforced in the abandoned_checkout_candidates RPC):
//   - checkout_intents.converted_at IS NULL
//   - intent created in the step window
//   - profile is NOT premium (truly abandoned)
//   - marketing_consent = true AND marketing_unsubscribed_at is null
//
// Note: the cron runs daily, so a "1 hour" nudge isn't feasible — day-based
// windows match the existing drip cadence and the daily tick.

import { createClient } from '@supabase/supabase-js'
import {
  sendEmail,
  renderAbandonedCheckoutD1,
  renderAbandonedCheckoutD3,
} from './email.js'

const STEPS = [
  { key: 'abandoned_d1', daysSince: 1, render: renderAbandonedCheckoutD1 },
  { key: 'abandoned_d3', daysSince: 3, render: renderAbandonedCheckoutD3 },
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

    const upperIso = new Date(Date.now() - step.daysSince * 86400_000).toISOString()
    const lowerIso = new Date(Date.now() - (step.daysSince + 1) * 86400_000).toISOString()

    const { data: candidates, error: selErr } = await supabase.rpc('abandoned_checkout_candidates', {
      p_lower: lowerIso,
      p_upper: upperIso,
      p_limit: budget,
    })

    if (selErr) {
      console.error('[cron-abandoned] candidate rpc failed:', selErr.message, 'step=', step.key)
      summary.steps[step.key] = { ...stepResult, error: selErr.message }
      continue
    }

    stepResult.eligible = candidates?.length || 0

    for (const cand of candidates || []) {
      if (budget <= 0) break
      if (!cand.email) { stepResult.skipped++; continue }

      // Key per checkout session so a brand-new abandoned checkout later gets
      // its own recovery sequence.
      const campaignKey = `${step.key}:${cand.stripe_session_id}`

      if (!dryRun) {
        const { error: lockErr, data: locked } = await supabase
          .from('marketing_sends')
          .insert({ user_id: cand.user_id, campaign_key: campaignKey, metadata: { step: step.key, session: cand.stripe_session_id } })
          .select('id')
          .maybeSingle()

        if (lockErr) {
          if (lockErr.code === '23505') { stepResult.skipped++; continue }
          console.error('[cron-abandoned] lock insert failed:', lockErr.message)
          stepResult.failed++; continue
        }
        if (!locked) { stepResult.skipped++; continue }

        const { subject, html } = step.render({ name: cand.full_name, userId: cand.user_id, plan: cand.plan })
        const sendResult = await sendEmail({
          supabase,
          userId:   cand.user_id,
          toEmail:  cand.email,
          kind:     step.key,
          subject,
          html,
          metadata: { campaign: 'abandoned_checkout', step: step.key, session: cand.stripe_session_id },
        })

        if (sendResult.ok) {
          stepResult.sent++
          budget--
          if (sendResult.logId) {
            await supabase.from('marketing_sends').update({ email_log_id: sendResult.logId })
              .eq('user_id', cand.user_id).eq('campaign_key', campaignKey).catch(() => {})
          }
        } else {
          stepResult.failed++
          await supabase.from('marketing_sends').delete()
            .eq('user_id', cand.user_id).eq('campaign_key', campaignKey).catch(() => {})
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
