# Supabase setup order

Apply SQL in this order when bootstrapping a new project or auditing prod drift. Re-run individual files only when noted as idempotent.

## Prerequisites

- Supabase project with Auth enabled (Google provider)
- Service role key for server-side scripts and webhooks

## Apply order

| Step | File | Depends on | Notes |
|------|------|------------|-------|
| 1 | `supabase/schema/core/schema_v4.sql` | — | Core profiles, auth hooks |
| 2 | `supabase/schema/core/auth_premium.sql` | profiles | Premium flags on profiles |
| 3 | `supabase/schema/billing/payments_schema.sql` | profiles | Stripe customer fields |
| 4 | `supabase/schema/billing/subscriptions_schema.sql` | profiles | Billing guards, RLS (no `expire_premium_users` body — see step 5) |
| 5 | **`supabase/schema/billing/phase3_expire_premium_rpc.sql`** | profiles | **Canonical** `expire_premium_users()` — returns TABLE; used by `api/cron-sweep.js` |
| 6 | **`supabase/schema/coach-ai/rag_schema.sql`** | profiles | `essay_embeddings`, **`get_user_weakness_profile`** (canonical) |
| 7 | **`supabase/schema/coach-ai/coach_schema.sql`** | rag_schema | Coach usage, `get_user_coach_profile` RPC |
| 8 | `supabase/schema/practice/progress_schema.sql` | profiles | Practice progress |
| 9 | `supabase/schema/practice/practice_attempts.sql` | profiles | Attempt logging |
| 10 | `supabase/schema/practice/writing_schema.sql` | — | Writing-specific tables if enabled |
| 11 | `supabase/schema/practice/test_sessions_schema.sql` | — | Mock exam sessions |
| 12 | `supabase/schema/practice/study_plan_schema.sql` | progress | Study plan storage |
| 13 | `supabase/schema/practice/review_schema.sql` | — | Post-exam review |
| 14 | `supabase/schema/practice/flashcard_schema.sql` | — | Vocabulary flashcards |
| 15 | `supabase/schema/practice/learning_path_schema.sql` | — | Learning paths |
| 16 | `supabase/schema/marketing/marketing_schema.sql` | profiles | Email lists metadata |
| 17 | `supabase/schema/marketing/email_marketing_v2.sql` | profiles | Drip / lifecycle |
| 18 | `supabase/schema/marketing/loops_schema.sql` | profiles | Legacy Loops sync (optional) |
| 19 | `supabase/schema/marketing/geo_attribution_schema.sql` | profiles | UTM / country backfill |
| 20 | `supabase/schema/ops/analytics_events.sql` | — | Product analytics |
| 21 | `supabase/schema/marketing/contact_messages.sql` | — | Contact form |
| 22 | `supabase/schema/billing/coupons.sql` | — | Coupon redemptions |
| 23 | `supabase/schema/marketing/reminder_schema.sql` | profiles | Exam reminders |
| 24 | `supabase/schema/ops/phase1_audit_tables.sql` | — | Audit logging |
| 25 | `supabase/schema/ops/phase4_rate_log.sql` | — | API rate limit log + `prune_api_rate_log` |
| 26 | `supabase/schema/ops/phase5_security_hardening.sql` | — | Security policies |
| 27 | `supabase/schema/core/admin_hardening.sql` | — | Admin-only policies, `is_app_admin()` |
| 28 | `supabase/schema/core/admin_analytics_rpc.sql` | admin_hardening | `get_admin_cohort_retention`, `get_admin_product_stats` — /admin Product/Retention/Exam-date tabs |

## One-off prod patches

Applied directly to prod, not run through the numbered order above. Each is
idempotent and depends on `admin_hardening.sql` (step 27) for `is_app_admin()`.

| Symptom | Fix |
|---------|-----|
| Coach: `get_user_weakness_profile does not exist` | Run `supabase/schema/coach-ai/patch_coach_weakness.sql` or full `supabase/schema/coach-ai/rag_schema.sql` step 6 |
| Cron sweep: `expire_premium_users` type mismatch | Run `supabase/schema/billing/phase3_expire_premium_rpc.sql` (replaces INT-returning variant) |
| Coach works but RPC missing | JS fallback in `api/_lib/coach-tools/buildCoachProfileFallback.js` — patch SQL for permanent fix |
| Admin Support tab: `permission denied for table users` | Run `supabase/schema/marketing/patch_contact_messages_admin_policy.sql` |
| Admin Coupons tab: `permission denied for table users` | Run `supabase/schema/billing/patch_coupons_admin_policy.sql` |

## Scripts

```bash
# Verify / apply coach weakness RPC (needs SUPABASE_DB_URL to auto-apply)
node scripts/ops/apply-coach-patch.mjs
```

## RPC deduplication rules

- **`get_user_weakness_profile`**: defined only in `supabase/schema/coach-ai/rag_schema.sql` + `supabase/schema/coach-ai/patch_coach_weakness.sql`. Not duplicated in `supabase/schema/coach-ai/coach_schema.sql`.
- **`expire_premium_users`**: defined only in `supabase/schema/billing/phase3_expire_premium_rpc.sql`. The INT-returning copy was removed from `supabase/schema/billing/subscriptions_schema.sql`.

## After schema changes

1. Re-seed RAG exemplars if rubric changed: `node scripts/ops/seed-exemplars.mjs`
2. Seed blog posts if content changed: `node scripts/ops/seed-blog-posts.mjs`
3. Smoke-test Stripe checkout: `node scripts/ops/debug-checkout-live.mjs`
4. Check Vercel cron logs for `cron-sweep` errors
