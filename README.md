# CELPIPACE

CELPIPACE is a focused CELPIP preparation platform with real-time scoring, full mock exams, section drills, saved CLB reports, and CRS score tools.

Live site: https://www.celpipace.ca/

CELPIPACE is an independent preparation platform and is not affiliated with, endorsed by, sponsored by, or approved by CELPIP or Paragon Testing Enterprises.

## What It Offers

- 1,190+ CELPIP-style question items and prompts
- 220+ practice sets across Listening, Reading, Writing, and Speaking
- 8 full mock exams with saved score reports
- Real-time Writing and Speaking scoring with CLB-level feedback
- Detailed explanations and score-boosting tips inside practice sets
- Progress tracking across all four skills
- CLB to CRS calculator for Express Entry planning
- Stripe subscriptions with self-serve billing and cancellation
- Google sign-in for account access and saved progress

## Practice Sections

| Section | Coverage | Highlights |
| --- | --- | --- |
| Listening | 6 parts, 120 practice sets | Timed listening simulations, transcript support, answer explanations |
| Reading | 4 parts, 46 practice sets | CELPIP-style passages, diagrams, viewpoints, matching, MCQ, fill-in formats |
| Writing | 2 tasks, 40 prompts | Email and survey responses with real-time CLB scoring |
| Speaking | 8 tasks, 120 prompts | Prep and speaking timers, transcript support, real-time scoring |

## Platform Features

- Real test format: practice sets follow CELPIP-style timing, structure, and difficulty.
- Real-time scoring: Writing and Speaking responses receive CLB-level feedback on coherence, vocabulary, grammar, task fulfillment, and delivery.
- Detailed explanations: objective questions include answer explanations to help users understand mistakes.
- Study support: tips, strategy pages, vocabulary resources, and blog articles support focused prep.
- Canadian context: scenarios use Canadian workplace, community, education, housing, service, and everyday settings.
- Progress dashboard: users can track practice history and CLB growth over time.

## Pricing Model

- Free access lets users explore the first question in each section.
- Premium unlocks all mock exams, all question items and prompts, unlimited real-time scoring, progress tracking, study guides, vocabulary bundles, and priority email support.
- Stripe handles checkout, subscriptions, billing portal access, cancellations, and refunds.
- First-time subscribers can use `CELPIP25` for 25% off the first checkout.

## Tech Stack

| Layer | Tech |
| --- | --- |
| Frontend | React 19, Vite 8, React Router |
| Styling/UI | CSS, Framer Motion, Lucide React |
| Auth | Supabase Auth with Google sign-in |
| Database | Supabase PostgreSQL |
| Payments | Stripe checkout, billing portal, webhooks |
| Email | Resend transactional email |
| Testing | Playwright |
| Deployment | Vercel |

## Project Structure

```text
api/                 Serverless API routes for scoring, payments, contact, webhooks
docs/                Setup notes for auth, contact, payments, persistence, subscriptions
public/              Static assets, logo, favicon, audio, images, training material
scripts/             Audio/content conversion, SEO prerendering, asset upload tools
src/components/      Shared UI, navigation, auth modal, pricing, SEO, footer
src/context/         Auth provider and account state
src/data/            Practice data, SEO pages, pricing plans, constants
src/hooks/           Practice progress, auth gate, progress/session helpers
src/lib/             Supabase clients and mock exam utilities
src/pages/           Public pages, practice pages, dashboard, admin, payment, legal
supabase/            SQL migrations and schema files
tests/e2e/           Playwright smoke and subscription flow tests
```

## Getting Started

### Requirements

- Node.js 20+
- npm
- Supabase project
- Stripe account
- Optional: Resend account for transactional email

### Install

```bash
npm install
```

### Environment

Copy the example environment file and fill in the required values:

```bash
cp .env.example .env.local
```

Common variables:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_CDN_URL=
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_WEEKLY=
STRIPE_PRICE_MONTHLY=
STRIPE_PRICE_QUARTERLY=
SUPABASE_SERVICE_ROLE_KEY=
PUBLIC_SITE_URL=
RESEND_API_KEY=
EMAIL_FROM=
```

Server-side secrets such as `STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, and `RESEND_API_KEY` must never be exposed with a `VITE_` prefix.

### Database Setup

Run the SQL files in `supabase/` as needed for the feature set you are enabling. Important setup files include:

- `supabase/admin_hardening.sql`
- `supabase/auth_premium.sql`
- `supabase/payments_schema.sql`
- `supabase/subscriptions_schema.sql`
- `supabase/progress_schema.sql`
- `supabase/practice_attempts.sql`
- `supabase/test_sessions_schema.sql`
- `supabase/writing_schema.sql`

See the matching setup guides in `docs/` for auth domain, payments, persistence, subscriptions, contact, and test sessions.

## Development

```bash
npm run dev
```

Open http://localhost:5173.

## Production Build

```bash
npm run build
```

The build runs Vite and then prerenders SEO routes with `scripts/prerender-seo.mjs`.

## Testing

Install Playwright browsers once:

```bash
npm run e2e:install
```

Run smoke tests:

```bash
npm run e2e:smoke
```

Run all E2E tests:

```bash
npm run e2e
```

## Admin And Billing Notes

- Admin dashboard: `/admin`
- Admin auth is isolated from the public app session through `src/lib/adminSupabase.js`.
- Admin password recovery is available from `/admin`.
- Stripe remains the safest place to issue refunds.
- Full Stripe refunds are handled by webhook events, which mark the payment as refunded and revoke premium access.
- Refund requests should be reviewed for genuine billing or access issues; substantial premium usage does not automatically qualify.

## Useful Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start local Vite dev server |
| `npm run build` | Build production app and prerender SEO pages |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run e2e:smoke` | Run Playwright smoke tests |
| `npm run e2e` | Run all Playwright tests |

## Documentation

- `docs/AUTH_DOMAIN_SETUP.md`
- `docs/CONTACT_SETUP.md`
- `docs/PAYMENTS_SETUP.md`
- `docs/PERSISTENCE_SETUP.md`
- `docs/SUBSCRIPTIONS_SETUP.md`
- `docs/TEST_SESSIONS_SETUP.md`

## Contact

Support: info@celpipace.ca

Website: https://www.celpipace.ca/