-- ==========================================================================
-- CELPIPACE practice attempt history
-- Stores every signed-in LSWR practice completion as an immutable per-user row.
-- Safe to re-run.
-- ==========================================================================

CREATE TABLE IF NOT EXISTS public.practice_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section TEXT NOT NULL CHECK (section IN ('listening', 'reading', 'writing', 'speaking', 'mock')),
  part_id TEXT NOT NULL,
  set_number TEXT NOT NULL,
  score NUMERIC,
  total NUMERIC,
  pct INTEGER,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_practice_attempts_user_created
  ON public.practice_attempts (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_practice_attempts_user_section
  ON public.practice_attempts (user_id, section, part_id, set_number);

ALTER TABLE public.practice_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own practice attempts" ON public.practice_attempts;
DROP POLICY IF EXISTS "Users insert own practice attempts" ON public.practice_attempts;
DROP POLICY IF EXISTS "Admin reads all practice attempts" ON public.practice_attempts;

CREATE POLICY "Users read own practice attempts"
  ON public.practice_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own practice attempts"
  ON public.practice_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin reads all practice attempts"
  ON public.practice_attempts FOR SELECT
  USING (COALESCE(auth.jwt() ->> 'email', '') = 'clint.viegas@gmail.com');