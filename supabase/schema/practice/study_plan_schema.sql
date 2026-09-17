-- ==========================================================================
-- CELPIPACE — Adaptive Study Plan
-- One row per user holding the plan configuration. The week-by-week plan
-- itself is generated client-side from this config + live practice stats,
-- so it stays adaptive as the user improves. Safe to re-run.
-- ==========================================================================

CREATE TABLE IF NOT EXISTS public.study_plans (
  user_id        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  target_date    DATE NOT NULL,
  target_clb     INTEGER NOT NULL DEFAULT 9 CHECK (target_clb BETWEEN 4 AND 12),
  days_per_week  INTEGER NOT NULL DEFAULT 5 CHECK (days_per_week BETWEEN 1 AND 7),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own study plan"   ON public.study_plans;
DROP POLICY IF EXISTS "Users insert own study plan" ON public.study_plans;
DROP POLICY IF EXISTS "Users update own study plan" ON public.study_plans;
DROP POLICY IF EXISTS "Users delete own study plan" ON public.study_plans;

CREATE POLICY "Users read own study plan"
  ON public.study_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own study plan"
  ON public.study_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own study plan"
  ON public.study_plans FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own study plan"
  ON public.study_plans FOR DELETE
  USING (auth.uid() = user_id);
