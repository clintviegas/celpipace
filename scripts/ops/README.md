# Ops scripts

Repeatable, documented maintenance scripts — each one is referenced from a
runbook in `docs/`:

| Script | Runbook |
| --- | --- |
| `apply-coach-patch.mjs` | `docs/SUPABASE_SETUP_ORDER.md` |
| `apply-listening-pilot.mjs` | `docs/LISTENING_TRAP_PLAYBOOK.md` |
| `debug-checkout-live.mjs` | `docs/SUPABASE_SETUP_ORDER.md` |
| `gsc-pull.mjs`, `setup-gsc-vercel.mjs` | `docs/gsc/README.md` |
| `revert-fifa-promo.mjs` | `docs/R2_ASSET_RUNBOOK.md` |
| `seed-blog-posts.mjs` | `docs/SUPABASE_SETUP_ORDER.md` |
| `seed-exemplars.mjs` | `docs/RAG_SETUP.md` |
| `upload-r2.mjs` | `docs/R2_ASSET_RUNBOOK.md`, `docs/SPEAKING_FIFA_REVERT.md` |
| `verify-stripe-subscriptions.mjs` | `npm run stripe:verify` |
| `sync-seo-blog-titles.mjs` | ad-hoc: re-syncs SEO-critical blog post fields to Supabase |
| `load-env.mjs` | shared `.env.local` loader used by the scripts above |

Also runnable directly via the `npm run` aliases in `package.json`
(`gsc:pull`, `stripe:verify`, `supabase:coach-patch`, `revert:fifa-promo`).
