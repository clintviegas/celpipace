# Temporary FIFA World Cup — S3/S4 Set 1

Temporary swap active on `main` (commit `0622f7a` or later with FIFA image).

## What changed

- **Set 1 S3** (Describing a Scene): uses `/Speaking_fifa/fifa-wc-final.png`, topic `FIFA World Cup Final`
- **Set 1 S4** (Making Predictions): same image, topic `FIFA World Cup Final — Predict`
- **Backup branch:** `backup/s3-set1-park` — original park config with `/images/S3/1.png` and `/images/S4/1.png`

## Revert to park scene

```bash
git checkout main
git pull origin main
git checkout backup/s3-set1-park -- src/data/speakingQuestions.json
git rm public/Speaking_fifa/fifa-wc-final.png
git commit -m "revert: restore S3/S4 set 1 park scene"
git push origin main
```

Park images on R2 (`/images/S3/1.png`, `/images/S4/1.png`) are unchanged — no R2 re-upload needed.

## CDN note

If `VITE_CDN_URL` is ever set in Vercel, upload the FIFA image to R2 before deploy:

```bash
npx wrangler r2 object put "<BUCKET>/Speaking_fifa/fifa-wc-final.png" \
  --file="public/Speaking_fifa/fifa-wc-final.png"
```

Currently the image is served from Vercel `public/` at `https://www.celpipace.ca/Speaking_fifa/fifa-wc-final.png`.
