/* global process */
// /api/_lib/job-digest.js  (dispatched via /api/cron?job=digest)
// Weekly progress digest. Sends each consented learner a personalised recap of
// their last 7 days of practice — sets completed, average score, and the one
// section to focus on next.
//
// Runs daily but only ACTS once per week (default: Monday UTC) so each learner
// gets at most one digest per ISO week. Override the gate with ?force=1.
//
// Eligibility (enforced in weekly_digest_candidates RPC):
//   - at least one graded practice_attempt in the last 7 days
//   - marketing_consent = true AND marketing_unsubscribed_at is null
//
// Idempotency: campaign_key = 'digest:<weekStart>' (the Monday date). Re-runs
// within the same week conflict-skip; a new week is a new key.

import { createClient } from '@supabase/supabase-js'
import { sendEmail, renderWeeklyDigest } from './email.js'

const MAX_SENDS_PER_RUN = 200
const PAGE_SIZE = 200
const DIGEST_WEEKDAY = 1 // Monday (UTC). 0=Sun … 6=Sat

// Monday (UTC) of the current week as YYYY-MM-DD — stable weekly idempotency key.
function currentWeekKey() {
  const now = new Date()
  const day = now.getUTCDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + diff))
  return monday.toISOString().slice(0, 10)
}

// Derive weakest/strongest section + headline stats from the RPC row.
function buildStats(row) {
  const sections = row.section_stats || {}
  let weakest = null
  let strongest = null
  for (const [section, s] of Object.entries(sections)) {
    const avgPct = Number(s?.avg_pct)
    if (!Number.isFinite(avgPct)) continue
    if (!weakest || avgPct < weakest.avgPct) weakest = { section, avgPct }
    if (!strongest || avgPct > strongest.avgPct) strongest = { section, avgPct }
  }
  // If only one section practised, don't show the same one as both.
  if (weakest && strongest && weakest.section === strongest.section) strongest = null
  return {
    sets: Number(row.sets_7d) || 0,
    avgPct: Number(row.avg_pct_7d),
    weakest,
    strongest,
  }
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

  const force  = req.query?.force === '1'
  const dryRun = req.query?.dry === '1' || req.body?.dryRun === true

  // Weekly gate: only run on the digest weekday unless forced.
  if (!force && new Date().getUTCDay() !== DIGEST_WEEKDAY) {
    return res.status(200).json({ ok: true, skipped: 'not_digest_day', weekday: new Date().getUTCDay() })
  }

  const supabase = createClient(supaUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const weekKey = currentWeekKey()
  const campaignKey = `digest:${weekKey}`
  const sinceIso = new Date(Date.now() - 7 * 86400_000).toISOString()

  const result = { campaignKey, eligible: 0, sent: 0, skipped: 0, failed: 0, dryRun }
  let budget = MAX_SENDS_PER_RUN
  let offset = 0

  while (budget > 0) {
    const { data: rows, error: rpcErr } = await supabase.rpc('weekly_digest_candidates', {
      p_since: sinceIso,
      p_limit: PAGE_SIZE,
      p_offset: offset,
    })

    if (rpcErr) {
      console.error('[cron-digest] rpc failed:', rpcErr.message)
      return res.status(200).json({ ok: false, ...result, error: rpcErr.message })
    }
    if (!rows || rows.length === 0) break

    result.eligible += rows.length

    for (const row of rows) {
      if (budget <= 0) break
      if (!row.email) { result.skipped++; continue }

      if (!dryRun) {
        const { error: lockErr, data: locked } = await supabase
          .from('marketing_sends')
          .insert({ user_id: row.user_id, campaign_key: campaignKey, metadata: { week: weekKey } })
          .select('id')
          .maybeSingle()

        if (lockErr) {
          if (lockErr.code === '23505') { result.skipped++; continue }
          console.error('[cron-digest] lock insert failed:', lockErr.message)
          result.failed++; continue
        }
        if (!locked) { result.skipped++; continue }

        const stats = buildStats(row)
        const { subject, html } = renderWeeklyDigest({ name: row.full_name, userId: row.user_id, stats })
        const sendResult = await sendEmail({
          supabase,
          userId:   row.user_id,
          toEmail:  row.email,
          kind:     'weekly_digest',
          subject,
          html,
          metadata: { campaign: 'weekly_digest', week: weekKey, sets: stats.sets },
        })

        if (sendResult.ok) {
          result.sent++
          budget--
          if (sendResult.logId) {
            await supabase.from('marketing_sends').update({ email_log_id: sendResult.logId })
              .eq('user_id', row.user_id).eq('campaign_key', campaignKey).catch(() => {})
          }
        } else {
          result.failed++
          await supabase.from('marketing_sends').delete()
            .eq('user_id', row.user_id).eq('campaign_key', campaignKey).catch(() => {})
        }
      } else {
        result.sent++
      }
    }

    if (rows.length < PAGE_SIZE) break
    offset += PAGE_SIZE
  }

  return res.status(200).json({ ok: true, ...result })
}
