# CELPIPACE — Senior Engineer Walkthrough

Reverse-engineered from the codebase. This is not a file inventory — it is how the system actually behaves, where truth lives, and where it can break.

**Live site:** https://www.celpipace.ca  
**Stack:** React 19 + Vite 8 → Vercel serverless API → Supabase Postgres → Stripe / OpenAI / Brevo

---

## How to use this doc

Read it like a design review. Each section answers: **what problem does this solve, what is the control flow, what is the source of truth, and what would you probe in production?**

At the end: **50 senior interview questions** tied to exact implementation choices in this repo.

---

# 1. High-Level Architecture

## 1.1 System shape

CELPIPACE is a **freemium SPA** with a **thin BFF layer** (12 Vercel functions) for anything that must not run in the browser: AI scoring, Stripe webhooks, admin ops, email, cron jobs.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (React)                          │
│  Routes · Practice UI · AuthContext · Supabase JS (RLS reads)   │
└────────────┬───────────────────────────────┬────────────────────┘
             │ HTTPS                         │ Supabase (JWT)
             ▼                               ▼
┌────────────────────────────┐    ┌───────────────────────────────┐
│   Vercel Serverless API    │    │   Supabase Postgres + Auth    │
│   Bearer auth → service    │    │   RLS · RPCs · pgvector       │
│   role for trusted writes  │    │   triggers · audit tables       │
└────────────┬───────────────┘    └───────────────────────────────┘
             │
     ┌───────┴───────┬──────────────┐
     ▼               ▼              ▼
  OpenAI          Stripe         Brevo
  (score/whisper) (billing)      (email/CRM)
```

## 1.2 Architectural invariant (memorize this)

| Concern | Source of truth | Who writes it |
|---------|-----------------|---------------|
| User identity | Supabase Auth (`auth.users`) | Google OAuth |
| Profile + premium access | `profiles` | **Webhook + admin API only** (trigger blocks client) |
| Billing events | Stripe | Stripe → webhook → DB |
| AI score history | `essay_embeddings` | Scoring API (service role) |
| Practice completion | `practice_attempts` | Client insert (RLS) |
| In-progress tests | `test_sessions` | Client + RPCs (RLS) |
| Marketing sends | `marketing_sends` | Cron (insert-before-send) |

**The browser is never trusted for premium state.** `AuthContext.isPremium` is a read-only mirror with an expiry-window guard.

## 1.3 The 12-function constraint

Vercel Hobby caps serverless functions at **12**. The codebase uses **dispatchers**:

- `api/admin.js` — refunds, coupons, support messages, deploy hook, Brevo test
- `api/cron.js` — 9 scheduled jobs via `?job=`

Parked code lives in `api/_disabled/` (study-recommendations, legacy Mailchimp/Loops).

## 1.4 Data plane vs control plane

| Data plane (user-facing) | Control plane (ops) |
|--------------------------|---------------------|
| Practice sets (mostly static in `src/pages/PracticeSetPage.jsx`) | Admin dashboard (`AdminPage.jsx`) |
| Scoring, transcription | Stripe webhook |
| Progress sync | Cron sweep + marketing jobs |
| Coach chat | `email_log`, `webhook_events` audit |

Content is **code-shipped** (thousands of lines of practice data in JS), not a CMS — except **blog** (`blog_posts` table + SEO prerender).

## 1.5 Trust boundaries

```
UNTRUSTED          SEMI-TRUSTED              TRUSTED
─────────          ────────────              ───────
Browser UI    →    Supabase JWT + RLS   →    Service role API
                   (own rows only)          (webhooks, scoring,
                                            admin, cron)
```

Fluency metrics on speaking scores are **sanitized server-side** (`sanitizeFluencyMetrics`) because the client could otherwise inflate/deflate listenability inputs.

---

# 2. Customer Journey (End-to-End)

## 2.1 Acquisition → activation

```
SEO landing / blog (prerendered) → Homepage
  → Browse free practice (Set 1 only per part)
  → Hit auth gate (timer, scoring, save progress)
  → Google OAuth + terms/marketing consent (AuthModal)
  → AuthContext loads profiles row (handle_new_user trigger)
  → POST /api/on-signup (once): geo, UTM, welcome email, Brevo list
  → analytics_events: signup_complete
