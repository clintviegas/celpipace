/* global process */
// Google Search Console API helpers (native fetch — no googleapis).
// Used by /api/cron?job=gsc-summary (Relay.app weekly SEO workflow).
//
// Env (set in Vercel + local .env for manual triggers):
//   GSC_SITE              sc-domain:celpipace.ca
//   GSC_CLIENT_ID         OAuth desktop client ID
//   GSC_CLIENT_SECRET     OAuth desktop client secret
//   GSC_REFRESH_TOKEN     Long-lived refresh token from .gsc-token.json
//   GSC_DAYS              Lookback window (default 90)

const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly'
const ROW_LIMIT = 25000

function dateString(d) {
  return d.toISOString().slice(0, 10)
}

export function gscDateRange(days = 90) {
  const endDate = new Date()
  endDate.setUTCDate(endDate.getUTCDate() - 1)
  const startDate = new Date(endDate)
  startDate.setUTCDate(startDate.getUTCDate() - days)
  return { startDate: dateString(startDate), endDate: dateString(endDate), days }
}

function getGscConfig() {
  const site = process.env.GSC_SITE || 'sc-domain:celpipace.ca'
  const clientId = process.env.GSC_CLIENT_ID
  const clientSecret = process.env.GSC_CLIENT_SECRET
  const refreshToken = process.env.GSC_REFRESH_TOKEN
  const days = Number(process.env.GSC_DAYS || 90)
  return { site, clientId, clientSecret, refreshToken, days }
}

export function isGscConfigured() {
  const { clientId, clientSecret, refreshToken } = getGscConfig()
  return !!(clientId && clientSecret && refreshToken)
}

async function tokenRequest(body) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error_description || data.error || `Token request failed (${res.status})`)
  }
  return data
}

export async function getGscAccessToken() {
  const { clientId, clientSecret, refreshToken } = getGscConfig()
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('gsc_not_configured')
  }
  const tokens = await tokenRequest({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  })
  return tokens.access_token
}

function shapeRows(rows, dimensions) {
  return (rows || []).map(r => {
    const out = {}
    dimensions.forEach((d, i) => { out[d] = r.keys[i] })
    out.clicks = r.clicks
    out.impressions = r.impressions
    out.ctr = r.ctr
    out.position = r.position
    return out
  })
}

export async function fetchGscRows(accessToken, { site, startDate, endDate, dimensions }) {
  const rows = []
  let startRow = 0
  const siteEnc = encodeURIComponent(site)
  const url = `https://www.googleapis.com/webmasters/v3/sites/${siteEnc}/searchAnalytics/query`

  while (true) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions,
        rowLimit: ROW_LIMIT,
        startRow,
        dataState: 'final',
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error?.message || `GSC query failed (${res.status})`)
    }
    const batch = data.rows || []
    rows.push(...batch)
    if (batch.length < ROW_LIMIT) break
    startRow += batch.length
  }
  return shapeRows(rows, dimensions)
}

function pagePath(url) {
  return String(url || '')
    .replace('https://www.celpipace.ca', '')
    .replace('https://celpipace.ca', '') || '/'
}

function pickPriorityAction({ topPages, strikingDistance }) {
  const lowCtr = [...topPages]
    .filter(p => p.impressions >= 50 && p.ctr < 0.02)
    .sort((a, b) => b.impressions - a.impressions)[0]
  if (lowCtr) {
    return `Improve title/meta on ${pagePath(lowCtr.page)} — ${lowCtr.impressions} impressions, ${(lowCtr.ctr * 100).toFixed(1)}% CTR, position ${lowCtr.position.toFixed(1)}`
  }
  const strike = strikingDistance[0]
  if (strike) {
    return `Push "${strike.query}" (pos ${strike.position.toFixed(1)}, ${strike.impressions} imp) — add internal links + request indexing`
  }
  return 'Request indexing for /celpip-practice-test and /celpip-mock-test in Google Search Console'
}

function buildSlackMessage(summary) {
  const lines = [
    '📊 *CELPIPACE SEO Weekly*',
    `Period: ${summary.startDate} → ${summary.endDate}`,
    `Impressions: *${summary.totals.impressions.toLocaleString()}* · Clicks: *${summary.totals.clicks.toLocaleString()}* · Pages in search: *${summary.rowCounts.pages}*`,
    '',
    '*Top queries*',
    ...summary.topQueries.slice(0, 5).map(q =>
      `• ${q.query} — ${q.impressions} imp, pos ${q.position.toFixed(1)}`
    ),
    '',
    '*Top pages*',
    ...summary.topPages.slice(0, 5).map(p =>
      `• ${pagePath(p.page)} — ${p.impressions} imp, ${p.clicks} clicks`
    ),
    '',
    `*Priority:* ${summary.priorityAction}`,
  ]
  return lines.join('\n')
}

export async function buildGscSummary() {
  const { site, days } = getGscConfig()
  const { startDate, endDate } = gscDateRange(days)
  const accessToken = await getGscAccessToken()

  const [queries, pages] = await Promise.all([
    fetchGscRows(accessToken, { site, startDate, endDate, dimensions: ['query'] }),
    fetchGscRows(accessToken, { site, startDate, endDate, dimensions: ['page'] }),
  ])

  const topQueries = [...queries].sort((a, b) => b.impressions - a.impressions).slice(0, 10)
  const topPages = [...pages].sort((a, b) => b.impressions - a.impressions).slice(0, 10)
  const strikingDistance = queries
    .filter(q => q.impressions >= 5 && q.position >= 8 && q.position <= 20)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 8)

  const totals = {
    clicks: queries.reduce((s, r) => s + r.clicks, 0),
    impressions: queries.reduce((s, r) => s + r.impressions, 0),
  }

  const summary = {
    ok: true,
    site,
    startDate,
    endDate,
    days,
    pulledAt: new Date().toISOString(),
    totals,
    rowCounts: { queries: queries.length, pages: pages.length },
    topQueries,
    topPages,
    strikingDistance,
  }

  summary.priorityAction = pickPriorityAction({ topPages, strikingDistance })
  summary.slackMessage = buildSlackMessage(summary)

  return summary
}

export { SCOPE }
