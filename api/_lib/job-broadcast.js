/* global process */
// /api/_lib/job-broadcast.js  (dispatched via /api/cron?job=broadcast)
// Educational newsletter / broadcast sender. Picks up due rows from
// public.broadcasts (status='scheduled' and scheduled_at <= now) and emails
// every consented learner once, keyed by 'broadcast:<slug>'.
//
// Large audiences are delivered across multiple daily runs (MAX_SENDS_PER_RUN
// cap). A broadcast stays 'sending' until a full pass completes within budget,
// at which point it flips to 'sent'.
//
// To launch a newsletter:
//   UPDATE public.broadcasts
//      SET status='scheduled', scheduled_at=now()
//    WHERE slug='your-slug';
//
// NOTE: for richer one-off campaigns with full analytics, Brevo's native
// Campaigns UI is also a great option — this job covers code-driven sends that
// reuse the CASL-compliant template + unsubscribe footer.

import { createClient } from '@supabase/supabase-js'
import { sendEmail, renderBroadcast } from './email.js'

const MAX_SENDS_PER_RUN = 200
const PAGE_SIZE = 200

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

  const dryRun = req.query?.dry === '1' || req.body?.dryRun === true
  const nowIso = new Date().toISOString()

  // Oldest-scheduled due broadcast first. We process one per run for clarity.
  const { data: due, error: dueErr } = await supabase
    .from('broadcasts')
    .select('id, slug, subject, preheader, heading, body_html, cta_url, cta_label, audience, status, sent_count')
    .in('status', ['scheduled', 'sending'])
    .lte('scheduled_at', nowIso)
    .order('scheduled_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (dueErr) {
    console.error('[cron-broadcast] due select failed:', dueErr.message)
    return res.status(200).json({ ok: false, error: dueErr.message })
  }
  if (!due) return res.status(200).json({ ok: true, skipped: 'no_due_broadcast' })

  const campaignKey = `broadcast:${due.slug}`
  const result = { slug: due.slug, campaignKey, eligible: 0, sent: 0, skipped: 0, failed: 0, completed: false, dryRun }

  if (!dryRun && due.status === 'scheduled') {
    await supabase.from('broadcasts').update({ status: 'sending', updated_at: nowIso }).eq('id', due.id).catch(() => {})
  }

  let budget = MAX_SENDS_PER_RUN
  let offset = 0
  let reachedEnd = false

  while (budget > 0) {
    let query = supabase
      .from('profiles')
      .select('id, email, full_name, is_premium')
      .eq('marketing_consent', true)
      .is('marketing_unsubscribed_at', null)
      .not('email', 'is', null)
      .order('created_at', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1)

    if (due.audience === 'free')    query = query.eq('is_premium', false)
    if (due.audience === 'premium') query = query.eq('is_premium', true)

    const { data: rows, error: selErr } = await query
    if (selErr) {
      console.error('[cron-broadcast] profile select failed:', selErr.message)
      return res.status(200).json({ ok: false, ...result, error: selErr.message })
    }
    if (!rows || rows.length === 0) { reachedEnd = true; break }

    result.eligible += rows.length

    for (const profile of rows) {
      if (budget <= 0) break
      if (!profile.email) { result.skipped++; continue }

      if (!dryRun) {
        const { error: lockErr, data: locked } = await supabase
          .from('marketing_sends')
          .insert({ user_id: profile.id, campaign_key: campaignKey, metadata: { slug: due.slug } })
          .select('id')
          .maybeSingle()

        if (lockErr) {
          if (lockErr.code === '23505') { result.skipped++; continue }
          console.error('[cron-broadcast] lock insert failed:', lockErr.message)
          result.failed++; continue
        }
        if (!locked) { result.skipped++; continue }

        const { subject, html } = renderBroadcast({
          userId:    profile.id,
          subject:   due.subject,
          preheader: due.preheader,
          heading:   due.heading,
          bodyHtml:  due.body_html,
          ctaUrl:    due.cta_url,
          ctaLabel:  due.cta_label,
        })
        const sendResult = await sendEmail({
          supabase,
          userId:   profile.id,
          toEmail:  profile.email,
          kind:     campaignKey,
          subject,
          html,
          metadata: { campaign: 'broadcast', slug: due.slug },
        })

        if (sendResult.ok) {
          result.sent++
          budget--
          if (sendResult.logId) {
            await supabase.from('marketing_sends').update({ email_log_id: sendResult.logId })
              .eq('user_id', profile.id).eq('campaign_key', campaignKey).catch(() => {})
          }
        } else {
          result.failed++
          await supabase.from('marketing_sends').delete()
            .eq('user_id', profile.id).eq('campaign_key', campaignKey).catch(() => {})
        }
      } else {
        result.sent++
      }
    }

    if (rows.length < PAGE_SIZE) { reachedEnd = true; break }
    offset += PAGE_SIZE
  }

  // Update counters + completion state.
  if (!dryRun) {
    const patch = {
      sent_count: (due.sent_count || 0) + result.sent,
      updated_at: new Date().toISOString(),
    }
    // Only mark 'sent' if we scanned the whole audience this run (budget held).
    if (reachedEnd && budget > 0) {
      patch.status = 'sent'
      result.completed = true
    }
    await supabase.from('broadcasts').update(patch).eq('id', due.id).catch(() => {})
  }

  return res.status(200).json({ ok: true, ...result })
}
