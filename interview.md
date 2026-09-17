# CELPIPACE — Technical Interview Prep Guide

Evidence-backed from the codebase. No production user counts are asserted unless derivable from schema/constants.

---

## 1. Business problem

CELPIPACE is an **independent CELPIP General preparation platform** for people preparing for Canadian immigration/work/study English requirements (Express Entry CRS, etc.). It is **not affiliated with CELPIP or Paragon Testing Enterprises** (`README.md`).

It solves:

- **Access to realistic practice** — 1,190+ question items, 220+ practice sets, 8 mock exams (`src/data/constants.js` → `PRODUCT_STATS`)
- **Immediate feedback** — AI scoring for Writing/Speaking with CLB-level rubrics
- **Structured study path** — section drills, mock exams, progress dashboard, study plan, band prediction, spaced-repetition review
- **Monetization** — freemium with Stripe subscriptions for unlimited scoring and full content

---

## 2. Complete user journey

```text
Landing (/) → SEO pages / blog → Section hub (Listening/Reading/Writing/Speaking)
    → Practice set (timed, MCQ or open response)
        → [Optional] Google sign-in via AuthModal (terms + marketing consent)
        → Progress saved to Supabase (practice_attempts, user_progress, test_sessions)
    → Writing/Speaking: submit → /api/score → CLB report
    → Speaking: record → /api/transcribe-audio → edit transcript → /api/score
    → Hit free limits → Upgrade modal → /payment → Stripe Checkout
    → Webhook activates premium → full access (mock exams, all sets, unlimited AI)
    → Manage subscription (/subscription) → Stripe Customer Portal / cancel API
    → Lifecycle emails (Brevo + cron jobs)
    → Dashboard, Progress, Study Plan, Coach, Review mistakes, CRS calculator
```

**Free tier** (`README.md`, `src/data/constants.js`):

- Parts: `L1–L3`, `R1–R2`, `W1`, `S1`, `S3` (`FREE_PARTS`)
- **Set 1 only** per part (index > 0 locked in `PracticeSetPage.jsx`)
- **2 lifetime** AI writing scores + **2 lifetime** AI speaking scores (`FREE_AI_WRITING_EVALS`, `FREE_AI_SPEAKING_EVALS`)
- **5 coach messages/week** (`FREE_COACH_MESSAGES_WEEKLY`, enforced in `api/_lib/coach-tools/usage.js`)

**Premium**: mock exams (`RequirePremium` in `src/App.jsx`), all sets, unlimited AI scoring, full progress/coach.

---

## 3. High-level architecture

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 8, React Router 7, CSS + Framer Motion |
| Backend | Vercel serverless functions (`api/*.js`) |
| Database | Supabase Postgres + RLS + RPCs (`supabase/`) |
| Auth | Supabase Auth (Google OAuth) |
| AI | OpenAI GPT-4o (scoring), Whisper (transcription), GPT-4o-mini (coach/support) |
| Payments | Stripe Checkout, Billing Portal, webhooks |
| Email/CRM | Brevo (transactional + list-based automations) |
| Deploy | Vercel (`vercel.json`), static assets optionally on CDN (`VITE_CDN_URL` in `src/data/constants.js`) |
| Tests | Playwright smoke tests (`tests/e2e/smoke.spec.js`) |

**Request pattern** (`ARCHITECTURE.md`):

- Browser reads/writes user data via Supabase client (RLS-scoped)
- Sensitive ops (scoring, payments, webhooks, admin) go through `/api/*` with Bearer token + service role

---

## 4. Frontend, backend, database, external services

### Frontend (`src/`)

- **Routes**: `src/App.jsx` — public marketing, practice, dashboard, admin, payment, legal
- **Auth state**: `src/context/AuthContext.jsx` — profile, `isPremium`, Google OAuth
- **Practice UI**: `src/pages/PracticeSetPage.jsx` — largest page; Listening/Reading/Writing/Speaking layouts
- **Admin**: `src/pages/AdminPage.jsx` + `src/pages/adminExtendedTabs.jsx`
- **Analytics client**: `src/lib/analytics.js` → `analytics_events` table