```

**Free tier gates** (`src/data/constants.js`):
- Parts: L1–L3, R1–R2, W1, S1, S3 — **Set 1 only** (index > 0 locked)
- 2 lifetime AI writing scores + 2 speaking scores
- 5 coach messages/week

## 2.2 Practice loop (all sections)

```
Select part → PracticeSetPage
  → MCQ sections: grade locally, explanations, upsert review_items on miss
  → Writing: type → POST /api/score
  → Speaking: record → POST /api/transcribe-audio → edit → POST /api/score
  → onComplete → practice_attempts row + user_progress JSONB sync
```

Listening/Reading mistakes feed **SM-2 spaced repetition** (`review_items`), not AI re-scoring.

## 2.3 Monetization loop

```
Upgrade click → /payment → POST /api/create-checkout-session
  → checkout_intents logged (abandonment tracking)
  → Stripe Checkout (metadata: user_id, email, plan)
  → Success redirect /subscription?checkout=success
  → stripe-webhook activates profiles.is_premium (NOT the redirect)
  → Brevo list move + receipt/welcome email
```

Cancel: `/api/cancel-subscription` → Stripe `cancel_at_period_end` → webhook updates profile → access until `current_period_end`.

## 2.4 Retention loop

| Trigger | Mechanism |
|---------|-----------|
| Day 1–21 free nudges | Cron `marketing` → `marketing_sends` idempotency |
| Abandoned checkout D1/D3 | Cron `abandoned` + `checkout_intents` |
| Exam date | Cron `examcountdown` + profile exam fields |
| Weekly digest | Cron `digest` |
| Win-back | Cron `winback` + Brevo cancelled list |

All require `marketing_consent = true` and `marketing_unsubscribed_at IS NULL`.

## 2.5 Premium value unlock

`RequirePremium` wraps mock exams (`/mock-test/:examId`). Premium removes set locks and AI limits. Mock state persists in `test_sessions` (JSONB answers/scores/meta).

---

# 3. AI Scoring Pipeline (Reverse-Engineered)

## 3.1 Entry point

`POST /api/score` → dispatches on `section`:
- `writing` → `api/_lib/score-writing.js`
- `speaking` → `api/_lib/score-speaking.js`

Speaking has a **pre-stage**: `POST /api/transcribe-audio` (Whisper + fluency metrics).

## 3.2 Writing pipeline (state machine)

```
REQUEST
  │
  ├─► requireUser() ──401 if missing/invalid JWT
  ├─► checkRateLimit(scope=score-writing, 30/hr) ──429
  ├─► load profiles.is_premium
  ├─► if !premium: count essay_embeddings(submission) ──403 free_limit_reached (max 2)
  ├─► validate responseText, prompt, lengths
  │
  ├─► [BEST-EFFORT RAG]
  │     embed(responseText) → text-embedding-3-small (1536d)
  │     parallel:
  │       match_essay_exemplars(section, taskType, k=3, minScore=9)
  │       get_user_weakness_profile(userId, window=10)
  │
  ├─► BUILD PROMPT
  │     normalize taskType → W1 | W2
  │     system: rubric + CLB descriptors + length rules
  │     W2 only: answer development arc block
  │     + calibration anchors (score-anchors.js)
  │     + exemplar block + weakness block
  │
  ├─► DUAL-PASS SCORING (score-shared.js)
  │     parallel GPT-4o (SCORING_MODEL env, default gpt-4o-2024-08-06)
  │     temps 0.15 + 0.4
  │     json_schema strict → { scores, feedback, suggestions }
  │     average per-dimension scores
  │     compute agreement metric (informational only)
  │
  ├─► applyHardRules(averaged scores)
  │     length → taskFulfillment cap
  │     no paragraph structure (writing, ≥100 words) → coherence ≤ 7
  │     no dimension > taskFulfillment + 2
  │
  ├─► overall = round(mean(dimensions)), clamp 3–12
  ├─► feedback from pass2 (fallback pass1); suggestions merged max 4
  │
  ├─► [BEST-EFFORT] persistScoredEssay → essay_embeddings
  │
  └─► JSON { overall, clbBand, scores, feedback, suggestions, rag, scoring }
