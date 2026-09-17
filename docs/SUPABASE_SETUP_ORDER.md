# Supabase setup order

Apply SQL in this order when bootstrapping a new project or auditing prod drift. Re-run individual files only when noted as idempotent.

## Prerequisites

- Supabase project with Auth enabled (Google provider)
- Service role key for server-side scripts and webhooks

## Apply order

| Step | File | Depends on | Notes |
|------|------|------------|-------|
| 1 | `schema_v4.sql` | — | Core profiles, auth hooks |
| 2 | `auth_premium.sql` | profiles | Premium flags on profiles |
| 3 | `payments_schema.sql` | profiles | Stripe customer fields |
| 4 | `subscriptions_schema.sql` | profiles | Billing guards, RLS (no `expire_premium_users` body — see step 5) |
| 5 | **`phase3_expire_premium_rpc.sql`** | profiles | **Canonical** `expire_premium_users()` — returns TABLE; used by `api/cron-sweep.js` |
| 6 | **`rag_schema.sql`** | profiles | `essay_embeddings`, **`get_user_weakness_profile`** (canonical) |
| 7 | **`coach_schema.sql`** | rag_schema | Coach usage, `get_user_coach_profile` RPC |
| 8 | `progress_schema.sql` | profiles | Practice progress |
| 9 | `practice_attempts.sql` | profiles | Attempt logging |
| 10 | `writing_schema.sql` | — | Writing-specific tables if enabled |
| 11 | `test_sessions_schema.sql` | — | Mock exam sessions |
| 12 | `study_plan_schema.sql` | progress | Study plan storage |
| 13 | `review_schema.sql` | — | Post-exam review |
| 14 | `flashcard_schema.sql` | — | Vocabulary flashcards |
| 15 | `learning_path_schema.sql` | — | Learning paths |
| 16 | `marketing_schema.sql` | profiles | Email lists metadata |
| 17 | `email_marketing_v2.sql` | profiles | Drip / lifecycle |
| 18 | `loops_schema.sql` | profiles | Legacy Loops sync (optional) |
| 19 | `geo_attribution_schema.sql` | profiles | UTM / country backfill |
| 20 | `analytics_events.sql` | — | Product analytics |
| 21 | `contact_messages.sql` | — | Contact form |
| 22 | `coupons.sql` | — | Coupon redemptions |
| 23 | `reminder_schema.sql` | profiles | Exam reminders |
| 24 | `phase1_audit_tables.sql` | — | Audit logging |
| 25 | `phase4_rate_log.sql` | — | API rate limit log + `prune_api_rate_log` |
| 26 | `phase5_security_hardening.sql` | — | Security policies |
| 27 | `admin_hardening.sql` | — | Admin-only policies |

## One-off prod patches

| Symptom | Fix |
|---------|-----|
| Coach: `get_user_weakness_profile does not exist` | Run `patch_coach_weakness.sql` or full `rag_schema.sql` step 6 |
| Cron sweep: `expire_premium_users` type mismatch | Run `phase3_expire_premium_rpc.sql` (replaces INT-returning variant) |
| Coach works but RPC missing | JS fallback in `api/_lib/coach-tools/buildCoachProfileFallback.js` — patch SQL for permanent fix |

## Scripts

```bash
# Verify / apply coach weakness RPC (needs SUPABASE_DB_URL to auto-apply)
node scripts/apply-coach-patch.mjs
```

## RPC deduplication rules

- **`get_user_weakness_profile`**: defined only in `rag_schema.sql` + `patch_coach_weakness.sql`. Not duplicated in `coach_schema.sql`.
- **`expire_premium_users`**: defined only in `phase3_expire_premium_rpc.sql`. The INT-returning copy was removed from `subscriptions_schema.sql`.

## After schema changes

1. Re-seed RAG exemplars if rubric changed: `node scripts/seed-exemplars.mjs`
2. Seed blog posts if content changed: `node scripts/seed-blog-posts.mjs`
3. Smoke-test Stripe checkout: `node scripts/debug-checkout-live.mjs`
4. Check Vercel cron logs for `cron-sweep` errors