### Backend (`api/` — **12 deployed functions**, Vercel Hobby limit)

| Endpoint | Role |
|----------|------|
| `score.js` | Dispatches to writing/speaking scorers |
| `transcribe-audio.js` | Whisper + fluency metrics |
| `create-checkout-session.js` | Stripe Checkout |
| `stripe-webhook.js` | Premium state + emails + Brevo lists |
| `cancel-subscription.js` | Cancel at period end |
| `customer-portal.js` | Stripe billing portal |
| `on-signup.js` | Welcome, geo, attribution, consent, Brevo sync |
| `assist.js` | Coach + support chatbot |
| `contact.js` | Contact form |
| `email-unsubscribe.js` | Marketing unsubscribe |
| `admin.js` | Admin dispatcher (refunds, coupons, analytics RPCs) |
| `cron.js` | Cron dispatcher (9 jobs) |

**Parked**: `api/_disabled/` — `study-recommendations.js`, old Mailchimp/Loops integrations

### Database (`supabase/`)

Key tables:

| Table | Purpose |
|-------|---------|
| `profiles` | User profile, premium flags, Stripe IDs, marketing consent |
| `practice_attempts` | Per-set completion history |
| `test_sessions` | Mock exam + in-progress session state |
| `essay_embeddings` | RAG store: submissions + exemplars + pgvector embeddings |
| `review_items` | SM-2 spaced repetition for missed MCQs |
| `webhook_events` | Stripe event archive + idempotency |
| `subscription_events` | Interpreted billing lifecycle |
| `payments` | Stripe receipts |
| `checkout_intents` | Abandoned checkout tracking |
| `analytics_events` | Product analytics |
| `email_log` | Outbound email audit |
| `api_rate_log` | Rate limiting |
| `coach_usage` | Free-tier coach message counts |
| `contact_messages`, `coupons`, `blog_posts` | Support, promos, CMS |

### External services

- **Supabase** — Auth, Postgres, RLS
- **Stripe** — Subscriptions, webhooks, portal
- **OpenAI** — Scoring, Whisper, coach
- **Brevo** — Email + CRM lists (`api/_lib/brevo.js`, `api/_lib/email.js`)
- **ipapi.co** — Geo lookup on signup (`api/on-signup.js`)
- **Vercel** — Hosting, crons, deploy hooks

---

## 5. Writing evaluation workflow

**Client** (`src/pages/PracticeSetPage.jsx` → `scoreWithAI`):

1. User writes response in timed practice UI
2. `POST /api/score` with `{ section: 'writing', responseText, prompt, criteria, taskType }`
3. Handles 401/403 (`free_limit_reached`)/429/500; shows `AIFeedbackPanel`

**Server** (`api/_lib/score-writing.js`):

1. **Auth** — `requireUser()` (`api/_lib/auth.js`)
2. **Rate limit** — 30/hour per user (`api/_lib/rateLimit.js`)
3. **Free tier gate** — count rows in `essay_embeddings` where `source='submission'`; max 2
4. **Validation** — required strings, max 4000 chars response / 2000 prompt
5. **RAG (best-effort)**:
   - Embed response (`api/_lib/embeddings.js`)
   - Retrieve top-3 exemplars via `match_essay_exemplars` RPC
   - Retrieve user weakness profile via `get_user_weakness_profile` RPC
6. **Prompt assembly** — system prompt with CELPIP rubric, CLB descriptors, length rules, calibration anchors (`score-anchors.js`), exemplars, weakness block
7. **Dual-pass scoring** — two parallel GPT-4o calls (`runDualPassScoring` in `api/_lib/score-shared.js`)
8. **Hard rules** — length caps, structure caps, dimension alignment
9. **Persist** — `persistScoredEssay()` → `essay_embeddings` (feeds future RAG)
10. **Response** — `{ overall, clbBand, scores, feedback, suggestions, rag, scoring }`

---

