# Google Search Console — indexing checklist

Request indexing after publishing new URLs or major content changes. GSC → URL Inspection → enter URL → **Request indexing**.

Site property: `https://www.celpipace.ca/`

## Priority URLs (Jul 2026 batch)

### New SEO blog posts

- https://www.celpipace.ca/blog/celpip-mock-test-online-2026
- https://www.celpipace.ca/blog/celpip-practice-test-online-2026
- https://www.celpipace.ca/blog/celpip-speaking-practice-guide-2026
- https://www.celpipace.ca/blog/what-is-the-celpip-test-2026
- https://www.celpipace.ca/blog/celpip-general-vs-celpip-ls
- https://www.celpipace.ca/blog/express-entry-2026-language-scores

### Product / conversion pages

- https://www.celpipace.ca/celpip-speaking-practice/S3
- https://www.celpipace.ca/celpip-mock-test
- https://www.celpipace.ca/celpip-practice-test
- https://www.celpipace.ca/celpip-speaking-practice
- https://www.celpipace.ca/pricing
- https://www.celpipace.ca/payment

### Study Coach (post-RPC fix)

- https://www.celpipace.ca/study-coach

## After FIFA promo revert

Re-request indexing for S3 speaking URL when park scene is restored (content/image change):

- https://www.celpipace.ca/celpip-speaking-practice/S3

## Ongoing

| When | Action |
|------|--------|
| After each blog batch | Index new `/blog/*` URLs |
| Weekly (Monday) | Review GSC report in `#all-celpipace` (Relay cron) |
| After redirect fixes | Inspect former non-www URLs; confirm 301 to www |

## Scripts

```bash
npm run gsc:pull    # Pull performance data locally (requires GSC credentials)
```

Credentials: see `.gsc-credentials.json` / `docs/gsc/` (never commit tokens).

## Sitemap

Sitemap is generated at build time via `scripts/prerender-seo.mjs`. After deploy, confirm new URLs appear in:

- https://www.celpipace.ca/sitemap.xml
