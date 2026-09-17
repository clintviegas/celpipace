# Google Search Console data pull

`scripts/gsc-pull.mjs` pulls performance data from GSC into JSON files here.
It runs as **your own Google account** (the one that owns the GSC property) —
no "Add user" step needed.

## One-time setup (3 steps)

### Step 1 — Create an OAuth client

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
   (same project as before — `celpipace-491007`)
2. Click **Create credentials → OAuth client ID**
3. Application type: **Desktop app** → name it anything → **Create**
4. Click **Download JSON** (the download icon on the right of your new client)
5. Save the file as **`.gsc-oauth-client.json`** in the repo root (already gitignored)

> If you see a "OAuth consent screen not configured" warning first, click
> **Configure consent screen** → External → fill in App name + your email →
> Save. Then repeat from step 2.

### Step 2 — Make sure the API is still enabled

APIs & Services → Library → search **Google Search Console API** → confirm it
shows "Enabled". (You did this for the service account — it should already be on.)

### Step 3 — Run

```bash
GSC_SITE='sc-domain:celpipace.ca' npm run gsc:pull
```

First run only: your browser opens automatically → sign in with the Google
account that owns `celpipace.ca` in Search Console → click Allow.

A token is saved to `.gsc-token.json` (gitignored). **Future runs are fully
silent** — no browser, no prompt.

## Output files (written to `docs/gsc/`, gitignored)

| File | Contents |
|---|---|
| `summary.json` | Date range, totals, row counts |
| `queries.json` | All queries — clicks / impressions / CTR / position |
| `pages.json` | All landing pages — same metrics |
| `queries-by-page.json` | Joined: which queries rank for which pages |
| `devices.json` | Mobile vs desktop split |
| `countries.json` | Traffic by country |

## After running

Tell Claude: **"GSC data is ready — audit it"** and it will read the JSON files
and produce:
- Striking-distance keywords (positions 5–20)
- High-impression / low-CTR pages + title/meta rewrites
- Cannibalized queries (wrong page ranking)
- Top-performing topics to double down on
- Prioritized edit list

## Weekly SEO report (Vercel Cron)

Every **Monday at 09:00 GST (05:00 UTC)**, Vercel Cron calls `/api/cron?job=gsc-summary`, fetches live GSC data, and posts a formatted summary to `#all-celpipace` via `SLACK_WEBHOOK_URL`.

Manual trigger (same endpoint):

```
GET https://www.celpipace.ca/api/cron?job=gsc-summary
Authorization: Bearer <CRON_SECRET>
```

Returns JSON with `slackMessage`, `topQueries`, `topPages`, `priorityAction`, and `slack: { posted: true }` when the webhook succeeds.

### Vercel env vars required

| Variable | Source |
|----------|--------|
| `GSC_SITE` | `sc-domain:celpipace.ca` |
| `GSC_CLIENT_ID` | `.gsc-oauth-client.json` → `installed.client_id` |
| `GSC_CLIENT_SECRET` | `.gsc-oauth-client.json` → `installed.client_secret` |
| `GSC_REFRESH_TOKEN` | `.gsc-token.json` → `refresh_token` |
| `CRON_SECRET` | Random secret; Vercel sends it on cron invocations |
| `SLACK_WEBHOOK_URL` | Slack Incoming Webhook for `#all-celpipace` (see below) |

Push GSC credentials to Vercel:

```bash
node scripts/setup-gsc-vercel.mjs
```

Push the Slack webhook (after creating it in Slack):

```bash
SLACK_WEBHOOK_URL='https://hooks.slack.com/services/...' node scripts/setup-gsc-vercel.mjs
```

Print refresh token locally:

```bash
node -e "console.log(JSON.parse(require('fs').readFileSync('.gsc-token.json','utf8')).refresh_token)"
```

### Slack Incoming Webhook setup

1. In Slack, open **#all-celpipace** → channel name → **Integrations** → **Add an app** or **Incoming Webhooks**
2. Create an **Incoming Webhook** scoped to `#all-celpipace`
3. Copy the URL (`https://hooks.slack.com/services/...`)
4. Add it to Vercel as `SLACK_WEBHOOK_URL` (dashboard or `setup-gsc-vercel.mjs` above)
5. Redeploy production after adding env vars

### Test

```bash
curl -s -H "Authorization: Bearer $CRON_SECRET" \
  "https://www.celpipace.ca/api/cron?job=gsc-summary" | jq .
```

Expect `"slack": { "posted": true }` and a message in `#all-celpipace`.

### Decommission Relay.app (one-time)

Relay is no longer used. After verifying the Vercel flow above:

1. Disable or delete the GSC weekly workflow in [Relay.app](https://relay.app)
2. In Slack → **#all-celpipace** → Integrations → remove **Relay.app** if still installed