## 6. Speaking workflow (recording → Whisper → evaluation)

**Recording** (`src/hooks/useAudioRecorder.js` + `PracticeSetPage.jsx` Speaking layout):

1. Prep timer → speak timer (CELPIP-style)
2. `MediaRecorder` + `getUserMedia` captures audio (webm/opus preferred)
3. On finish: blob → base64 → `POST /api/transcribe-audio`
4. Transcript + fluency metrics stored per prompt index; user can edit before scoring

**Transcription** (`api/transcribe-audio.js`):

- OpenAI Whisper with `verbose_json` + word timestamps
- Computes: WPM, filler count/rate, pause stats, confidence proxy
- Rate-limited; requires auth

**Scoring** (`scoreSpeakingWithAI` → `api/_lib/score-speaking.js`):

- Same pipeline as writing, but dimension **`listenability`** instead of `readability`
- **`fluencyMetrics`** sanitized and injected into prompt as `AUDIO FLUENCY METRICS` block
- Hard rules can cap `listenability` for disfluency (low WPM + high fillers, many long pauses)

---

## 7. Prompts, rubrics, and structured outputs

### Rubrics

Built into system prompts in `score-writing.js` / `score-speaking.js`:

- Dimensions: **Task Fulfillment, Coherence, Vocabulary, Readability/Listenability**
- CLB band descriptors (3–12)
- Task-specific rules (W1 email vs W2 opinion/survey; W2 has explicit "answer development arc")
- Calibration anchors from `api/_lib/score-anchors.js`

### RAG context

- **Exemplars** — similar high-scoring responses (`api/_lib/rag.js`)
- **Weakness profile** — user's recent per-dimension averages

### Structured outputs

`api/_lib/score-shared.js`:

- OpenAI **`json_schema`** mode with `strict: true`
- Schema: `{ scores: { taskFulfillment, coherence, vocabulary, readability|listenability }, feedback, suggestions[] }`
- Eliminates manual JSON parse failures

### Dual-pass

- Two parallel calls at temperatures **0.15** and **0.4**
- Per-dimension scores **averaged**
- **`agreement`** metric when passes diverge
- Feedback from higher-temperature pass; suggestions merged/deduped (max 4)

### Post-AI deterministic layer

`applyHardRules()` clamps scores for:

- Word-count minimums
- Missing paragraph structure (writing)
- Disfluency from audio metrics (speaking)
- No dimension > taskFulfillment + 2

---

## 8. Second evaluation / review step

**There is no separate human or "reviewer AI" pass after scoring.**

What exists instead:

| Mechanism | What it is |
|-----------|------------|
| **Dual-pass scoring** | Two model calls averaged in one request — not a sequential review step |
| **Hard rules** | Deterministic post-processing clamps |
| **Review page** (`/review`) | **SM-2 spaced repetition** for missed Listening/Reading MCQs (`supabase/review_schema.sql`) — not AI re-evaluation |

Writing/Speaking are **single-request pipelines** ending at persist + JSON response.

---

## 9. Stripe checkout, webhooks, subscriptions, access control

### Checkout (`api/create-checkout-session.js`)

- Plans: weekly / monthly / annual (price IDs from env)
- Coupons: `CELPIP25` (25% first checkout), `CELPIP50` (50% weekly promo — front-end urgency only, no server cap)
- Metadata: `user_id`, `email`, `plan` on session + subscription
- Logs `checkout_intents` row (fire-and-forget)
- Success URL: `/subscription?checkout=success`

### Webhook (`api/stripe-webhook.js`)

**Explicit design**: *"Frontend NEVER writes is_premium; only this handler does."*

Events handled:

- `checkout.session.completed`, `customer.subscription.created/updated/deleted`
- `invoice.paid`, `invoice.payment_failed`, `charge.refunded`

Updates `profiles`: `is_premium`, `subscription_status`, `current_plan`, Stripe IDs, period dates, `cancel_at_period_end`

Side effects: transactional emails, Brevo list moves (premium/free/cancelled), `subscription_events` log