```

## 3.3 Speaking pipeline (delta from writing)

Same core through dual-pass + hard rules, plus:

| Stage | Detail |
|-------|--------|
| Pre-score | MediaRecorder → base64 → Whisper (`verbose_json` + word timestamps) |
| Metrics | WPM, filler rate, pause stats, confidence proxy |
| 4th dimension | `listenability` (not `readability`) |
| Prompt injection | `AUDIO FLUENCY METRICS` block from sanitized client metrics |
| Task type | S1–S8 normalization |
| Hard rules | Low WPM + high fillers → listenability cap; long pauses on short response |
| Response | Echoes `fluency` object back to client |

**Important:** Scoring evaluates **transcript + fluency signals**, not raw audio.

## 3.4 RAG design decisions

- **Single table** `essay_embeddings` for submissions + exemplars (`is_exemplar`, `source`)
- **IVFFlat** cosine index (tuned for ~1k–10k rows)
- **No client INSERT** on embeddings — only service role from scorer
- RAG failure **never blocks** scoring (anchors-only fallback)
- Free-tier count uses `source='submission'` rows — server-enforced

## 3.5 What is NOT in the pipeline

- No MCP
- No human review step
- No conditional third model on low `agreement`
- No GPT-5.x in production (both passes = same model)
- Review tab (`/review`) is SM-2 for MCQs, not AI re-evaluation

## 3.6 Coach (related AI, different pattern)

`/api/assist?mode=coach` uses **OpenAI function calling** (not MCP):
- Tools: `getCoachProfile`, `getRecentAttempts`, `getReviewBacklog`, `getSectionTrends`, `suggestPractice`
- Executed in-process via `runCoachTool()` switch
- Model: `gpt-4o-mini`, max 3 tool rounds

---

# 4. Database Design

## 4.1 Entity clusters

```
AUTH & IDENTITY
  auth.users ──1:1── profiles
                      ├── billing columns (Stripe mirror)
                      ├── marketing consent / attribution
                      └── last_seen_at (DAU/WAU/MAU)

PRACTICE & PROGRESS
  practice_attempts (immutable completion log)
  test_sessions (resumable in-progress state, JSONB)
  user_progress (JSONB blob + streak)
  review_items (SM-2 MCQ mistakes)

AI & RAG
  essay_embeddings (vector(1536), submissions + exemplars)
  RPC: match_essay_exemplars, get_user_weakness_profile

BILLING & AUDIT
  payments (Stripe checkout receipts)
  subscription_events (interpreted lifecycle)
  webhook_events (raw Stripe + idempotency)
  checkout_intents (abandonment)
  cancellation_feedback

MARKETING & COMMS
  marketing_sends (dedupe key per campaign)
  email_log (queued → sent/failed)
  broadcasts

PRODUCT ANALYTICS
  analytics_events (page_view, click, funnel events)
  contact_messages, coupons

COACH
  coach_usage (weekly message count)
  coach_sessions
  RPC: get_user_coach_profile
