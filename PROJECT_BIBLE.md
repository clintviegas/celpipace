# CELPIPACE — PROJECT BIBLE
### Your interview preparation guide for Martell Group

This document explains the entire CELPIPACE project in plain English. It is written so you can read it, understand it, and then *talk about it confidently* — not just recite files. Read it like a story: what the product is, how it's built, how a request moves through it, where the hard parts are, and how to answer the questions an interviewer will throw at you.

---

## 1. PRODUCT OVERVIEW

### What problem does this solve?
People who want to immigrate to or work in Canada often have to prove their English ability by taking the **CELPIP** exam (Canadian English Language Proficiency Index Program). The official test is expensive and stressful, and good practice material is hard to find. The biggest pain point is the **Writing and Speaking** sections — unlike multiple-choice questions, there's no easy way to know if your answer is good or what score (CLB level) you'd actually get.

**CELPIPACE solves this.** It's an online CELPIP practice platform that gives learners realistic practice questions *and* instant, AI-generated scoring with feedback on their writing and speaking — the same kind of feedback a human examiner gives, but in seconds and for a fraction of the cost.

### Who are the users?
- **Immigrants and prospective immigrants to Canada** preparing for Express Entry / permanent residence, where CELPIP scores convert into CRS points.
- **Students and professionals** who need a certified English score for jobs, universities, or licensing.
- They are typically motivated, time-pressed, and cost-sensitive, often studying on mobile.

### Main features
1. **Practice library** — 1,190+ question items across all four CELPIP skills: Listening, Reading, Writing, Speaking (220+ practice sets).
2. **Full mock exams** — 8 timed, full-length exams that mimic the real test, with saved CLB score reports.
3. **Real-time AI scoring** — Writing and Speaking responses get an instant CLB band (3–12) plus written feedback and improvement tips.
4. **Speaking with audio** — records the user's voice, transcribes it, and analyzes fluency (words-per-minute, filler words, pauses).
5. **Progress tracking & dashboard** — history, weak-spot analysis, score trends over time.
6. **CRS calculator** — converts CELPIP/CLB scores into Express Entry CRS points so users can plan their immigration application.
7. **Subscriptions & billing** — free tier to try it, paid premium via Stripe, with self-serve cancellation and a customer billing portal.
8. **Blog/CMS + SEO** — a content engine that drives organic traffic (this is how the business acquires customers cheaply).
9. **Lifecycle email automation** — welcome emails, reminders, win-back, abandoned-checkout recovery, exam countdowns.

### Business value
- It's a **real, live, revenue-generating SaaS** (https://www.celpipace.ca). It charges money through Stripe and runs a complete subscription business: trials, renewals, refunds, cancellations.
- The **AI scoring is the moat** — it's the thing free PDFs and YouTube videos can't offer.
- The **free-tier-to-paid funnel** is deliberately engineered: free users get *two* free writing evaluations (not one) specifically so they can score, improve, and re-score — experiencing the "it actually works" moment that drives upgrades.
- Heavy investment in **SEO and lifecycle email** keeps customer-acquisition cost low, which is the whole game in a niche education product.

---

## 2. ARCHITECTURE

CELPIPACE is a **modern serverless single-page application**. There is no traditional always-on backend server — instead the "backend" is a set of small functions that spin up on demand.

### The big picture (one sentence)
> A React app runs in the browser, talks to a Supabase Postgres database directly for reads, and calls small Vercel serverless functions for anything sensitive (payments, AI scoring, email) — all deployed on Vercel.

### Frontend stack
- **React 19** — the UI library.
- **Vite 8** — the build tool / dev server (fast, modern bundler).
- **React Router 7** — client-side routing (the URL changes without full page reloads).
- **Framer Motion** — animations.
- **Lucide React** — icon set.
- **react-helmet-async** — manages per-page `<title>`/meta tags for SEO.
- **Plain CSS** — global styles in `index.css` / `App.css` (no heavy CSS framework at runtime; Tailwind v4 is available via the Vite plugin).

### Backend stack
- **Vercel Serverless Functions** (Node.js ≥ 20) — one file per endpoint, living in the `/api` folder. Each function is deployed independently and only runs when called.
- Key trick: because Vercel's free/hobby tier limits you to **12 functions**, the project uses **dispatcher functions** — e.g. one `cron.js` handles 9 different scheduled jobs via a `?job=` query param, and one `admin.js` handles all admin actions via an `action` field. This is a real, explainable engineering constraint and a clean solution.

### Database
- **Supabase PostgreSQL** — a hosted Postgres database with built-in auth and an auto-generated REST API.
- Security is enforced with **Row-Level Security (RLS)**: every table has policies so a user can only read/write *their own* rows (`auth.uid() = user_id`), and the admin (identified by email in the JWT) gets full access.
- **pgvector** extension is used to store text embeddings for the AI scoring's retrieval step (RAG).