### Cancel (`api/cancel-subscription.js`)

- Sets Stripe `cancel_at_period_end`
- Collects optional cancellation feedback → `cancellation_feedback`
- Sends confirmation email

### Access control

| Layer | Mechanism |
|-------|-----------|
| **Client UI** | `isPremium` from `AuthContext` — also checks `premium_expires_at` window |
| **Route guard** | `RequirePremium` wraps mock exams |
| **Practice gating** | `FREE_PARTS` + set index in `PracticeSetPage.jsx` |
| **API enforcement** | Scoring checks `profiles.is_premium` + `essay_embeddings` count; mock requires premium route |
| **DB function** | `is_premium_active()` in `supabase/subscriptions_schema.sql` |

Admin bypass: hardcoded admin email gets `isPremium` always (`AuthContext.jsx`).

---

## 10. Source of truth for payments and access

**Stripe is the billing source of truth.** **`profiles` in Supabase is the application source of truth for access**, written **only** by:

1. **`api/stripe-webhook.js`** (primary) — service role
2. **`api/admin.js`** — manual grants/refunds (admin-only)
3. **Coupon redemption** (admin/coupon flows)
4. **Daily cron sweep** — `expire_premium_users()` RPC demotes stale rows if webhook missed (`api/_lib/job-sweep.js`)

The **browser never sets `is_premium`**. Client `isPremium` is a **read-only mirror** with an expiry-window guard.

Audit trail: `webhook_events`, `subscription_events`, `payments`.

---

## 11. Brevo emails, CRM segmentation, lifecycle automation

### Transactional (`api/_lib/email.js`)

- All sends via **Brevo transactional API**
- **`email_log`** — queued → sent/failed audit
- Templates: welcome, receipt, cancel, past-due, refund, marketing nudges, abandoned checkout

### CRM lists (`api/_lib/brevo.js`)

Env-configured list IDs:

- `BREVO_LIST_ID` — main users (signup)
- `BREVO_LIST_FREE`, `BREVO_LIST_PREMIUM`, `BREVO_LIST_CANCELLED`

**List membership triggers Brevo automation scenarios** (configured in Brevo UI, not in code).

Webhook moves contacts between lists on subscribe/cancel.

### Cron-driven lifecycle (`vercel.json` → `api/cron.js`)

| Job | Purpose |
|-----|---------|
| `marketing` | Free→Premium drip (days 1,2,5,7,14,21) — `api/_lib/job-marketing.js` |
| `abandoned` | Checkout abandonment D1/D3 — `api/_lib/job-abandoned.js` |
| `winback` | Cancelled user win-back |
| `reminders` | Practice reminders |
| `examcountdown` | Exam date nudges |
| `digest` | Weekly digest |
| `broadcast` | Admin broadcasts |
| `sweep` | Expire premium + prune rate logs |
| `gsc-summary` | Search Console summary (weekly) |

**Idempotency**: `marketing_sends` UNIQUE `(user_id, campaign_key)` — insert before send.

**Consent gates**: `marketing_consent = true`, `marketing_unsubscribed_at IS NULL`, not premium (for free nudges).

---

## 12. Authentication and authorization

### Auth

- **Supabase Auth + Google OAuth** (`AuthContext.jsx` → `signInWithOAuth`)
- Redirect origin whitelist: localhost, `celpipace.ca`, `www.celpipace.ca`
- On sign-in: profile loaded from `profiles` (created by `handle_new_user` trigger)
- **`/api/on-signup`** — attribution, geo, terms/marketing consent, welcome email, Brevo sync (idempotent via `loops_synced_at`)

### API auth

- `Authorization: Bearer <supabase_access_token>`
- Server verifies via `supabase.auth.getUser(token)` with **service role** client
- Returns service client for DB writes bypassing RLS

### Authorization patterns

- **RLS**: users read/write own rows; admin email gets broad read via policies or `is_app_admin()`
- **Admin API**: bearer user must match `ADMIN_EMAIL` in `api/admin.js`
- **Cron**: `CRON_SECRET` Bearer header when set
- **Premium**: enforced server-side on scoring; client gates are UX-only