```

## 4.2 Key schema patterns

### profiles as the access hub

Everything subscription-related denormalizes into `profiles` for fast client reads:
- `is_premium`, `subscription_status`, `current_plan`
- `premium_expires_at`, `cancel_at_period_end`
- `stripe_customer_id`, `stripe_subscription_id`

**Trigger `guard_profile_billing_columns`** raises exception if authenticated user tries to UPDATE billing fields — forces webhook path.

### essay_embeddings as dual-purpose store

| Column | Purpose |
|--------|---------|
| `is_exemplar` / `source` | Filter retrieval vs count free tier |
| `dim_scores` JSONB | Weakness profile aggregation |
| `embedding` vector(1536) | Similarity search |
| RLS | Users read own rows; exemplars world-readable; **no user INSERT** |

### test_sessions resume model

JSONB is source of truth:
- `selected_answers`, `scores`, `meta`
- Partial unique indexes prevent duplicate **active** sessions per user/part/mock

### Idempotency tables

| Table | Key | Purpose |
|-------|-----|---------|
| `webhook_events` | `stripe_event_id` UNIQUE | Stripe retry safety |
| `payments` | `stripe_session_id` UNIQUE | Receipt dedupe |
| `marketing_sends` | `(user_id, campaign_key)` UNIQUE | Email dedupe |

## 4.3 RLS philosophy

- Default: `auth.uid() = user_id`
- Admin: `is_app_admin()` (email-based, centralized in `admin_hardening.sql`)
- Writes for sensitive data: **service role only** (webhook, scoring, cron)
- Some admin UI tabs hit `/api/admin` with service role because RLS policies that query `auth.users` directly broke (`permission denied`) — Support/Coupons patches

## 4.4 RPCs worth knowing

| RPC | Called by |
|-----|-----------|
| `expire_premium_users()` | Cron sweep — backstop if webhook missed |
| `is_premium_active(user_id)` | DB-level premium check |
| `get_user_coach_profile` | Coach tools |
| `get_admin_cohort_retention` | Admin analytics |
| `abandoned_checkout_candidates` | Abandoned email cron |
| `start_or_resume_mock_session` | MockTestPage |

---

# 5. Payment Flow (Reverse-Engineered)

## 5.1 Checkout creation

`POST /api/create-checkout-session`:
1. Validates plan → Stripe price ID from env
2. Optional coupon (`CELPIP25`, `CELPIP50`) → Stripe promotion code
3. Creates Checkout Session with `client_reference_id = userId`, metadata on session + subscription
4. Fire-and-forget `checkout_intents.insert`
5. Returns `{ url }` → browser redirects to Stripe

## 5.2 Webhook as state machine

`api/stripe-webhook.js` header comment: **"Frontend NEVER writes is_premium."**

```
Stripe Event
  │
  ├─► verify signature (raw body)
  ├─► idempotency: webhook_events.processed? → 200 skip
  ├─► upsert webhook_events (processed=false)
  │
  ├─► checkout.session.completed
  │     findProfile(userId | customerId | subId | email)
  │     retrieve subscription → subscriptionToProfilePatch()
  │     UPDATE profiles (is_premium, plan, period dates, Stripe IDs)
  │     UPSERT payments
  │     mark checkout_intents.converted_at
  │     log subscription_events
  │     await welcome email (email_log)
  │     fire-and-forget Brevo list moves
  │
  ├─► customer.subscription.updated/deleted
  │     patch profiles (renewal, cancel-at-period-end, expiry)
  │
  ├─► invoice.paid / invoice.payment_failed
  │     extend premium_expires_at OR flag past_due
  │
  ├─► charge.refunded
  │     revoke premium on full refund
  │
  └─► mark webhook_events.processed=true BEFORE non-critical side effects
