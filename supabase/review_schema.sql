-- ==========================================================================
-- CELPIPACE — Review Mistakes + Spaced Repetition
-- Stores each missed MCQ so users can review it on an SM-2 schedule.
-- Only Listening & Reading produce reviewable MCQs (Writing/Speaking are
-- AI-scored, not multiple-choice). Safe to re-run.
-- ==========================================================================

CREATE TABLE IF NOT EXISTS public.review_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section           TEXT NOT NULL CHECK (section IN ('listening', 'reading')),
  part_id           TEXT NOT NULL,
  set_number        TEXT NOT NULL,
  question_id       TEXT NOT NULL,
  question_text     TEXT,
  options           JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer    TEXT,
  skill             TEXT,

  -- SM-2 spaced-repetition state
  ease_factor       NUMERIC NOT NULL DEFAULT 2.5,
  interval_days     NUMERIC NOT NULL DEFAULT 0,
  repetitions       INTEGER NOT NULL DEFAULT 0,
  due_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_reviewed_at  TIMESTAMPTZ,
  times_seen        INTEGER NOT NULL DEFAULT 0,
  times_correct     INTEGER NOT NULL DEFAULT 0,
  status            TEXT NOT NULL DEFAULT 'learning' CHECK (status IN ('learning', 'mastered')),

  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (user_id, section, part_id, set_number, question_id)
);

CREATE INDEX IF NOT EXISTS idx_review_items_due
  ON public.review_items (user_id, status, due_at);

CREATE INDEX IF NOT EXISTS idx_review_items_user_section
  ON public.review_items (user_id, section, part_id);

ALTER TABLE public.review_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own review items"   ON public.review_items;
DROP POLICY IF EXISTS "Users insert own review items" ON public.review_items;
DROP POLICY IF EXISTS "Users update own review items" ON public.review_items;
DROP POLICY IF EXISTS "Users delete own review items" ON public.review_items;

CREATE POLICY "Users read own review items"
  ON public.review_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own review items"
  ON public.review_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own review items"
  ON public.review_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own review items"
  ON public.review_items FOR DELETE
  USING (auth.uid() = user_id);
