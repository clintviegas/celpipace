-- Maintenance 2026-09-16: RLS initplan + duplicate cleanup
--
-- 1. Wrap auth.uid() in (select …) in every user-scoped policy so Postgres
--    evaluates it once per statement instead of once per row. Pure
--    performance; semantics are identical. Generated from live pg_policies.
--    https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan
-- 2. Drop the three legacy profiles policies ("Users can …") that
--    admin_hardening.sql superseded but never removed. Billing columns are
--    protected by trg_guard_profile_billing, not by these policies, so
--    dropping them changes nothing except removing the
--    multiple_permissive_policies lint.
-- 3. Drop three exact-duplicate indexes.

begin;

-- ── 1. initplan ────────────────────────────────────────────────────────────
alter policy "Clients insert analytics events" on public.analytics_events
  with check ((user_id IS NULL) OR ((select auth.uid()) = user_id));

alter policy "Users insert own cancel feedback" on public.cancellation_feedback
  with check ((select auth.uid()) = user_id);
alter policy "Users read own cancel feedback" on public.cancellation_feedback
  using ((select auth.uid()) = user_id);

alter policy "Users read own checkout intents" on public.checkout_intents
  using ((select auth.uid()) = user_id);

alter policy "Users insert own coach sessions" on public.coach_sessions
  with check ((select auth.uid()) = user_id);
alter policy "Users read own coach sessions" on public.coach_sessions
  using ((select auth.uid()) = user_id);
alter policy "Users update own coach sessions" on public.coach_sessions
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy "Users insert own coach usage" on public.coach_usage
  with check ((select auth.uid()) = user_id);
alter policy "Users read own coach usage" on public.coach_usage
  using ((select auth.uid()) = user_id);
alter policy "Users update own coach usage" on public.coach_usage
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy "contact_insert_anyone" on public.contact_messages
  with check ((user_id IS NULL) OR ((select auth.uid()) = user_id));
alter policy "contact_select_own" on public.contact_messages
  using ((select auth.uid()) = user_id);

alter policy "redemptions_self_read" on public.coupon_redemptions
  using ((user_id = (select auth.uid())) OR is_app_admin());

alter policy "Users read own email log" on public.email_log
  using ((select auth.uid()) = user_id);

alter policy "ee_read_own" on public.essay_embeddings
  using ((select auth.uid()) = user_id);

alter policy "Users delete own flashcard progress" on public.flashcard_progress
  using ((select auth.uid()) = user_id);
alter policy "Users insert own flashcard progress" on public.flashcard_progress
  with check ((select auth.uid()) = user_id);
alter policy "Users read own flashcard progress" on public.flashcard_progress
  using ((select auth.uid()) = user_id);
alter policy "Users update own flashcard progress" on public.flashcard_progress
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy "Users read own marketing sends" on public.marketing_sends
  using ((select auth.uid()) = user_id);

alter policy "Users read own payments" on public.payments
  using ((select auth.uid()) = user_id);

alter policy "Users insert own practice attempts" on public.practice_attempts
  with check ((select auth.uid()) = user_id);
alter policy "Users read own practice attempts" on public.practice_attempts
  using ((select auth.uid()) = user_id);

alter policy "Users insert own profile" on public.profiles
  with check ((select auth.uid()) = id);
alter policy "Users read own profile" on public.profiles
  using ((select auth.uid()) = id);
alter policy "Users update own profile (safe columns)" on public.profiles
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

alter policy "Users delete own review items" on public.review_items
  using ((select auth.uid()) = user_id);
alter policy "Users insert own review items" on public.review_items
  with check ((select auth.uid()) = user_id);
alter policy "Users read own review items" on public.review_items
  using ((select auth.uid()) = user_id);
alter policy "Users update own review items" on public.review_items
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy "Users delete own study plan" on public.study_plans
  using ((select auth.uid()) = user_id);
alter policy "Users insert own study plan" on public.study_plans
  with check ((select auth.uid()) = user_id);
alter policy "Users read own study plan" on public.study_plans
  using ((select auth.uid()) = user_id);
alter policy "Users update own study plan" on public.study_plans
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy "Users read own sub events" on public.subscription_events
  using ((select auth.uid()) = user_id);

alter policy "ts_delete_own" on public.test_sessions
  using ((select auth.uid()) = user_id);
alter policy "ts_insert_own" on public.test_sessions
  with check ((select auth.uid()) = user_id);
alter policy "ts_select_own" on public.test_sessions
  using ((select auth.uid()) = user_id);
alter policy "ts_update_own" on public.test_sessions
  using ((select auth.uid()) = user_id);

alter policy "Users delete own attempts" on public.user_attempts
  using ((select auth.uid()) = user_id);
alter policy "Users insert own attempts" on public.user_attempts
  with check ((select auth.uid()) = user_id);
alter policy "Users read own attempts" on public.user_attempts
  using ((select auth.uid()) = user_id);
alter policy "Users update own attempts" on public.user_attempts
  using ((select auth.uid()) = user_id);

alter policy "Users can insert own progress" on public.user_progress
  with check ((select auth.uid()) = user_id);
alter policy "Users can read own progress" on public.user_progress
  using ((select auth.uid()) = user_id);
alter policy "Users can update own progress" on public.user_progress
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ── 2. legacy duplicates on profiles ───────────────────────────────────────
drop policy if exists "Users can view own profile"   on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

-- ── 3. duplicate indexes (keep the idx_-prefixed one, matching the schema) ──
drop index if exists public.practice_attempts_user_created_idx;
drop index if exists public.profiles_country_idx;
drop index if exists public.profiles_utm_source_idx;

commit;