### Third-party services
| Service | Used for |
| --- | --- |
| **Supabase** | Database, authentication, file/data storage |
| **OpenAI** | Writing/Speaking scoring (GPT-4o), Whisper (speech-to-text), embeddings, help chatbot |
| **Stripe** | Checkout, subscriptions, billing portal, refunds, webhooks |
| **Brevo** (formerly Sendinblue) | Transactional + marketing email and contact-list management |
| **Vercel** | Hosting, serverless functions, cron jobs, speed insights |
| **Google** | OAuth sign-in (the only login method) |
| **Google Search Console** | SEO performance data, pulled in via a cron job |
| **ipapi.co** | IP-based geolocation to tag where users sign up from |

### Authentication
- **Google sign-in only**, via **Supabase Auth OAuth**. There are no passwords for normal users.
- When a user signs in, Supabase issues a **JWT access token**. The browser stores the session.
- For any sensitive API call, the frontend attaches that token as `Authorization: Bearer <token>`. The serverless function verifies it server-side using the **service-role key**, which means the server never trusts a `userId` sent from the browser — it derives identity from the verified token.
- **Admin** is just one hard-coded email (`clint.viegas@gmail.com`). Both the database (RLS policies) and the API check the JWT email against that value. The admin dashboard even uses a **separate Supabase client** (`adminSupabase.js`) with its own storage key so the admin session is isolated from the normal app session.