---

## 13. Error handling, validation, logging, retries, duplicate prevention

| Area | Implementation |
|------|----------------|
| **Validation** | Method checks, required fields, string length limits, fluency metric sanitization |
| **Rate limiting** | Supabase `api_rate_log` — fail-open on DB errors (`rateLimit.js`) |
| **Stripe idempotency** | `webhook_events.stripe_event_id` UNIQUE; skip if `processed=true`; mark processed before side effects |
| **Email idempotency** | `marketing_sends` unique keys; `on-signup` gated by sync timestamp |
| **RAG fail-open** | Embedding/retrieval errors → scoring continues with anchors only |
| **Logging** | `console.error/warn` in API routes; `email_log`, `webhook_events.processing_error`, `subscription_events` |
| **Frontend resilience** | `ErrorBoundary`, `lazyWithRetry` (local — may not be deployed) |
| **Stripe retries** | Webhook returns 200 even on soft failures after persisting payload |
| **Free tier** | Server-side count in `essay_embeddings` — not client-trusted |

---

## 14. Deployment and production architecture

```text
User → Vercel Edge/CDN (dist/ static SPA)
     → /api/* serverless functions (Node.js)
     → Supabase Postgres (RLS)
     → Stripe / OpenAI / Brevo APIs

Build: npm run build → vite build + scripts/prerender-seo.mjs (blog SEO, sitemap)
Crons: vercel.json schedules → /api/cron?job=...
SPA fallback: all routes → index.html (except prerendered blog slugs)
Deploy: Vercel CLI (no git repo in workspace)
```

**Constraints**:

- **12 serverless function limit** → dispatcher pattern for `admin.js` and `cron.js`
- Static audio/images may use **CDN URL** (`VITE_CDN_URL`) — likely Cloudflare R2 based on comment in `constants.js`

---

## 15. Real production issue that was fixed

**Blank white homepage on `www.celpipace.ca`**

- **Cause**: `TESTIMONIALS is not defined` in `src/components/Pricing.jsx` — Pricing is lazy-loaded on homepage; uncaught ReferenceError crashed React before render
- **Fix**: Added `const TESTIMONIALS = []` (section hidden until real quotes exist)
- **Verified**: Deployed; Playwright smoke test now checks `#pricing` visibility
- Fix at lines 32–33 of `Pricing.jsx`

---

## 16. Important technical decisions and trade-offs

| Decision | Rationale | Trade-off |
|----------|-----------|-------------|
| **Supabase RLS + direct client reads** | Fast progress/dashboard without API round-trips | Complex RLS; admin policies needed service-role API for some tabs |
| **Webhook-only premium writes** | Prevents client bypass | Depends on webhook delivery; sweep cron as backup |
| **Dual-pass GPT-4o scoring** | Reduces score variance | ~2× OpenAI cost per submission |
| **RAG via pgvector in Postgres** | No separate vector DB | IVFFlat index tuning; embedding failures handled gracefully |
| **Supabase rate limiting vs Redis** | Reuse existing infra | Extra DB write per check; fail-open on errors |
| **12-function dispatcher pattern** | Vercel Hobby limit | Larger handler files; indirect routing |
| **Whisper server-side vs browser SpeechRecognition** | Accurate transcript + fluency metrics | Mic permission UX; upload latency |
| **Brevo list-triggered automations** | Marketing logic in Brevo UI | Less code visibility; env list IDs must match Brevo setup |
| **Hardcoded admin email** | Simple ops for solo founder | Not scalable multi-admin RBAC |

---

## 17. Deterministic code vs AI

