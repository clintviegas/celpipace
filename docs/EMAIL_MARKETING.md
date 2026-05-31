# Email Marketing v2 — sequences, setup & operations

Code-driven email sequences powered by Brevo (transactional API) + Supabase
(`marketing_sends` idempotency ledger) + the single `/api/cron` dispatcher.
Everything is CASL-compliant (mailing address + one-click HMAC unsubscribe on
every marketing send) and capped to **200 sends per job per run**.

## What's live

| Sequence | Job (`/api/cron?job=`) | Schedule (UTC) | Steps |
|---|---|---|---|
| Free → Premium onboarding | `marketing` | 10:00 daily | day 1, 2, 5, 7, 14, 21 |
| Study re-engagement | `reminders` | 16:00 daily | 3 / 7 / 14 days inactive |
| Win-back (cancelled/expired) | `winback` | 11:00 daily | 3 / 14 / 30 days after expiry |
| **Exam-date countdown** | `examcountdown` | 13:00 daily | T-14 / T-7 / T-3 / T-1 |
| **Abandoned checkout** | `abandoned` | 15:00 daily | 1 / 3 days after un-converted checkout |
| **Weekly progress digest** | `digest` | 14:00 daily (acts Mon only) | 1 per ISO week |
| **Educational broadcast** | `broadcast` | 17:00 daily | one-off per `broadcasts` row |

Bold = added in v2. Subscription receipts/cancellation/refund/past-due emails
remain transactional (no unsubscribe footer).

## One-time setup

1. **Run the migration** in the Supabase SQL editor:
   `supabase/email_marketing_v2.sql`
   Adds `profiles.exam_date`, `public.checkout_intents`, `public.broadcasts`,
   and the `abandoned_checkout_candidates` + `weekly_digest_candidates` RPCs.
   It also seeds one **draft** newsletter (`slug='clb-myths-01'`).

2. **Deploy.** The 4 new cron entries are already in `vercel.json` and routed
   through `api/cron.js` (no new serverless functions — we stay under the
   12-function Hobby limit). All sends require `marketing_consent = true`.

> Vercel cron count: the project now schedules 8 cron jobs. If your plan caps
> cron jobs, the deploy will warn — trim or upgrade as needed.

## Per-feature notes

### Exam-date countdown
- Set a learner's date by POSTing to the existing endpoint:
  `POST /api/on-signup` (Bearer access token) with `{ "examDate": "YYYY-MM-DD" }`
  (or `{ "examDate": null }` to clear). Accepts today … +18 months.
- Campaign keys embed the date (`exam_t7:<date>`), so booking a new exam later
  starts a fresh sequence.
- **Remaining UI hookup:** add a date picker somewhere in the dashboard that
  POSTs `examDate`. Until then the job simply finds zero candidates (safe).

### Abandoned checkout
- A row is written to `checkout_intents` whenever `/api/create-checkout-session`
  runs, and marked `converted_at` by the Stripe webhook on
  `checkout.session.completed`. Only consented, still-free users are emailed.

### Weekly digest
- Pulls per-section stats from `practice_attempts` (last 7 days) and calls out
  the learner's weakest section. Gated to Monday UTC; force a run with
  `?force=1`.

### Educational broadcast / newsletter
- Edit + launch the seeded draft:
  ```sql
  UPDATE public.broadcasts
     SET subject='…', heading='…', body_html='…', preheader='…',
         cta_url='…', cta_label='…', audience='all',  -- all | free | premium
         status='scheduled', scheduled_at=now()
   WHERE slug='clb-myths-01';
  ```
- Large lists deliver across multiple daily runs; status flips to `sent` when a
  full pass completes within budget.
- For richer one-offs with open/click analytics, Brevo's native Campaigns UI is
  also a good option — this job covers code-driven sends.

## Testing (no real emails)

Every job supports a dry run that counts eligibility without sending:
```
POST /api/cron?job=examcountdown&dry=1
Authorization: Bearer <CRON_SECRET>
```
Works for `marketing`, `examcountdown`, `abandoned`, `digest`, `broadcast`.

## Safety model (all sequences)
- Insert the `marketing_sends` lock **before** sending; `23505` → already sent,
  skip. On send failure the lock is deleted so the next tick can retry.
- `MAX_SENDS_PER_RUN = 200` per job per run.
- Consent + unsubscribe enforced in every candidate query / RPC.
