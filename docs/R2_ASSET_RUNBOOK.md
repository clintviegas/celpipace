# R2 asset runbook (images & audio)

Production serves `public/images/` and `public/audio/` from **Cloudflare R2**, not from the Vercel deploy. Those folders are gitignored.

## Bucket & URLs

| Item | Value |
|------|--------|
| R2 bucket name | `celpipace` |
| Public CDN URL | `https://pub-0a4aab7639024035a20be5b348e78b40.r2.dev` |
| Vercel env | `VITE_CDN_URL` = public CDN URL above |
| App helper | `asset()` in `src/data/constants.js` prefixes CDN in production |

## Prerequisites

```bash
npm i -g wrangler   # or use npx wrangler
wrangler login      # once per machine
```

## Bulk upload (full sync)

After adding or changing files under `public/audio/` or `public/images/` locally:

```bash
node scripts/upload-r2.mjs celpipace
```

This preserves paths like `/audio/L1/set-01/line-00.mp3` and `/images/S3/1.png`.

## Single-file upload

```bash
npx wrangler r2 object put "celpipace/images/S3/1.png" \
  --file="public/images/S3/1.png" --remote

npx wrangler r2 object put "celpipace/images/S4/1.png" \
  --file="public/images/S4/1.png" --remote
```

## Deploy checklist (any image/audio change)

1. Update local file under `public/images/` or `public/audio/`
2. Upload to R2 (single file or bulk script)
3. If browsers may cache old assets, add a cache-buster query in JSON (e.g. `?v=fifa20260716`)
4. Deploy app code to Vercel
5. Verify live URL: `https://www.celpipace.ca/...` loads new media

## Rules

- **Never** reference paths that exist only in git (e.g. `/Speaking_fifa/...`) when `VITE_CDN_URL` is set — use `/images/S3/{n}.png` on R2.
- **Any new `image_url` or audio path in JSON must be uploaded to R2 before deploy.**
- Vercel deploy size limit (~100 MB) — keep heavy assets on R2 only.

## FIFA promo revert

When the temporary FIFA S3/S4 Set 1 promo ends:

```bash
node scripts/revert-fifa-promo.mjs
```

See also [`SPEAKING_FIFA_REVERT.md`](SPEAKING_FIFA_REVERT.md).

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Old image after R2 upload | Browser/CDN cache — bump `?v=` in `speakingQuestions.json` |
| 404 on production | File not uploaded to R2 or wrong bucket key |
| Works locally, broken on Vercel | Local serves `public/`; prod uses CDN — upload to R2 |