| Deterministic | AI-powered |
|---------------|------------|
| MCQ grading, timers, set locking, free-tier counts | Writing/Speaking CLB scoring |
| SM-2 review scheduling | Whisper transcription |
| Band prediction (weighted avg + linear regression) — `src/lib/bandPrediction.js` | Study Coach tool calls + advice — `api/assist.js` |
| Hard rule score clamps | Support chatbot |
| Stripe webhook → profile mapping | RAG exemplar retrieval uses embeddings (AI to create, vector math to retrieve) |
| Progress aggregation, MRR formulas in admin | (Disabled) study-recommendations endpoint |
| CRS calculator logic | |
| Study plan generation rules — `src/lib/studyPlan.js` | |

---

## 18. Built vs planned / not deployed

### Built and live (in repo)

- Full L/R/W/S practice, mock exams, AI scoring, coach, review SM-2, study plan, learning path, band prediction, flashcards (synonym game), blog CMS, admin panel, Stripe billing, lifecycle crons, analytics

### Parked / disabled

- `api/_disabled/study-recommendations.js` — AI study plan from weakness profile
- `api/_disabled/loops.js`, `mailchimp.js` — replaced by Brevo
- `TESTIMONIALS = []` — UI exists but hidden

### Doc drift / gaps

- `ARCHITECTURE.md` references `auth-consent.js`, `cron-sweep.js` as top-level routes — **consolidated** into `on-signup.js` and `cron.js`
- `PracticeSetPage.jsx` still has comment "REAL-TIME SCORING — STUB" but **calls real `/api/score`**
- Crash hardening (ErrorBoundary, lazyWithRetry) — **in repo, verify deploy status**
- Some Supabase SQL patches (analytics RPC, admin policies) — **may need manual run in Supabase dashboard**

---

## 19. Current weaknesses and improvement priorities

1. **Single hardcoded admin** — no role-based admin system
2. **Vercel 12-function ceiling** — blocks new endpoints without merging/disabled routes
3. **Rate limiter fail-open** — misconfiguration or DB errors allow unlimited requests
4. **No git/CI in workspace** — deploy via CLI; smoke tests not enforced pre-deploy
5. **Client-side premium gate** — UX-only; API must stay authoritative (currently mostly true for scoring)
6. **Dual-pass cost** — scales linearly with submissions
7. **RAG cold start** — new users get anchors-only until submission history builds
8. **Speaking depends on mic + Whisper** — no offline/fallback path
9. **Admin RLS fragility** — required service-role API workarounds (Support/Coupons fixes)
10. **Large monolith pages** — `PracticeSetPage.jsx` is thousands of lines; hard to maintain/test

---

## 20. Metrics confirmable from code or database

**From constants/marketing copy** (not live DB counts):

- 1,190+ question items, 220+ practice sets, 8 mock exams
- 120 listening sets, 46 reading, 40 writing, 120 speaking prompts
- Free tier: 2 AI writing, 2 AI speaking, 5 coach msgs/week

**From schema** (queryable if you have DB access):

| Metric | Source |
|--------|--------|
| Total signups | `profiles` row count |
| DAU/WAU/MAU | `profiles.last_seen_at` (admin computes in `src/lib/adminMetrics.js`) |
| Premium subscribers | `profiles.is_premium` + `premium_source` |
| MRR estimate | Admin formula: weekly $12.99×52/12, monthly $24.99, annual $49.99/12 |
| Practice volume | `practice_attempts` by section/date |
| AI scoring volume | `essay_embeddings` where `source='submission'` |
| Conversion funnel | `analytics_events` (`signup_complete`, `checkout_started`, `checkout_error`, `upgrade_click`) |
| Abandoned checkouts | `checkout_intents` where `converted_at IS NULL` |
| Support tickets | `contact_messages` |
| Email deliverability | `email_log` status |
| Webhook health | `webhook_events.processed`, `processing_error` |
| Cohort retention | `admin_analytics_rpc.sql` RPC |
| Coach usage | `coach_usage.message_count` per week |
| Review queue depth | `review_items` where `due_at <= now()` |

**You cannot confirm from code alone**: actual user counts, revenue, conversion rates, or email open rates — those require production DB or Stripe/Brevo dashboards.

---

## Architecture diagram (text)

