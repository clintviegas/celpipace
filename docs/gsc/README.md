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

## Relay.app weekly SEO workflow

Production endpoint (live GSC data):

```
GET https://www.celpipace.ca/api/cron?job=gsc-summary
Authorization: Bearer <CRON_SECRET>
```

Returns JSON with `slackMessage`, `topQueries`, `topPages`, `priorityAction`.

### Vercel env vars required

Copy from your local OAuth setup:

| Variable | Source |
|----------|--------|
| `GSC_SITE` | `sc-domain:celpipace.ca` |
| `GSC_CLIENT_ID` | `.gsc-oauth-client.json` → `installed.client_id` |
| `GSC_CLIENT_SECRET` | `.gsc-oauth-client.json` → `installed.client_secret` |
| `GSC_REFRESH_TOKEN` | `.gsc-token.json` → `refresh_token` |
| `CRON_SECRET` | Same secret Relay sends in the Authorization header |

Print refresh token locally:

```bash
node -e "console.log(JSON.parse(require('fs').readFileSync('.gsc-token.json','utf8')).refresh_token)"
```

### Relay.app steps

1. **Trigger:** Schedule → Every Monday 9:00 AM
2. **HTTP Request:** GET `https://www.celpipace.ca/api/cron?job=gsc-summary`
   - Header: `Authorization: Bearer YOUR_CRON_SECRET`
3. **Slack — Send channel message** (recommended; do **not** use “Send message to user”)
   - **Destination channel:** pick a channel from the dropdown, or paste the channel link from Slack (right-click channel → Copy → Copy link) into Relay’s channel picker ([Relay Slack FAQ](https://docs.relay.app/app-specific-faqs/slack))
   - **Message:** map `slackMessage` from step 2 JSON (not a hardcoded template)
   - Optional: add a **Markdown** data transform on `slackMessage` before the Slack step for nicer formatting
4. (Optional) **AI step:** Ask Relay to expand on `priorityAction`

#### Fixing “Slack: User not found” + “Destination channel Missing”

This error means step 3 is configured as a **DM to a person** (`Clint Viegas`) instead of a **channel post**. Relay cannot resolve a typed display name as a Slack member ID.

**Fix (2 minutes):**

1. Open the workflow in Relay.app → edit **Step 3 (Slack)**.
2. Change the action from **“Send message to user”** → **“Send channel message”** (wording may vary).
3. **Clear** the “Destination user” field entirely.
4. Set **Destination channel** to a channel the Relay bot can access, e.g. `#general` or create `#celpipace-seo`.
   - If the channel doesn’t appear in search, paste its Slack link into the channel picker.
   - For **private** channels: in Slack → channel name → Integrations → Add apps → add **Relay.app**.
5. Set **Message** to the HTTP response field: `slackMessage` (from step 2).
6. Save and **Run once** to test.

**If you prefer a DM instead of a channel:**

- Re-pick your account from Relay’s **Slack member dropdown** (do not type “Clint Viegas” manually).
- Slack member IDs look like `U047FNLGQ4` — display names often fail.

**Verify step 2 succeeded before debugging Slack:** the HTTP step should return JSON with `ok: true` and a populated `slackMessage`. If that works (you see the SEO text in Relay’s run preview), only step 3 needs reconfiguration.

### Direct Slack from Vercel (optional bypass)

If Relay’s Slack step keeps failing, you can post from the API instead:

1. Create a Slack **Incoming Webhook** for your target channel.
2. Add `SLACK_WEBHOOK_URL` to Vercel env.
3. Skip step 3 in Relay — the cron job can post when the webhook env is set (see `api/_lib/job-gsc-summary.js`).

Vercel also runs this automatically Mondays 14:00 UTC via cron (backup if Relay is off).
