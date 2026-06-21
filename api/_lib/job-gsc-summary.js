/* global process */
// /api/cron?job=gsc-summary
// Live Google Search Console snapshot for Relay.app (or manual admin triggers).
//
// Auth: Authorization: Bearer <CRON_SECRET>
//
// Relay.app workflow:
//   Schedule (Mon 9am) → HTTP GET https://www.celpipace.ca/api/cron?job=gsc-summary
//   Header: Authorization: Bearer {{CRON_SECRET}}
//   → Slack: post {{slackMessage}} from JSON body

import { buildGscSummary, isGscConfigured } from './gsc.js'

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
    return res.status(200).json(summary)
  } catch (err) {
    console.error('[gsc-summary]', err.message)
    return res.status(500).json({
      error: 'gsc_fetch_failed',
      message: err.message,
    })
  }
}
