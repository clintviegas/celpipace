// Pull Google Search Console performance data into docs/gsc/ as JSON.
//
// Uses OAuth 2.0 (Desktop app flow) — runs as YOUR Google account, which
// already owns the GSC property. No "Add user" step needed.
//
// One-time setup:
//   1. Google Cloud Console → APIs & Services → Credentials
//   2. Create credentials → OAuth client ID → Desktop app → Download JSON
//   3. Save the file as .gsc-oauth-client.json in the repo root (gitignored)
//   4. Run:  GSC_SITE='sc-domain:celpipace.ca' npm run gsc:pull
//   5. A browser window opens → sign in with your GSC-owner Google account
//   6. Token is saved to .gsc-token.json (gitignored). Future runs are silent.

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import http from 'node:http'
import { exec } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT      = path.resolve(__dirname, '..')
const OUT_DIR   = path.join(ROOT, 'docs', 'gsc')
const SCOPE     = 'https://www.googleapis.com/auth/webmasters.readonly'

const SITE        = process.env.GSC_SITE
const CLIENT_FILE = process.env.GSC_CLIENT || path.join(ROOT, '.gsc-oauth-client.json')
const TOKEN_FILE  = process.env.GSC_TOKEN  || path.join(ROOT, '.gsc-token.json')
const DAYS        = Number(process.env.GSC_DAYS || 90)
const ROW_LIMIT   = 25000

if (!SITE) {
  console.error('Missing GSC_SITE env var.')
  console.error("Example: GSC_SITE='sc-domain:celpipace.ca' npm run gsc:pull")
  process.exit(1)
}
if (!existsSync(CLIENT_FILE)) {
  console.error(`OAuth client JSON not found at: ${CLIENT_FILE}`)
  console.error('')
  console.error('Steps to get it:')
  console.error('  1. https://console.cloud.google.com → APIs & Services → Credentials')
  console.error('  2. Create credentials → OAuth client ID → Application type: Desktop app')
  console.error('  3. Download the JSON → save as .gsc-oauth-client.json in the repo root')
  process.exit(1)
}

const clientSecret = JSON.parse(await readFile(CLIENT_FILE, 'utf8'))
const { client_id, client_secret } = clientSecret.installed || clientSecret.web
const REDIRECT = 'http://localhost:4242/oauth2callback'

// ── OAuth (native fetch — no googleapis) ─────────────────────────────────────

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

function authUrl() {
  const params = new URLSearchParams({
    client_id,
    redirect_uri: REDIRECT,
    response_type: 'code',
    scope: SCOPE,
    access_type: 'offline',
    prompt: 'consent',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

function openBrowser(url) {
  const cmd = process.platform === 'darwin' ? `open "${url}"`
             : process.platform === 'win32' ? `start "" "${url}"`
             : `xdg-open "${url}"`
  exec(cmd, err => {
    if (err) {
      console.log('\nCould not open browser automatically.')
      console.log('Open this URL manually:\n', url, '\n')
    }
  })
}

function waitForCode() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, 'http://localhost:4242')
      const code = url.searchParams.get('code')
      if (!code) {
        res.end('No code found. Please try again.')
        return
      }
      res.end('<h2>Done! You can close this tab and return to the terminal.</h2>')
      server.close()
      resolve(code)
    })
    server.on('error', reject)
    server.listen(4242, () => {
      console.log('Waiting for Google sign-in... (listening on localhost:4242)')
    })
  })
}

async function getAccessToken() {
  if (existsSync(TOKEN_FILE)) {
    const saved = JSON.parse(await readFile(TOKEN_FILE, 'utf8'))
    if (saved.refresh_token) {
      try {
        const refreshed = await tokenRequest({
          client_id,
          client_secret,
          refresh_token: saved.refresh_token,
          grant_type: 'refresh_token',
        })
        const merged = { ...saved, ...refreshed }
        await writeFile(TOKEN_FILE, JSON.stringify(merged, null, 2))
        return merged.access_token
      } catch (err) {
        console.warn('Token refresh failed — starting new sign-in:', err.message)
      }
    }
  }

  const url = authUrl()
  console.log('\nOpening your browser to sign in with your GSC Google account...')
  openBrowser(url)
  console.log('\nIf the browser did not open, paste this URL manually:\n', url, '\n')

  const code = await waitForCode()
  const tokens = await tokenRequest({
    client_id,
    client_secret,
    code,
    redirect_uri: REDIRECT,
    grant_type: 'authorization_code',
  })
  await writeFile(TOKEN_FILE, JSON.stringify(tokens, null, 2))
  console.log('Token saved to .gsc-token.json (future runs will be silent)\n')
  return tokens.access_token
}

// ── Fetch & write ─────────────────────────────────────────────────────────────

function dateString(d) {
  return d.toISOString().slice(0, 10)
}

const endDate = new Date()
endDate.setUTCDate(endDate.getUTCDate() - 1)
const startDate = new Date(endDate)
startDate.setUTCDate(startDate.getUTCDate() - DAYS)

async function fetchRows(accessToken, dimensions) {
  const rows = []
  let startRow = 0
  const siteEnc = encodeURIComponent(SITE)
  const url = `https://www.googleapis.com/webmasters/v3/sites/${siteEnc}/searchAnalytics/query`

  while (true) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate: dateString(startDate),
        endDate: dateString(endDate),
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
  return rows
}

function shape(rows, dimensions) {
  return rows.map(r => {
    const out = {}
    dimensions.forEach((d, i) => { out[d] = r.keys[i] })
    out.clicks      = r.clicks
    out.impressions = r.impressions
    out.ctr         = r.ctr
    out.position    = r.position
    return out
  })
}

const accessToken = await getAccessToken()

await mkdir(OUT_DIR, { recursive: true })

console.log(`Pulling GSC data for ${SITE}`)
console.log(`Range: ${dateString(startDate)} → ${dateString(endDate)} (${DAYS} days)\n`)

const datasets = [
  { name: 'queries',         dims: ['query'] },
  { name: 'pages',           dims: ['page'] },
  { name: 'queries-by-page', dims: ['page', 'query'] },
  { name: 'devices',         dims: ['device'] },
  { name: 'countries',       dims: ['country'] },
]

const summary = {
  site: SITE,
  startDate: dateString(startDate),
  endDate: dateString(endDate),
  days: DAYS,
  pulledAt: new Date().toISOString(),
  totals: { clicks: 0, impressions: 0 },
  rowCounts: {},
}

for (const { name, dims } of datasets) {
  const rows = await fetchRows(accessToken, dims)
  const shaped = shape(rows, dims)
  if (name === 'queries') {
    summary.totals.clicks      = shaped.reduce((s, r) => s + r.clicks, 0)
    summary.totals.impressions = shaped.reduce((s, r) => s + r.impressions, 0)
  }
  summary.rowCounts[name] = shaped.length
  await writeFile(path.join(OUT_DIR, `${name}.json`), JSON.stringify(shaped, null, 2))
  console.log(`  ${name.padEnd(20)} ${String(shaped.length).padStart(6)} rows`)
}

await writeFile(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2))

console.log('\nTotals:')
console.log(`  Clicks:      ${summary.totals.clicks.toLocaleString()}`)
console.log(`  Impressions: ${summary.totals.impressions.toLocaleString()}`)
console.log(`\nWrote ${datasets.length + 1} files to docs/gsc/`)
console.log("Run 'claude audit the GSC data' to get the full audit.")
