# Temporary FIFA World Cup — S3/S4 Set 1

## How speaking images work (important)

All speaking scene images use **`/images/S3/{n}.png`** and **`/images/S4/{n}.png`**.

The app loads them via `asset()` in [`src/data/constants.js`](../src/data/constants.js), which prefixes **`VITE_CDN_URL`** (Cloudflare R2) in production. Files live in `public/images/` locally, are **gitignored**, and are uploaded with:

```bash
node scripts/upload-r2.mjs celpipace
# or single files:
npx wrangler r2 object put "celpipace/images/S3/1.png" --file="public/images/S3/1.png" --remote
npx wrangler r2 object put "celpipace/images/S4/1.png" --file="public/images/S4/1.png" --remote
```

Do **not** use `/Speaking_fifa/...` for production — that path is not on R2 and will break when `VITE_CDN_URL` is set.

## FIFA swap (set 1)

- **S3:** topic `FIFA World Cup Final`, `image_url: "/images/S3/1.png"`
- **S4:** topic `FIFA World Cup Final — Predict`, `image_url: "/images/S4/1.png"`
- **Source PNG:** copy `public/Speaking_fifa/fifa-wc-final.png` → `public/images/S3/1.png` and `public/images/S4/1.png`, then upload to R2
- **Backup branch:** `backup/s3-set1-park` — original park images config

## Revert to park scene

1. Restore park PNGs to R2 at `images/S3/1.png` and `images/S4/1.png` (from your local backup or re-export)
2. Restore JSON:

```bash
git checkout main
git pull origin main
git checkout backup/s3-set1-park -- src/data/speakingQuestions.json
git commit -m "revert: restore S3/S4 set 1 park scene"
git push origin main
```

Optional: `git rm public/Speaking_fifa/fifa-wc-final.png` if removing the temp asset from the repo.
