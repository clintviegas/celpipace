# Architecture

CELPIPACE is a Vite + React app with Vercel serverless functions and a Supabase
Postgres database. Everything below is grouped by **frontend**, **backend**,
**database**, and the supporting **infra / build / docs** pieces.

```
celpipace/
├── src/             FRONTEND  — React UI, runs in the browser
├── api/             BACKEND   — Vercel serverless functions (Node.js)
├── supabase/        DATABASE  — Postgres schema, RLS, RPCs
│   ├── schema/      hand-applied, idempotent — the original build-out, by domain
│   └── migrations/  timestamped, CLI/MCP-applied — everything going forward
├── scripts/         BUILD     — pre-render, sitemap, one-time seeders
├── public/          STATIC    — files copied verbatim into the build output
├── docs/            DOCS      — setup guides per subsystem
├── tests/           TESTS     — Playwright end-to-end suites
├── vercel.json                — routes, redirects, crons
├── vite.config.js             — build config (chunking)
├── eslint.config.js           — linting
├── package.json               — deps, build/dev scripts
├── index.html                 — Vite entry HTML
└── ARCHITECTURE.md            — this file
```

> **Why are `src/`, `api/`, `supabase/`, `public/`, and `index.html` at the
> repo root?** Vite, Vercel, and Supabase each hard-code these paths. Moving
> any of them breaks the build or the deploy. The structure below is the
> idiomatic shape — work within it, not against it.

---

## Frontend — `src/`

Everything the browser runs. Built with Vite and bundled to `dist/` on deploy.

| Path | What lives here |
| --- | --- |
| `App.jsx` · `main.jsx` | React entry + top-level routes |
| `pages/` | One file per route (`BlogPage`, `ExamPage`, `AdminPage`, `PracticeSetPage`, etc.) |
| `components/` | Reusable UI (Navbar, Footer, SEO, CRSBooster, …) |
| `context/` | React context providers — auth, theme, etc. (`AuthContext.jsx`) |
| `hooks/` | Custom hooks (`useAuthGate`, etc.) |
| `data/` | Static seed data — `constants.js`, `blogData.js` (fallback for the DB-backed blog), `seoPages.js` |
| `lib/` | Browser-side helpers — Supabase client init, admin client, analytics |
| `assets/` | Images, audio files served by the React app |
| `index.css` · `App.css` | Global styles |

**Talks to:** the backend via `fetch('/api/...')`, and Supabase directly via
`@supabase/supabase-js` for read-only data and Google OAuth.

---

## Backend — `api/`

Vercel serverless functions. One file per endpoint, deployed individually.
**Must live at `/api` at the repo root — Vercel will not pick them up
anywhere else.**

| File | What it does |
| --- | --- |
| `admin.js` | Dispatcher for admin-only actions (refund, deploy hook trigger). Verifies the bearer token belongs to the admin email. |
| `auth-consent.js` | Records terms / marketing consent after sign-in |
| `cancel-subscription.js` | Stripe subscription cancellation |
| `chatbot.js` | OpenAI-backed help chatbot |
| `contact.js` | Receives contact-form submissions, emails them out |
| `create-checkout-session.js` | Creates a Stripe Checkout session |
| `cron-sweep.js` | Daily cron (see `vercel.json` → crons) — expires premium, retries queued emails |
| `customer-portal.js` | Stripe Customer Portal session creator |
| `email-unsubscribe.js` | One-click unsubscribe handler |
| `on-signup.js` | Welcome email + Brevo list sync on first sign-in |
| `score.js` · `_lib/score-speaking.js` · `_lib/score-writing.js` | OpenAI-backed CLB scoring for Writing / Speaking transcripts |
| `stripe-webhook.js` | Stripe webhook → updates `profiles`, sends emails |

**Shared backend helpers — `api/_lib/`**

| File | Purpose |
| --- | --- |
| `auth.js` | Bearer token → Supabase user resolution + admin check |
| `email.js` · `brevo.js` | Transactional email send + Brevo list management |
| `rateLimit.js` | Per-user rate limiting backed by `api_rate_log` table |
| `embeddings.js` · `rag.js` | OpenAI embeddings + retrieval for scoring context |
| `audience.js` | Audience-segmenting helpers for marketing emails |

**Auth model:** every authenticated endpoint expects
`Authorization: Bearer <supabase access_token>`. The token is verified server-
side using the service-role key.

---

## Database — `supabase/`

Postgres schema and RLS policies, in two layers:

- **`supabase/schema/`** — the original build-out. 31 hand-written, idempotent
  files (`CREATE TABLE IF NOT EXISTS`, safe to re-run), applied directly via
  the Supabase dashboard or MCP rather than through migration tooling.
  Grouped by domain (`core`, `billing`, `practice`, `coach-ai`, `marketing`,
  `ops`) — not by apply order, since several were written and run out of
  filename order. The actual required order, with dependencies, is
  `docs/SUPABASE_SETUP_ORDER.md`; that file is authoritative, this table is
  just a map of what's where.
- **`supabase/migrations/`** — timestamped, CLI/MCP-applied migrations.
  Everything going forward lives here instead of adding another file to
  `schema/`.

