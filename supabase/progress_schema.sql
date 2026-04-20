-- ═══════════════════════════════════════════════════════════════
--  USER PROGRESS TABLE — stores full progress JSON per user
--  Syncs with localStorage on the client (cloud backup)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS user_progress (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  progress_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  streak_data   JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: users can only access their own progress
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_progress_updated
  ON user_progress(updated_at DESC);
