-- ==========================================================================
-- CELPIPACE — Gamified Learning Path
-- Extends study_plans with the full journey intake and the user's path
-- progress (XP + completed step ids). The path itself is generated
-- client-side from `journey` + premium status, so it stays adaptive.
-- Safe to re-run.
-- ==========================================================================

ALTER TABLE public.study_plans
  ADD COLUMN IF NOT EXISTS journey       JSONB,
  ADD COLUMN IF NOT EXISTS path_progress JSONB NOT NULL DEFAULT '{}'::jsonb;

-- journey shape:
--   { examDate, notBooked, targetCLB, hoursPerDay, levelMode,
--     weakAreas: [..], levels: { listening, reading, writing, speaking } }
--
-- path_progress shape:
--   { xp: int, completed: [stepId, ..], startedAt: iso, updatedAt: iso }

COMMENT ON COLUMN public.study_plans.journey IS
  'Full landing-page intake used to regenerate the adaptive learning path.';
COMMENT ON COLUMN public.study_plans.path_progress IS
  'Gamified path state: earned XP and completed step ids.';