| File | Tables / objects it creates |
| --- | --- |
| `supabase/schema/core/admin_hardening.sql` | `profiles` trigger (`handle_new_user`), admin RLS, activity RPCs |
| `supabase/schema/ops/phase5_security_hardening.sql` | RLS lockdown across all user tables |
| `supabase/schema/ops/phase1_audit_tables.sql` | `subscription_events`, `webhook_events`, `email_log` |
| `supabase/schema/billing/phase3_expire_premium_rpc.sql` | RPC used by the daily cron |
| `supabase/schema/ops/phase4_rate_log.sql` | `api_rate_log` table + `check_rate_limit` RPC |
| `supabase/schema/billing/subscriptions_schema.sql` | Stripe-related columns + `cancellation_feedback` |
| `supabase/schema/billing/payments_schema.sql` | `payments` (Stripe receipts) |
| `supabase/schema/practice/test_sessions_schema.sql` | Mock + practice session state (selected answers, scores, meta) |
| `supabase/schema/practice/practice_attempts.sql` | One row per completed practice set |
| `supabase/schema/practice/progress_schema.sql` | `user_progress` JSONB blob |
| `supabase/schema/practice/writing_schema.sql` | Writing-specific tracking |
| `supabase/schema/ops/analytics_events.sql` | Page-view + click analytics for the admin dashboard |
| `supabase/schema/marketing/contact_messages.sql` | Contact-form submissions |
| `supabase/schema/billing/coupons.sql` | Coupons + redemptions |
| `supabase/schema/marketing/loops_schema.sql` · `supabase/schema/marketing/marketing_schema.sql` · `supabase/schema/coach-ai/rag_schema.sql` | Loops/Brevo audience + embedding store |

**Blog CMS table:** `public.blog_posts` (added via Supabase MCP migration
`create_blog_posts_table`, no file in this folder — see commit history).

Every user-table policy follows the same pattern: read your own rows
(`auth.uid() = user_id`), admin-by-email gets full access via
`lower(auth.jwt() ->> 'email') = 'clint.viegas@gmail.com'`.

---

## Build / scripts — `scripts/`

Three tiers, in order of how often you'll touch them:

| Folder | What's in it |
| --- | --- |
| `scripts/build/` | Wired into `npm run build`/`verify` — runs on every build. `check-db-catch.mjs` and `test-billing-logic.mjs` are static checks; `prerender-seo.mjs` pulls blog posts from Supabase, writes per-slug `index.html` with meta tags + JSON-LD, and regenerates `dist/sitemap.xml` (falls back to `src/data/blogData.js` if Supabase is unreachable). |
| `scripts/ops/` | Repeatable maintenance scripts, each documented in a `docs/*_SETUP.md` / runbook and listed in `scripts/ops/README.md`. Run manually via `npm run <alias>` (see `package.json`) or `node scripts/ops/<name>.mjs`. |
| `scripts/archive/` | One-off scripts that already did their job — initial content generation, a completed backfill — kept for reference, not wired into anything. See `scripts/archive/README.md`. |

---

## Infra / config

| File | What it controls |
| --- | --- |
| `vercel.json` | URL routes, 301 redirects, daily cron schedule |
| `vite.config.js` | Code-splitting (icons, supabase, react vendor chunks) |
| `eslint.config.js` | Lint rules |
| `playwright.config.js` | E2E test config (`tests/`) |
| `.env` · `.env.example` | Local env vars (Supabase URL/keys, OpenAI key, Stripe keys, Brevo) |

---

## Docs — `docs/`

Per-subsystem setup walkthroughs:

- `AUTH_DOMAIN_SETUP.md` — Google OAuth + Supabase auth domain
- `PAYMENTS_SETUP.md` — Stripe products, prices, webhooks
- `PERSISTENCE_SETUP.md` — Supabase RLS overview
- `RAG_SETUP.md` — Embeddings + retrieval for scoring
- `SUBSCRIPTIONS_SETUP.md` — Premium plan lifecycle
- `TEST_SESSIONS_SETUP.md` — Mock + practice session storage
- `CELPIP_DB_Audit.{html,pdf}` — DB audit snapshot

---

## How a request flows

**Visitor opens a blog post:**
1. Vercel serves the pre-rendered `dist/blog/<slug>/index.html` (built by `scripts/build/prerender-seo.mjs`)
2. React hydrates and `src/pages/BlogPage.jsx` fetches the full article from `public.blog_posts` for any client-side updates

**User submits a Writing response:**
1. `src/pages/PracticeSetPage.jsx` calls `fetch('/api/score-writing', { Authorization: 'Bearer ...' })`
2. `api/_lib/score-writing.js` (running on Vercel) verifies the token, calls OpenAI, returns CLB scores
3. The same handler stores the attempt in `public.test_sessions` (RLS scoped to `auth.uid()`)

**Admin adds a blog post via the CMS:**
1. `src/pages/AdminPage.jsx` upserts into `public.blog_posts` (RLS allows the admin JWT)
2. Post is immediately visible at `/blog/<slug>` via the SPA shell
3. Admin clicks ⚡ Deploy now → `api/admin.js` calls the Vercel Deploy Hook
4. Next build runs `prerender-seo.mjs`, generates the pre-rendered HTML, and writes a fresh `sitemap.xml`