```

## 5.3 Profile lookup resilience

`findProfile()` tries in order: userId → customerId → subscriptionId → email.  
Miss → `flagProfileMiss()` writes `processing_error` but still **returns 200 to Stripe** (no pointless retries for orphan payments).

## 5.4 Access enforcement layers

| Layer | Mechanism |
|-------|-----------|
| DB trigger | Blocks client UPDATE of billing columns |
| Webhook | Authoritative premium flip |
| Client | `isPremium` + `premium_expires_at` window check |
| API | Scoring counts `essay_embeddings`; mock behind `RequirePremium` |
| Cron | `expire_premium_users()` demotes stale rows |

## 5.5 Cancel flow

`POST /api/cancel-subscription`:
- Stripe API: set `cancel_at_period_end`
- Optional feedback → `cancellation_feedback`
- Email confirmation
- Webhook eventually syncs profile; user keeps access until period end

---

# 6. Error Handling & Resilience

## 6.1 Fail-open vs fail-closed matrix

| Component | Strategy | Risk |
|-----------|----------|------|
| Auth (`requireUser`) | **Fail-closed** (401) | Correct |
| Free tier / premium gate | **Fail-closed** (403) | Correct |
| Rate limit DB error | **Fail-open** | Abuse if DB down |
| RAG embed/retrieve | **Fail-open** (anchors only) | Lower quality, not outage |
| Brevo sync | **Fail-open** (catch + log) | CRM drift, not billing |
| Stripe webhook | **Persist first**, 200 on soft miss | Audit trail preserved |
| Frontend scoring | Graceful degrade object with `error: true` | User sees message, not white screen |

## 6.2 Idempotency & duplicate prevention

- **Stripe:** `webhook_events.stripe_event_id` — skip if `processed=true`
- **Marketing:** INSERT into `marketing_sends` before send
- **Signup:** `loops_synced_at` gate on `/api/on-signup`
- **Payments:** upsert on `stripe_session_id`
- **Rate limit:** insert-then-count in `api_rate_log`

## 6.3 Validation layers

| Endpoint | Checks |
|----------|--------|
| score-writing | method, auth, rate limit, strings, max chars, premium count |
| score-speaking | + fluency metric sanitization, topic length |
| transcribe-audio | auth, rate limit, base64 audio size cap (8MB decoded) |
| create-checkout | plan, userId, email, coupon whitelist |

## 6.4 Logging & observability

- API routes: `console.error/warn` (Vercel function logs)
- `email_log`: every send attempt with status
- `webhook_events.processing_error`: profile misses, handler failures
- `subscription_events`: interpreted billing timeline
- Admin dashboard: DAU/WAU/MAU, funnel, webhook health (when SQL migrations applied)

**Gap:** No centralized APM/tracing (Datadog/Sentry) in codebase — production debugging is logs + audit tables.

## 6.5 Frontend resilience (recent hardening)

- `ErrorBoundary` — root + route level (`src/components/ErrorBoundary.jsx`)
- `lazyWithRetry` — chunk load failure recovery (`src/lib/lazyWithRetry.js`)
- Auth `getSession().catch()` — avoid infinite spinner
- Playwright smoke tests on homepage/pricing/contact

## 6.6 Known production incident (documented)

**Blank homepage:** `TESTIMONIALS is not defined` in `Pricing.jsx` — lazy-loaded on homepage crashed React. Fix: `const TESTIMONIALS = []`.

---

# 7. Cross-Cutting Trade-offs (Senior Lens)

1. **RLS + direct Supabase reads** — fast UX, complex policies, admin needed service-role API escapes
2. **Dual-pass GPT-4o** — stability vs 2× cost (~still < $0.01/score per code comments)
3. **12-function dispatcher** — cost limit vs larger handlers
4. **Static practice content in JS** — ship speed vs CMS flexibility
5. **Email-based admin** — solo-founder speed vs multi-tenant RBAC
6. **Rate limiter fail-open** — availability vs abuse resistance
7. **Agreement metric unused** — observability hook without control loop yet

---

# 8. Fifty Senior Interview Questions (This Codebase)

## Architecture & boundaries (1–10)

1. Why does premium state live in `profiles` rather than being computed from Stripe on every request?
2. Walk through every code path that can set `profiles.is_premium = true`. Which paths can a malicious client trigger?
3. The app uses both direct Supabase reads and `/api/*` routes. What criteria determine which path a feature uses?
4. Why consolidate cron jobs into `api/cron.js` instead of separate functions?
5. What breaks if you move `api/` to `server/api/` without changing Vercel config?
6. How would you add a thirteenth API endpoint without upgrading Vercel plan?
7. Where is practice content stored, and what are the operational implications of that choice?
8. Explain the trust boundary between `AuthContext.isPremium` and `is_premium_active()` in Postgres.
9. What is the difference between `practice_attempts` and `test_sessions`? When would you query each?
10. Why is blog content in Supabase while most practice data is in frontend JS bundles?

## Auth, RLS & security (11–18)

11. What does `guard_profile_billing_columns` prevent, and what attack does it stop?
12. Why can authenticated users not INSERT into `essay_embeddings`?
13. A user crafts a POST to `/api/score` with someone else's JWT. What happens?
14. Why did Support/Coupons admin tabs need `/api/admin` with service role instead of direct Supabase reads?
15. How is admin identity determined in RLS vs in `api/admin.js`?
16. Speaking fluency metrics come from the client. How does the server prevent gaming listenability scores?
17. What is stored in `signup_ip_hash` and why hash instead of storing raw IP?
18. How does `requireUser` return a service-role Supabase client to callers — and why is that safe?

## AI scoring pipeline (19–28)

19. Describe the exact order: dual-pass averaging vs `applyHardRules`. Why that order?
20. What happens to scoring quality when `embed()` throws? When `match_essay_exemplars` returns empty?
21. Why two temperatures (0.15 and 0.4) instead of one deterministic pass?
22. The `agreement` metric is returned to the client. What would you build on top of it?
23. Why is W2 prompt different from W1, and how does that affect Task Fulfillment caps?
24. Why score speaking transcripts instead of raw audio?
25. How does Whisper output feed into listenability beyond the transcript text?
26. Why use `json_schema` strict mode instead of parsing free-form JSON from the model?
27. Free tier allows 2 writing scores. How is that enforced server-side, and can a user delete rows to reset?
28. What is stored in `essay_embeddings` after a score, and how does it affect the user's *next* score?

## RAG & pgvector (29–33)

29. Why store exemplars and user submissions in one table?
30. Explain the `match_essay_exemplars` RPC security model (SECURITY DEFINER + `is_exemplar=TRUE` filter).
31. When would you rebuild the IVFFlat index, and what symptoms indicate it's needed?
32. How does `get_user_weakness_profile` differ from coach's `getCoachProfile` RPC?
33. What is the minimum exemplar corpus needed before RAG materially helps scoring?

## Payments & subscriptions (34–40)

34. User completes Stripe Checkout and lands on `/subscription?checkout=success` but webhook is delayed. What do they see?
35. Walk through idempotency when Stripe delivers the same `checkout.session.completed` twice.
36. What happens in the webhook when `findProfile` returns null?
37. Why mark `checkout_intents.converted_at` in the webhook rather than on success redirect?
38. User cancels at period end. Which Stripe status keeps `is_premium` true until when?
39. How does `expire_premium_users()` interact with the webhook — redundancy or primary mechanism?
40. Where would you look first for "user paid but isn't premium"?

## Email, cron & lifecycle (41–45)

41. How does the marketing cron prevent double-sending the day-14 nudge?
42. What gates eligibility for abandoned checkout emails?
43. Why are some Brevo calls awaited and others fire-and-forget in the webhook?
44. Explain the `email_log` insert-before-send pattern and what it gives you in an incident.
45. How does one-click unsubscribe (`/api/email-unsubscribe`) work without a DB lookup?

## Error handling, ops & scale (46–50)

46. Rate limiter fails open when Supabase count errors. Under what attack scenario does that matter?
47. A deploy ships a bad lazy chunk. How does `lazyWithRetry` mitigate vs `ErrorBoundary`?
48. What metrics in this codebase can you compute without Stripe dashboard access?
49. If OpenAI scoring latency spikes to 30s, what Vercel constraint do you hit and what mitigations exist?
50. You need multi-admin support without hardcoding email in 40 RLS policies. Design the migration.

---

# 9. Walkthrough Agenda (Suggested Session Order)

Use this doc live in ~60 minutes:

| Time | Section | Drill |
|------|---------|-------|
| 10 min | §1 Architecture + trust boundaries | Draw the diagram from memory |
| 10 min | §2 Customer journey | Trace free user → pay → premium unlock |
| 15 min | §3 AI scoring | Whiteboard writing pipeline; add speaking delta |
| 10 min | §4 Database | Explain profiles + essay_embeddings + webhook_events |
| 10 min | §5 Payments | Webhook state machine + idempotency |
| 5 min | §6 Errors | Fail-open vs fail-closed table |
| 10 min | Pick 5 questions from §8 | Answer out loud |

---

# 10. Verify Before Claiming in Interviews

| Claim | Verify in |
|-------|-----------|
| Production deploy has ErrorBoundary | Vercel deploy log / live bundle |
| Admin analytics SQL applied | Admin tabs load without RPC errors |
| `SCORING_MODEL` in prod | Vercel env vars |
| Actual MRR/user counts | Stripe + Supabase queries |
| Brevo automations match list IDs | Brevo dashboard |
| CDN serves audio | Network tab + `VITE_CDN_URL` |

---

*Generated from codebase reverse-engineering. File paths referenced throughout repo root (`api/`, `src/`, `supabase/`).*
