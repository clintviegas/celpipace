/* global process */
// /api/cron?job=gsc-summary
// Live Google Search Console snapshot for the weekly SEO Slack report.
//
// Schedule: Vercel Cron Mondays 05:00 UTC (09:00 GST) — see vercel.json.
// Auth: Vercel sends Authorization: Bearer <CRON_SECRET> on cron invocations.
//
// Slack delivery: set SLACK_WEBHOOK_URL in Vercel (Incoming Webhook for #all-celpipace).
// Manual trigger: GET /api/cron?job=gsc-summary with the same Bearer header.

import { buildGscSummary, isGscConfigured } from './gsc.js'

async function postSlackWebhook(text) {
  const url = process.env.SLACK_WEBHOOK_URL
  if (!url) return { posted: false, reason: 'no_webhook' }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Slack webhook failed (${res.status}): ${body.slice(0, 200)}`)
  }
  return { posted: true }
}

export default async function handler(req, res) {
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret) {
    const auth = req.headers.authorization || ''
    if (auth !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  }

  if (!isGscConfigured()) {
    return res.status(503).json({
      error: 'gsc_not_configured',
      message: 'Set GSC_CLIENT_ID, GSC_CLIENT_SECRET, and GSC_REFRESH_TOKEN in Vercel env.',
    })
  }

  try {
    const summary = await buildGscSummary()
    let slack = { posted: false }
    try {
      slack = await postSlackWebhook(summary.slackMessage)
    } catch (slackErr) {
      console.warn('[gsc-summary] slack webhook:', slackErr.message)
      slack = { posted: false, error: slackErr.message }
    }
    return res.status(200).json({ ...summary, slack })
  } catch (err) {
    console.error('[gsc-summary]', err.message)
    return res.status(500).json({
      error: 'gsc_fetch_failed',
      message: err.message,
    })
  }
}
