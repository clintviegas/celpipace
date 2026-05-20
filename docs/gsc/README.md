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
