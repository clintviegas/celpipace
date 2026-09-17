-- ==========================================================================
-- CELPIPACE — Flashcard Drills (vocabulary & grammar) spaced repetition
-- One row per (user, card). Card content lives in the app; this table only
-- holds each user's SM-2 schedule state per card. Safe to re-run.
-- ==========================================================================

CREATE TABLE IF NOT EXISTS public.flashcard_progress (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id           TEXT NOT NULL,            -- "deckId:index"
  deck_id           TEXT NOT NULL,

  ease_factor       NUMERIC NOT NULL DEFAULT 2.5,
  interval_days     NUMERIC NOT NULL DEFAULT 0,
  repetitions       INTEGER NOT NULL DEFAULT 0,
  due_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_reviewed_at  TIMESTAMPTZ,
  times_seen        INTEGER NOT NULL DEFAULT 0,
  status            TEXT NOT NULL DEFAULT 'learning' CHECK (status IN ('learning', 'mastered')),

  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (user_id, card_id)
);

CREATE INDEX IF NOT EXISTS idx_flashcard_due
  ON public.flashcard_progress (user_id, status, due_at);

CREATE INDEX IF NOT EXISTS idx_flashcard_user_deck
  ON public.flashcard_progress (user_id, deck_id);

ALTER TABLE public.flashcard_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own flashcard progress"   ON public.flashcard_progress;
DROP POLICY IF EXISTS "Users insert own flashcard progress" ON public.flashcard_progress;
DROP POLICY IF EXISTS "Users update own flashcard progress" ON public.flashcard_progress;
DROP POLICY IF EXISTS "Users delete own flashcard progress" ON public.flashcard_progress;

CREATE POLICY "Users read own flashcard progress"
  ON public.flashcard_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own flashcard progress"
  ON public.flashcard_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own flashcard progress"
  ON public.flashcard_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own flashcard progress"
  ON public.flashcard_progress FOR DELETE
  USING (auth.uid() = user_id);