### Deployment setup
- **Hosted on Vercel.** Pushing to the repo triggers a build.
- `npm run build` runs Vite to produce the `dist/` folder, then runs `scripts/prerender-seo.mjs` to **pre-render** blog/SEO pages into static HTML with full meta tags + JSON-LD structured data (so Google can crawl them properly even though it's a SPA).
- `vercel.json` controls **routes, 301 redirects** (e.g. old `/writing` → new SEO-friendly `/celpip-writing-practice`), and the **cron schedule** for the 9 background jobs.
- A "Deploy now" button in the admin panel triggers a **Vercel Deploy Hook** so the admin can publish new blog content without touching code.

### Environment variables needed
Public (safe in browser, `VITE_` prefix):
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_CDN_URL`

Server-only secrets (never `VITE_`-prefixed):
- `SUPABASE_SERVICE_ROLE_KEY` — full DB access, used by API functions
- `OPENAI_API_KEY` — scoring, transcription, chatbot
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — payments + webhook verification
- `STRIPE_PRICE_WEEKLY / _MONTHLY / _QUARTERLY (annual)` — the price IDs per plan
- `BREVO_API_KEY`, `BREVO_LIST_ID`, `BREVO_LIST_PREMIUM`, `BREVO_LIST_CANCELLED` — email
- `PUBLIC_SITE_URL`, `EMAIL_FROM`, `CRON_SECRET`

**Golden rule worth stating in interview:** anything with a `VITE_` prefix is bundled into the browser and is public; everything secret lives without that prefix and is only ever read inside serverless functions.

---

## 3. FOLDER STRUCTURE (in plain English)

The repo lives in the `celpipace/` folder. The five top-level folders map cleanly onto the architecture layers.

```
celpipace/
├── src/         FRONTEND — everything the browser runs (React)
├── api/         BACKEND  — Vercel serverless functions (Node.js)
├── supabase/    DATABASE — SQL files defining tables, security, and functions
├── scripts/     BUILD    — one-off + build-time scripts (SEO prerender, seeders)
├── public/      STATIC   — files copied as-is into the build (logo, audio, images)
├── docs/        DOCS     — setup guides per subsystem
├── tests/       TESTS    — Playwright end-to-end tests
└── config files (vercel.json, vite.config.js, package.json, index.html, ...)
```

> **Why everything sits at the repo root:** Vite, Vercel, and Supabase each *hard-code* these folder names (`src`, `api`, `supabase`, `public`). Moving them breaks the build. So the structure is the idiomatic shape for this stack, not an arbitrary choice — good thing to mention if asked "why this layout?"

### `src/` — Frontend
- **`App.jsx`** — the heart of the frontend. Defines every route, decides which navbar to show, and contains the **route guards** (`RequireAuth`, `RequirePremium`) that block access to protected pages. Also lazy-loads almost every page for performance.
- **`main.jsx`** — the entry point; mounts React, registers the service worker (PWA), captures marketing attribution.
- **`pages/`** — one file per screen: `DashboardPage`, `MockTestPage`, `PracticeSetPage`, `CRSCalculatorPage`, `AdminPage`, `BlogPage`, `PaymentPage`, etc.
- **`components/`** — reusable UI pieces: `Navbar`, `Footer`, `AuthModal`, `Pricing`, `SEO`, `ChatWidget`, `UpgradeModal`, charts, etc.
- **`context/AuthContext.jsx`** — global login state. Exposes `user`, `profile`, `isPremium`, `isAdmin`, plus `signInWithGoogle` / `signOut`. Every component reads auth state from here.
- **`hooks/`** — custom React hooks: `useAuthGate` (paywall logic), `usePracticeSet`, `useProgress`, `useTestSession` (resume-where-you-left-off), `useAudioRecorder` (speaking).
- **`lib/`** — browser-side helpers: `supabase.js` (DB client), `adminSupabase.js` (isolated admin client), `apiClient.js` (the authed-fetch wrapper that attaches the Bearer token), `analytics.js`, `attribution.js`, and various score/plan utilities.
- **`data/`** — static seed content: question banks (`readingData.js`, `listeningData.js`, `writingData.js`, the JSON files under `reading/`), `constants.js`, `paymentPlans.js`, `seoPages.js`, `blogData.js` (a fallback copy of blog posts).

### `api/` — Backend (serverless functions)
- **`score.js`** + **`_lib/score-writing.js`** + **`_lib/score-speaking.js`** + **`_lib/score-shared.js`** — the AI scoring engine (the crown jewel).
- **`transcribe-audio.js`** — sends recorded speech to OpenAI Whisper, returns transcript + fluency metrics.
- **`stripe-webhook.js`** — receives events from Stripe and is the *only* place premium status is ever changed.
- **`create-checkout-session.js`**, **`customer-portal.js`**, **`cancel-subscription.js`** — the billing flow.
- **`chatbot.js`** — the help chatbot.
- **`contact.js`**, **`on-signup.js`**, **`email-unsubscribe.js`** — email + onboarding.
- **`admin.js`** — one dispatcher for all admin actions (refunds, manual grants, deploy trigger).
- **`cron.js`** — one dispatcher for all 9 scheduled jobs.
- **`_lib/`** — shared backend helpers: `auth.js` (token → user), `rateLimit.js`, `email.js`, `brevo.js`, `embeddings.js`, `rag.js`, plus the `job-*.js` files (one per cron job).
- **`_disabled/`** — parked routes kept in the tree but not deployed.

### `supabase/` — Database
- One `.sql` file per feature: `admin_hardening.sql` (the `profiles` table + the new-user trigger + admin RLS), `test_sessions_schema.sql`, `payments_schema.sql`, `subscriptions_schema.sql`, `rag_schema.sql`, `phase4_rate_log.sql`, etc.
- Files are **idempotent** (`CREATE TABLE IF NOT EXISTS`) so they can be re-run safely.

### `scripts/` — Build & one-offs
- **`prerender-seo.mjs`** — runs after every build; pulls blog posts from the DB and writes static HTML + sitemap for SEO.
- **`seed-blog-posts.mjs`**, content generators (`gen-r1..r4.mjs`), audio generation, Stripe verification, GSC pull.

---

## 4. REQUEST FLOW (Frontend → API → Backend → Database → Response)

The project actually has **two distinct request patterns**. Knowing both — and *when each is used* — is a strong interview point.

### Pattern A: Direct-to-database (for non-sensitive reads/writes)
The browser talks straight to Supabase using the public anon key. Security comes from **Row-Level Security**, not from a backend.

Example — **loading your dashboard progress:**
1. `DashboardPage.jsx` calls `supabase.from('test_sessions').select(...)`.
2. The request goes directly to Supabase's auto-generated API with the user's JWT attached.
3. Postgres RLS checks the policy: "does `auth.uid()` match this row's `user_id`?" Only the user's own rows come back.
4. React renders them. **No serverless function was involved** — faster and cheaper.

### Pattern B: Through a serverless function (for anything sensitive)
Anything involving secrets (OpenAI key, Stripe key) or trust (premium status, payments) goes through `/api/*`.

Example — **scoring a Writing response (the flagship flow):**
1. User writes an essay in `PracticeSetPage.jsx` and clicks "Score".
2. The frontend calls `authedFetch('/api/score', { section:'writing', responseText, prompt })`. The `apiClient.js` wrapper grabs the current Supabase session and attaches `Authorization: Bearer <token>`.
3. `api/score.js` runs on Vercel, sees `section: 'writing'`, and hands off to `score-writing.js`.
4. That handler:
   - **Verifies the token** (`requireUser`) → resolves the real user ID server-side.
   - **Rate-limits** (30 scores/hour/user) via the `api_rate_log` table.
   - **Checks entitlement**: premium users get unlimited; free users get 2 lifetime writing evals — counted from the `essay_embeddings` table.
   - **Validates input** (length, type).
   - **Builds RAG context** (best-effort): embeds the essay, retrieves 3 similar high-scoring exemplars + the user's recent weakness profile.
   - **Calls OpenAI GPT-4o twice in parallel** at different temperatures (dual-pass), forcing a strict JSON schema for the scores.
   - **Averages** the two passes, **applies hard rules** (e.g. a 40-word essay can't score CLB 12), and computes the final CLB band.
   - **Persists** the essay + embedding + scores back to Postgres for future retrieval.
5. Returns JSON: `{ overall, clbBand, scores, feedback, suggestions }`.
6. The page renders the score card with band, per-dimension breakdown, and tips.

**The mental model to say out loud:** *"Reads and harmless writes go straight to Postgres protected by Row-Level Security. Anything that touches a secret or money goes through a serverless function that verifies the user from their token and never trusts the client."*

---

## 5. APIs / ROUTES

These are the serverless endpoints under `/api`. All authenticated routes expect `Authorization: Bearer <supabase access_token>`.

| Method | Endpoint | What it does | Input | Output | Key files |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/score` | Dispatches to writing/speaking scorer | `{ section, responseText, prompt, ... }` | `{ overall, clbBand, scores, feedback, suggestions }` | `score.js`, `_lib/score-writing.js`, `_lib/score-speaking.js`, `_lib/score-shared.js` |
| POST | `/api/transcribe-audio` | Whisper transcription + fluency metrics | `{ audioBase64, mimeType, durationSec }` | `{ text, metrics:{ wpm, fillerRate, pauses... } }` | `transcribe-audio.js` |
| POST | `/api/create-checkout-session` | Starts a Stripe subscription checkout | `{ userId, email, plan, couponCode }` | `{ url, id }` (redirect URL) | `create-checkout-session.js` |
| POST | `/api/customer-portal` | Opens Stripe billing portal | `{ }` (auth token) | `{ url }` | `customer-portal.js` |
| POST | `/api/cancel-subscription` | Cancels at period end + records feedback | `{ reason, feedback }` | `{ success, cancelAt }` | `cancel-subscription.js` |
| POST | `/api/stripe-webhook` | Receives Stripe events; updates premium state | Raw Stripe event (signed) | `{ received: true }` | `stripe-webhook.js` |
| POST | `/api/on-signup` | Welcome email, geo + consent sync | `{ attribution, examDate, termsAccepted }` | `{ ok, ... }` | `on-signup.js` |
| POST | `/api/contact` | Contact-form submission → email | `{ name, email, message }` | `{ ok }` | `contact.js` |
| POST | `/api/chatbot` | Help chatbot (guests allowed) | `{ messages:[...] }` | `{ reply }` | `chatbot.js` |
| GET/POST | `/api/email-unsubscribe` | One-click unsubscribe | `{ token / email }` | confirmation | `email-unsubscribe.js` |
| POST | `/api/admin` | Admin actions dispatcher | `{ action:'refund'|'sync-subscription'|... }` | varies | `admin.js` |
| GET/POST | `/api/cron?job=<name>` | Runs a scheduled job | `?job=sweep|marketing|...` | `{ ok, stats }` | `cron.js`, `_lib/job-*.js` |

**Frontend routes** (React Router) worth knowing: `/` (home), `/dashboard`, `/exam` + `/mock-test/:examId` (premium-gated), the four `/celpip-<skill>-practice` sections, `/crs-score-calculator`, `/pricing`, `/payment`, `/subscription`, `/blog/:slug`, `/admin`. Old short URLs (`/writing`, `/tips`, `/calculator`) **301-redirect** to SEO-friendly canonical URLs both at the server level (`vercel.json`) and in-app.

---

## 6. DATABASE

Supabase Postgres. The center of everything is the **`profiles`** table — one row per user, holding identity, billing state, and analytics.

### Main tables / models
| Table | What it stores |
| --- | --- |
| **`profiles`** | One row per user. Identity (`email`, `full_name`, `avatar_url`), **billing state** (`is_premium`, `subscription_status`, `current_plan`, `stripe_customer_id`, `stripe_subscription_id`, `premium_expires_at`, `cancel_at_period_end`), geo (`country_code`, `city`, `timezone`), and marketing attribution (UTM fields). Created automatically by a DB trigger when a Supabase auth user is created. |
| **`test_sessions`** | In-progress and completed practice sets and mock exams. Stores `selected_answers`, `scores`, and `meta` as **JSONB** so the user can resume across reloads/devices. Unique indexes enforce "only one active session per user per set." |
| **`practice_attempts`** | One row per completed practice set (history). |
| **`user_progress`** | A JSONB blob of overall progress per user. |
| **`essay_embeddings`** | Scored writing/speaking submissions + their **vector embeddings** (pgvector). Powers RAG retrieval *and* doubles as the free-tier usage counter. |
| **`payments`** | Stripe receipts; status `paid` / `refunded`. Used to check first-purchase coupon eligibility. |
| **`subscription_events`** + **`webhook_events`** | Audit log of every Stripe webhook and its interpreted result. |
| **`email_log`** | Every transactional email sent (with retry state). |
| **`api_rate_log`** | Backs the rate limiter — one row per API call, counted within a time window. |
| **`coupons`** / **`cancellation_feedback`** / **`checkout_intents`** | Coupons & redemptions, cancellation reasons, and abandoned-checkout recovery. |
| **`analytics_events`** | Page views + clicks for the admin dashboard. |
| **`contact_messages`** | Contact-form submissions. |
| **`blog_posts`** | The blog CMS table (added via Supabase migration). |

### Relationships
- `profiles.id` **=** `auth.users.id` (1-to-1; the trigger keeps them in sync).
- Almost every user table has a `user_id` foreign key → `auth.users(id)` with `ON DELETE CASCADE`, so deleting a user cleans up their data.
- `test_sessions.practice_set_id` → `practice_sets(id)`.
- Stripe ties things together by storing `stripe_customer_id` / `stripe_subscription_id` on `profiles`, and `payments`/`subscription_events` reference back to the user.

### How data flows between them
1. User signs in → trigger creates a **`profiles`** row.
2. User practices → **`test_sessions`** (live state) → on completion → **`practice_attempts`** + **`user_progress`**.
3. User scores writing → **`essay_embeddings`** row (embedding + scores) → feeds future RAG retrieval.
4. User subscribes → Stripe → **`stripe-webhook`** updates **`profiles`** billing fields + writes **`payments`** + **`subscription_events`** + **`webhook_events`**.
5. Daily cron reads `profiles.premium_expires_at` and flips expired users back to free.

### Security model (one line worth memorizing)
Every user-table policy = *"read/write your own rows where `auth.uid() = user_id`; the admin email gets everything."* Premium flags can **only** be written by the service role (the webhook), never by the browser.

---

## 7. KEY FEATURES (end-to-end breakdown)

### A. AI Writing/Speaking Scoring
- **What it does:** turns a free-text essay or a spoken answer into a CLB band (3–12) with per-dimension scores, feedback, and quoted suggestions.
- **Frontend:** `PracticeSetPage.jsx`, `WritingPracticePage.jsx`, `useAudioRecorder.js`, score-display components, `apiClient.js`.
- **Backend:** `api/score.js` → `_lib/score-writing.js` / `_lib/score-speaking.js` → `_lib/score-shared.js` (dual-pass engine) → `_lib/rag.js`, `_lib/embeddings.js`, `_lib/score-anchors.js`; speaking also uses `transcribe-audio.js`.
- **Database:** `essay_embeddings` (RAG store + usage counter), RPCs `match_essay_exemplars`, `get_user_weakness_profile`.
- **External:** OpenAI GPT-4o (scoring), Whisper (transcription), OpenAI embeddings.

### B. Subscriptions & Billing
- **What it does:** free vs premium, checkout, renewals, cancellation, refunds, billing portal.
- **Frontend:** `Pricing.jsx`, `PaymentPage.jsx`, `ManageSubscriptionPage.jsx`, `UpgradeModal.jsx`, `paymentPlans.js`.
- **Backend:** `create-checkout-session.js`, `customer-portal.js`, `cancel-subscription.js`, **`stripe-webhook.js`** (the source of truth).
- **Database:** `profiles` (billing fields), `payments`, `subscription_events`, `webhook_events`, `coupons`, `checkout_intents`.
- **External:** Stripe (Checkout, Billing Portal, webhooks), Brevo (premium/cancelled lists).

### C. Authentication & Access Control
- **What it does:** Google login, premium gating, admin isolation.
- **Frontend:** `AuthContext.jsx`, `AuthModal.jsx`, `App.jsx` guards (`RequireAuth`, `RequirePremium`), `useAuthGate.jsx`, `adminSupabase.js`.
- **Backend:** `_lib/auth.js` (`requireUser`), `on-signup.js`.
- **Database:** `profiles` + `handle_new_user` trigger + RLS policies + `is_app_admin()`.
- **External:** Supabase Auth + Google OAuth, ipapi.co (geo).

### D. Practice & Mock Exams with Resume
- **What it does:** timed sections and full mock exams that survive page reloads and switch devices.
- **Frontend:** `MockTestPage.jsx`, `ExamPage.jsx`, `PracticeSetPage.jsx`, `useTestSession.js`, `mockExamState.js`, the `data/` question banks.
- **Backend:** mostly **none** — direct Supabase reads/writes protected by RLS.
- **Database:** `test_sessions` (JSONB resume state), `practice_attempts`, `user_progress`.

### E. SEO Content Engine & Blog CMS
- **What it does:** drives organic traffic; lets the admin publish blog posts that render as crawlable static HTML.
- **Frontend:** `BlogPage.jsx`, `SEOLandingPage.jsx`, `SEO.jsx`, `AdminPage.jsx`.
- **Backend/Build:** `scripts/prerender-seo.mjs` (pre-renders pages + sitemap), `admin.js` (deploy-hook trigger).
- **Database:** `blog_posts`.
- **External:** Vercel Deploy Hook, Google Search Console.

### F. Lifecycle Email Automation
- **What it does:** welcome, reminders, win-back, abandoned-checkout, exam-countdown, digests.
- **Backend:** `cron.js` → `_lib/job-*.js`, `_lib/email.js`, `_lib/brevo.js`, `_lib/audience.js`.
- **Database:** `email_log`, `profiles`, `checkout_intents`.
- **External:** Brevo, Vercel Cron.

---

## 8. HARDEST TECHNICAL PARTS

These are the 4–5 things to lead with when asked "what was technically challenging?"

### 1. Making AI scoring *trustworthy* (not just "call ChatGPT")
- **Why it's hard:** LLMs are inconsistent and over-generous. The same essay can score CLB 7 once and CLB 10 the next time, and the model will happily give a 40-word answer a top score. For a product people *pay* for and base immigration decisions on, that's unacceptable.
- **How the code handles it** (`score-shared.js`, `score-writing.js`):
  1. **Structured Outputs** — forces the model to return a strict JSON schema, so parsing never fails.
  2. **Dual-pass self-consistency** — runs the model **twice in parallel at different temperatures (0.15 and 0.4)**, averages the per-dimension scores, and computes an **agreement signal** to flag when the two passes disagree.
  3. **Hard rule clamps** — deterministic guardrails applied *after* the model: a sub-50-word essay is capped at CLB 4; a single unstructured wall of text can't claim high coherence; no single dimension can exceed task fulfillment by more than 2. This catches hallucinated high scores.
  4. **RAG calibration** — injects 3 real high-scoring exemplars of the same task type plus the user's own recent weakness profile, so the model grades *relative to known-good answers* instead of from thin air.
- **How to explain it:** *"I treated the LLM as one noisy signal, not the final authority. I average two passes for stability, anchor it to real examples via retrieval, and then run deterministic rules on top to clamp impossible scores. The AI proposes; my code disposes."*

### 2. Bulletproof subscription/payment state via webhooks
- **Why it's hard:** money. If the browser could set `is_premium = true`, anyone could unlock premium with dev tools. Webhooks also arrive **out of order, duplicated, and retried**.
- **How the code handles it** (`stripe-webhook.js`):
  - **Premium is *only ever* written by the webhook** using the service-role key — never by the client. The frontend can't grant itself access.
  - **Signature verification** with the webhook secret rejects forged events.
  - **Idempotency:** every event ID is recorded in `webhook_events`; if it's already processed, the handler acks and skips — so a Stripe retry doesn't send duplicate receipts or double-write.
  - **Flexible profile matching** by user_id → customer_id → subscription_id → email, because different events carry different identifiers.
- **How to explain it:** *"Stripe is the source of truth for money, and my webhook is the only writer of premium state. I made it idempotent and signature-verified because webhooks get retried and could be spoofed. The client literally cannot grant itself premium."*

### 3. Speaking: audio → transcript → fluency metrics
- **Why it's hard:** the browser's built-in speech recognition only works in Chrome and gives plain text with no timing. Real CELPIP speaking scores depend on *delivery* — pace, pauses, filler words — which plain text can't capture.
- **How the code handles it** (`transcribe-audio.js`, `useAudioRecorder.js`):
  - Records audio in the browser, base64-encodes it (avoiding a multipart parser on serverless), and sends it to **OpenAI Whisper** with **word-level timestamps**.
  - Derives **WPM, filler rate, pause count/length, and a confidence proxy** (Whisper's avg log-probability) from the timestamps.
  - Those fluency metrics then feed the **hard-rule clamps** (e.g. very slow speech + lots of fillers caps "listenability").
- **How to explain it:** *"Text alone can't score speaking, so I capture the audio, transcribe with word-level timing, and compute objective fluency metrics that feed back into the scoring guardrails."*

### 4. Serving a SPA that Google can actually crawl, on a free tier
- **Why it's hard:** a React SPA ships an empty HTML shell — bad for SEO, and SEO is the customer-acquisition engine. Also, Vercel's hobby tier caps you at 12 functions.
- **How the code handles it:**
  - A **build-time prerender step** (`prerender-seo.mjs`) generates per-page static HTML with real meta tags + JSON-LD and a fresh sitemap, with a fallback data source if the DB is unreachable.
  - **Dispatcher functions** (`cron.js` for 9 jobs, `admin.js` for all admin actions) keep the function count under the 12-function limit.
  - **Server-level 301 redirects** consolidate old URLs into SEO-friendly canonical ones.
- **How to explain it:** *"The SPA is great for users but invisible to crawlers, so I prerender the marketing pages at build time. And I collapsed many endpoints into a couple of dispatchers to stay under the platform's function limit without losing functionality."*

### 5. Resume-anywhere test sessions
- **Why it's hard:** a 60-minute mock exam that loses all answers on an accidental refresh is a dealbreaker. State has to persist reliably without a constant save on every keystroke.
- **How the code handles it:** `test_sessions` stores `selected_answers`/`scores`/`meta` as JSONB; **partial unique indexes** guarantee only one active session per user per set; `useTestSession.js` hydrates and syncs it.
- **How to explain it:** *"I persist exam state as a JSONB document keyed to the user, with DB-level uniqueness so there's exactly one live session. Refresh, close the tab, or switch devices — you pick up where you left off."*

---

## 9. BUGS / RISKS (honest weak spots)

Being able to *critique your own project* is a senior signal. Here are real ones, with the right framing.

### Security
- **Single hard-coded admin email** (`clint.viegas@gmail.com`) appears in code *and* SQL. It works for a solo product, but it's brittle — there's no roles table, and rotating the admin means editing source. **Improvement:** an `admin` role/flag on `profiles` or a dedicated roles table.
- **Rate limiter fails open.** `rateLimit.js` deliberately allows the request through if the rate-log DB query errors. Pragmatic (don't block paying users on a glitch), but under a DB outage the abuse protection silently disappears. Worth calling out as a conscious trade-off.
- **Free-tier counting uses `essay_embeddings` rows.** If embedding ever fails, the persist step is skipped — meaning a free user could occasionally get more than 2 evals. Low impact, but it couples "usage accounting" to a best-effort side effect.
- **Client-side geolocation via ipapi.co** runs from the browser and depends on a free third-party with a daily cap; failures are swallowed (acceptable, but it's an external dependency in the auth path).

### Error handling / resilience
- **Heavy reliance on `.catch(() => {})` / fail-soft.** Good for UX, but a lot of failures are only `console.warn`-ed. Without centralized error monitoring (Sentry-style), silent failures could go unnoticed. **Improvement:** structured logging + alerting.
- **OpenAI is a hard dependency for the core feature.** If OpenAI is down or rate-limits, scoring returns a 500. There's no queue/retry or cached fallback for scoring.

### Scaling
- **Dual-pass scoring doubles OpenAI cost and latency.** Fine at current volume (~under a cent per score), but it's two GPT-4o calls per submission — a cost line that grows linearly with users.
- **Rate limiting via a DB table** (`api_rate_log`) adds a round-trip per call and grows unbounded without cleanup. The code itself notes Redis/Upstash was *deliberately deferred*. At scale you'd move to Redis.
- **Direct-to-DB reads** put query load straight on Postgres with no caching layer; popular pages (blog) are mitigated by prerendering, but dynamic dashboards aren't cached.

### Validation / correctness
- **Plan aliasing quirk:** `quarterly` maps to `annual` in several places — a historical rename that's handled but easy to trip over.
- **Audio size limits** are generous (8 MB) and base64 inflation eats into Vercel's 4.5 MB body limit; very long recordings could fail.

### Architecture / duplication
- **`subscriptionToProfilePatch` logic is duplicated** in both `stripe-webhook.js` and `admin.js` (plus the plan-by-price maps). A shared helper would reduce drift risk. This is the clearest "I'd refactor this" example.
- **Premium-checking logic exists in three places** (AuthContext client guard, `score-writing` server check, webhook writer). It's intentional defense-in-depth, but the rules must stay in sync.

**How to frame all of this in interview:** *"Most of these are conscious trade-offs for a solo, cost-sensitive product — fail-open rate limiting, no Redis yet, a single admin. I know exactly what I'd change first as it grows: centralize the Stripe-patch logic, add error monitoring, and move rate limiting to Redis."*

---

## 10. INTERVIEW-READY ANSWERS

### "Walk me through your project."
> "CELPIPACE is a live SaaS that helps people prepare for the CELPIP English exam — the test many use for Canadian immigration. The standout feature is **real-time AI scoring**: users write an essay or record a spoken answer and get an instant CLB band with examiner-style feedback, which is normally expensive and slow to get.
>
> Technically it's a React 19 single-page app built with Vite, backed by a Supabase Postgres database and a set of Vercel serverless functions. I use two patterns deliberately: harmless reads and writes go straight to Postgres protected by Row-Level Security, while anything sensitive — AI scoring, payments, email — goes through serverless functions that verify the user from their auth token and never trust the browser.
>
> It's a full business, not a demo: Google sign-in, Stripe subscriptions with webhooks and refunds, lifecycle email automation through Brevo, a blog CMS with build-time SEO prerendering, and nine scheduled cron jobs. The hardest and most interesting part was making the AI scoring *trustworthy* — I'll happily go deep on that."

### "What was the hardest feature?"
> "Making AI scoring reliable enough to charge for. A naive 'call the model and show the number' approach is too inconsistent — the same essay scores differently each time, and the model over-rewards short answers. So I built a pipeline: I force a strict JSON schema for the output, run the model **twice in parallel at different temperatures and average the scores**, and compute an agreement signal when the passes disagree. Then I apply **deterministic hard rules** on top — a 40-word essay is capped at a low band, an unstructured wall of text can't claim high coherence. Finally I use **retrieval (RAG)**: I embed the answer, pull three real high-scoring exemplars of the same task type plus the user's recent weak spots, and feed those in as calibration. The principle is: the AI proposes, my deterministic code disposes."

### "How is your backend structured?"
> "The backend is serverless — small Node functions on Vercel under `/api`, one per concern, that only run when called. There's no always-on server. Because Vercel's tier caps me at 12 functions, I use **dispatcher functions**: one `cron.js` runs all nine scheduled jobs via a query param, and one `admin.js` handles every admin action via an `action` field. Shared logic lives in `api/_lib` — token auth, rate limiting, the scoring engine, email, Stripe helpers. Every authenticated function follows the same contract: it reads a Bearer token, verifies it with Supabase's service-role key to get the real user, then does its work. Critically, sensitive state like premium status is only ever written server-side, never by the client."

### "How does authentication work?"
> "Users sign in with **Google only**, through Supabase Auth's OAuth. Supabase issues a JWT and manages the session in the browser. For API calls, the frontend attaches that token as a Bearer header, and the serverless function verifies it server-side — so the server derives identity from a cryptographically-verified token, never from a `userId` in the request body. Authorization happens in two layers: the database enforces **Row-Level Security** so users only touch their own rows, and premium gating is checked both client-side for UX and server-side for enforcement. Admin is a single verified email, and the admin dashboard even runs on an isolated Supabase client so its session never mixes with the normal app."

### "How do your APIs work?"
> "Two styles. For non-sensitive data I skip the API entirely and let the React app query Supabase directly — Row-Level Security makes that safe. For anything involving secrets or money, the app calls a `/api/*` serverless function through a small `authedFetch` wrapper that attaches the Supabase token. The function verifies the token, rate-limits, validates input, does the work — call OpenAI, call Stripe, send email — and returns JSON. The scoring endpoint is a good example: verify user, check the free-tier quota, build RAG context, run dual-pass GPT-4o, clamp the scores, persist, and respond with the band, breakdown, and tips. Stripe is the reverse direction — Stripe calls *my* webhook, which is the single source of truth for subscription state."

### "How would you scale this?"
> "A few moves in order of impact. First, **move rate limiting and caching to Redis/Upstash** — right now rate limiting hits a Postgres table on every call, which is fine at current volume but adds a round-trip and grows unbounded. Second, **add a caching layer** in front of read-heavy endpoints; the marketing pages are already prerendered, but dashboards hit Postgres live. Third, **manage the AI cost**: dual-pass doubles OpenAI spend, so at scale I'd make the second pass conditional — only run it when the first pass is near a band boundary — and add a queue with retries so an OpenAI outage degrades gracefully instead of 500-ing. Fourth, **add error monitoring** so the fail-soft behavior doesn't hide problems. The database itself scales vertically on Supabase for a long time, and the serverless functions scale horizontally for free, so the real constraints are OpenAI cost and Postgres read load."

### "What would you improve next?"
> "Three things. One, **centralize the Stripe-to-profile mapping logic** — it's duplicated between the webhook and the admin handler, which is a drift risk on the most critical code in the app. Two, **replace the single hard-coded admin email with a proper roles model** so access control isn't a source-code edit. Three, **add structured logging and alerting** — there's a lot of intentional fail-soft behavior with `console.warn`, which is great for uptime but means I'm blind to silent failures without proper monitoring. None of these are on fire today, but they're exactly what I'd harden as the user base grows."

---

## QUICK FACTS TO MEMORIZE (cheat sheet)

- **Stack:** React 19 + Vite 8 + React Router 7 frontend; Vercel serverless (Node) backend; Supabase Postgres DB.
- **Auth:** Google OAuth via Supabase; JWT Bearer tokens; RLS for authorization; single admin email.
- **AI:** OpenAI GPT-4o for scoring (dual-pass + hard rules + RAG), Whisper for speech-to-text, embeddings for retrieval.
- **Payments:** Stripe Checkout + Billing Portal + webhooks; webhook is the *only* writer of premium state; idempotent + signature-verified.
- **Email:** Brevo for transactional + lifecycle; 9 Vercel cron jobs via one dispatcher.
- **SEO:** build-time prerender of blog/landing pages + sitemap; server 301 redirects to canonical URLs.
- **Cleverest constraint solution:** dispatcher functions (`cron.js`, `admin.js`) to stay under Vercel's 12-function limit.
- **Signature line:** *"Reads go straight to Postgres behind Row-Level Security; anything touching secrets or money goes through a serverless function that trusts the token, not the client."*
```
