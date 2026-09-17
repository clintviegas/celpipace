-- ═══════════════════════════════════════════════════════════════
-- celpipAce — Loops email platform schema
-- Run after auth_premium.sql.  Idempotent — safe to re-run.
-- ═══════════════════════════════════════════════════════════════

-- Tracks whether this user has been synced to Loops (prevents duplicate
-- signup events from the on-signup endpoint).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS loops_synced_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_loops_synced
  ON public.profiles(loops_synced_at) WHERE loops_synced_at IS NULL;
