-- ═══════════════════════════════════════════════════════════════
-- Phase 5 — security hardening (Supabase advisor cleanup)
-- E1: Enable RLS on `questions`, allow public SELECT, lock down writes.
-- E2: Recreate `revenue_daily` view as SECURITY INVOKER.
-- W1: Add SELECT policy on `practice_sets` so the app can read it.
-- W3: REVOKE EXECUTE FROM anon on SECURITY DEFINER RPCs.
-- W4: Pin search_path on the two flagged functions.
-- Idempotent.
-- ═══════════════════════════════════════════════════════════════

-- ── E1: questions table ────────────────────────────────────────
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read questions" ON public.questions;
DROP POLICY IF EXISTS "Admin writes questions" ON public.questions;

-- Anyone can read question content (it's the test material)
CREATE POLICY "Public read questions"
  ON public.questions FOR SELECT
  USING (true);

-- Only admin email can mutate. Service role bypasses RLS so seed scripts still work.
CREATE POLICY "Admin writes questions"
  ON public.questions FOR ALL
  USING (COALESCE(auth.jwt() ->> 'email', '') = 'clint.viegas@gmail.com')
  WITH CHECK (COALESCE(auth.jwt() ->> 'email', '') = 'clint.viegas@gmail.com');

-- ── E2: revenue_daily view → SECURITY INVOKER ─────────────────
DROP VIEW IF EXISTS public.revenue_daily;
CREATE VIEW public.revenue_daily
  WITH (security_invoker = true)
  AS
  SELECT
    date_trunc('day', created_at)::date AS day,
    count(*)                            AS num_payments,
    sum(amount_cents) / 100.0           AS revenue
  FROM public.payments
  WHERE status = 'paid'
  GROUP BY 1
  ORDER BY 1 DESC;

-- ── W1: practice_sets — public SELECT ─────────────────────────
DROP POLICY IF EXISTS "Public read practice_sets" ON public.practice_sets;
CREATE POLICY "Public read practice_sets"
  ON public.practice_sets FOR SELECT
  USING (true);

-- ── W3: revoke anon EXECUTE on SECURITY DEFINER RPCs ──────────
REVOKE EXECUTE ON FUNCTION public.complete_test_session(uuid)            FROM anon;
REVOKE EXECUTE ON FUNCTION public.start_or_resume_mock_session(integer)  FROM anon;
REVOKE EXECUTE ON FUNCTION public.start_or_resume_practice_session(text, text, integer, bigint) FROM anon;
REVOKE EXECUTE ON FUNCTION public.redeem_coupon(text)                    FROM anon;
REVOKE EXECUTE ON FUNCTION public.touch_user_activity()                  FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_admin_user_activity()              FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_app_admin()                         FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user()                      FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable()                      FROM anon, authenticated;

-- ── W4: pin search_path on two flagged functions ──────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
             WHERE n.nspname = 'public' AND p.proname = 'ts_touch_updated_at') THEN
    EXECUTE 'ALTER FUNCTION public.ts_touch_updated_at() SET search_path = public, pg_temp';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
             WHERE n.nspname = 'public' AND p.proname = 'ensure_admin_premium') THEN
    EXECUTE 'ALTER FUNCTION public.ensure_admin_premium() SET search_path = public, pg_temp';
  END IF;
END $$;