```text
                         ┌─────────────────────────────────────┐
                         │           User Browser              │
                         │  React SPA (Vite) + Supabase JS     │
                         └──────────┬──────────────┬───────────┘
                                    │              │
                         Google OAuth│              │ RLS-scoped reads/writes
                                    │              │ (progress, attempts, profile)
                                    v              v
┌──────────────────────────────────────────────────────────────────────────┐
│                            Vercel                                        │
│  ┌─────────────┐   ┌─────────────────────────────────────────────────┐ │
│  │  Static CDN │   │  Serverless API (12 functions)                  │ │
│  │  dist/      │   │  score, transcribe, stripe-*, on-signup, assist,│ │
│  │  + SEO HTML │   │  admin (dispatcher), cron (dispatcher)          │ │
│  └─────────────┘   └───────┬──────────┬──────────┬──────────┬────────┘ │
└────────────────────────────┼──────────┼──────────┼──────────┼──────────┘
                             │          │          │          │
                             v          v          v          v
                    ┌────────────┐ ┌────────┐ ┌─────────┐ ┌────────┐
                    │  Supabase  │ │ OpenAI │ │ Stripe  │ │ Brevo  │
                    │  Postgres  │ │ GPT-4o │ │ Billing │ │ Email  │
                    │  + Auth    │ │ Whisper│ │ Webhooks│ │ Lists  │
                    │  + pgvector│ └────────┘ └─────────┘ └────────┘
                    └────────────┘

Scoring path:
  Practice UI → /api/transcribe-audio (speaking) → /api/score
             → embed + RAG + dual-pass GPT-4o + hard rules
             → essay_embeddings + JSON report

Billing path:
  /payment → Stripe Checkout → webhook → profiles.is_premium
          → Brevo list move + receipt email
```

---

## Ten technical follow-up questions an engineering manager could ask

1. **Why dual-pass scoring instead of a single call or a cheaper model?** What's the measured agreement rate and cost per score?
2. **How do you prevent a user from bypassing premium by calling `/api/score` directly?** Walk through server-side checks.
3. **What happens if Stripe sends `checkout.session.completed` twice, or the webhook times out mid-processing?** Explain `webhook_events` idempotency.
4. **Why is premium written only in the webhook and not optimistically on checkout success redirect?** What's the worst-case user experience?
5. **How does RAG improve scoring quality, and what degrades when embedding retrieval fails?**
6. **Explain the speaking pipeline end-to-end.** Why move from browser SpeechRecognition to Whisper?
7. **How would you add a second admin without hardcoding email in RLS policies?**
8. **The Vercel 12-function limit forced dispatchers — what's your plan when you need more endpoints?**
9. **How is free-tier AI usage counted, and can a user reset it by deleting rows?** (RLS: users can't delete `essay_embeddings` server writes)
10. **What's your observability story for production incidents?** Which tables/logs would you check first for "user paid but isn't premium"?

---

## Claims to verify manually before stating in an interview

| Claim | Verify via |
|-------|------------|
| Production is on `www.celpipace.ca` with latest deploy | Vercel dashboard / live site |
| Crash hardening (ErrorBoundary) is deployed | Check production bundle or deploy log |
| Supabase SQL migrations applied (analytics RPC, admin policies) | Supabase SQL editor / admin tabs work |
| Brevo list IDs and automation scenarios match code | Brevo dashboard |
| Stripe price IDs and webhook endpoint configured | Stripe dashboard |
| Actual user/revenue/conversion numbers | Stripe + Supabase queries |
| CDN/R2 serving audio in production | Check `VITE_CDN_URL` in Vercel env + network tab |
| `CELPIP50` "first 20 users" promo | Code says **no server-side cap** — marketing only (`create-checkout-session.js` comment) |
| Coach free limit is 5/week | Confirm `coach_usage` table exists in prod |
| OpenAI model versions in prod | `SCORING_MODEL`, `WHISPER_MODEL` env vars |
| Whether git/CI exists elsewhere | Workspace has no git repo |
| Affiliation disclaimer accuracy | Still true per `README.md` |
