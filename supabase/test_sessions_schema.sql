-- ============================================================================
-- test_sessions: persistent per-user test progress (resume across reload/device)
-- ============================================================================
-- Stores in-progress and completed test sessions for both individual practice
-- sets and full mock exams. Replaces volatile sessionStorage.
--
-- NOTE on practice_set_id type: the user spec called for int8 / bigint.
-- practice_sets.id is confirmed BIGINT in this codebase, so we use BIGINT.
-- set_number remains int (1..5) for compound lookups.
-- ============================================================================

CREATE TABLE IF NOT EXISTS test_sessions (
  id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Session classification
  kind                     TEXT        NOT NULL DEFAULT 'practice'
                             CHECK (kind IN ('practice','mock')),

  -- Practice-set context (NULL for mock exams)
  practice_set_id          BIGINT      REFERENCES practice_sets(id) ON DELETE SET NULL,
  section                  TEXT,                 -- 'listening' | 'reading' | 'writing' | 'speaking'
  part_id                  TEXT,                 -- 'L1','R2','W1','S3' ...
  set_number               INT,                  -- 1..5

  -- Mock-exam context (NULL for practice)
  exam_number              INT,

  -- Active progress markers
  current_section          TEXT,                 -- listening/reading/... (mock) OR matches section (practice)
  current_part             TEXT,                 -- L1, R2, ... (used by mock)
  current_question_index   INT         NOT NULL DEFAULT 0,
  completed_sections       TEXT[]      NOT NULL DEFAULT '{}',

  -- Free-form persisted state (the source of truth for resume)
  --   selected_answers : { questionKey -> answerValue }  (per question)
  --   scores           : { partId -> { correct, total, ... } }  (per part for mocks)
  --   meta             : extra UI/timer state (started, timeLeft snapshot etc.)
  selected_answers         JSONB       NOT NULL DEFAULT '{}'::jsonb,
  scores                   JSONB       NOT NULL DEFAULT '{}'::jsonb,
  meta                     JSONB       NOT NULL DEFAULT '{}'::jsonb,

  -- Status
  is_completed             BOOLEAN     NOT NULL DEFAULT FALSE,
  started_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at             TIMESTAMPTZ
);

-- Only one ACTIVE practice session per user/practice-set at a time
CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_practice_session
  ON test_sessions (user_id, practice_set_id)
  WHERE kind = 'practice' AND is_completed = FALSE AND practice_set_id IS NOT NULL;

-- Only one ACTIVE practice session per user/(section,part,set_number) when
-- practice_set_id is unknown (e.g. data-driven static sets without DB row)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_practice_session_legacy
  ON test_sessions (user_id, section, part_id, set_number)
  WHERE kind = 'practice' AND is_completed = FALSE AND practice_set_id IS NULL;

-- Only one ACTIVE session per user/mock exam number at a time.
-- Older versions used only (user_id), which caused Mock 2 to resume Mock 1.
DROP INDEX IF EXISTS uniq_active_mock_session;
CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_mock_session_per_exam
  ON test_sessions (user_id, exam_number)
  WHERE kind = 'mock' AND is_completed = FALSE;

CREATE INDEX IF NOT EXISTS idx_ts_user_active
  ON test_sessions (user_id, is_completed, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_ts_user_completed
  ON test_sessions (user_id, completed_at DESC)
  WHERE is_completed = TRUE;

-- Auto-touch updated_at
CREATE OR REPLACE FUNCTION ts_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ts_touch ON test_sessions;
CREATE TRIGGER trg_ts_touch
  BEFORE UPDATE ON test_sessions
  FOR EACH ROW EXECUTE FUNCTION ts_touch_updated_at();

-- ============================================================================
-- RLS
-- ============================================================================
ALTER TABLE test_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ts_select_own" ON test_sessions;
CREATE POLICY "ts_select_own" ON test_sessions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ts_insert_own" ON test_sessions;
CREATE POLICY "ts_insert_own" ON test_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ts_update_own" ON test_sessions;
CREATE POLICY "ts_update_own" ON test_sessions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ts_delete_own" ON test_sessions;
CREATE POLICY "ts_delete_own" ON test_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Admin can see everything (uses email check rather than role for parity with
-- existing payments policy)
DROP POLICY IF EXISTS "ts_admin_all" ON test_sessions;
CREATE POLICY "ts_admin_all" ON test_sessions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM auth.users u
            WHERE u.id = auth.uid() AND u.email = 'clint.viegas@gmail.com')
  );

-- ============================================================================
-- Link existing user_attempts to a session (nullable for legacy rows)
-- ============================================================================
ALTER TABLE user_attempts
  ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES test_sessions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_ua_session ON user_attempts(session_id);

-- Allow a user to upsert one attempt per (session,question) without dup rows
CREATE UNIQUE INDEX IF NOT EXISTS uniq_ua_session_question
  ON user_attempts (session_id, question_id)
  WHERE session_id IS NOT NULL;

-- ============================================================================
-- RPC: start_or_resume_session
-- Returns the user's active session for the given practice set, creating one
-- if none exists. SECURITY DEFINER so RLS guarantees ownership without
-- requiring extra round-trips from the client.
-- ============================================================================
CREATE OR REPLACE FUNCTION start_or_resume_practice_session(
  p_section          TEXT,
  p_part_id          TEXT,
  p_set_number       INT,
  p_practice_set_id  BIGINT DEFAULT NULL
) RETURNS test_sessions
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_row test_sessions;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'auth required';
  END IF;

  -- Try to find an active session
  IF p_practice_set_id IS NOT NULL THEN
    SELECT * INTO v_row FROM test_sessions
     WHERE user_id = v_uid
       AND kind = 'practice'
       AND practice_set_id = p_practice_set_id
       AND is_completed = FALSE
     LIMIT 1;
  ELSE
    SELECT * INTO v_row FROM test_sessions
     WHERE user_id = v_uid
       AND kind = 'practice'
       AND practice_set_id IS NULL
       AND section = p_section
       AND part_id = p_part_id
       AND COALESCE(set_number, -1) = COALESCE(p_set_number, -1)
       AND is_completed = FALSE
     LIMIT 1;
  END IF;

  IF FOUND THEN
    RETURN v_row;
  END IF;

  INSERT INTO test_sessions (
    user_id, kind, practice_set_id, section, part_id, set_number,
    current_section, current_part, current_question_index
  ) VALUES (
    v_uid, 'practice', p_practice_set_id, p_section, p_part_id, p_set_number,
    p_section, p_part_id, 0
  )
  RETURNING * INTO v_row;

  RETURN v_row;
END $$;

GRANT EXECUTE ON FUNCTION start_or_resume_practice_session(TEXT, TEXT, INT, BIGINT) TO authenticated;

-- ============================================================================
-- RPC: start_or_resume_mock_session
-- Returns the active mock session for the user, creating one if none exists.
-- ============================================================================
CREATE OR REPLACE FUNCTION start_or_resume_mock_session(
  p_exam_number INT
) RETURNS test_sessions
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_row test_sessions;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'auth required';
  END IF;

  IF p_exam_number IS NULL OR p_exam_number < 1 OR p_exam_number > 8 THEN
    RAISE EXCEPTION 'invalid mock exam number';
  END IF;

  SELECT * INTO v_row FROM test_sessions
   WHERE user_id = v_uid
     AND kind = 'mock'
     AND exam_number = p_exam_number
     AND is_completed = FALSE
   LIMIT 1;

  IF FOUND THEN
    RETURN v_row;
  END IF;

  INSERT INTO test_sessions (
    user_id, kind, exam_number, current_section, current_part, current_question_index
  ) VALUES (
    v_uid, 'mock', p_exam_number, 'listening', 'L1', 0
  )
  RETURNING * INTO v_row;

  RETURN v_row;
END $$;

GRANT EXECUTE ON FUNCTION start_or_resume_mock_session(INT) TO authenticated;

-- ============================================================================
-- RPC: complete_test_session  — atomically marks session done with scores+meta.
-- SECURITY DEFINER bypasses RLS so the UPDATE always lands (the direct UPDATE
-- through RLS was silently dropping rows in some auth contexts).
-- ============================================================================
CREATE OR REPLACE FUNCTION complete_test_session(
  p_session_id UUID,
  p_scores JSONB DEFAULT NULL,
  p_meta JSONB DEFAULT NULL,
  p_completed_sections TEXT[] DEFAULT NULL,
  p_current_section TEXT DEFAULT NULL,
  p_current_part TEXT DEFAULT NULL
)
RETURNS test_sessions
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_row test_sessions;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'auth required'; END IF;
  UPDATE test_sessions
     SET is_completed       = TRUE,
         completed_at       = now(),
         scores             = COALESCE(p_scores, scores),
         meta               = COALESCE(p_meta, meta),
         completed_sections = COALESCE(p_completed_sections, completed_sections),
         current_section    = COALESCE(p_current_section, current_section),
         current_part       = COALESCE(p_current_part, current_part)
   WHERE id = p_session_id AND user_id = v_uid
   RETURNING * INTO v_row;
  IF NOT FOUND THEN RAISE EXCEPTION 'session not found'; END IF;
  RETURN v_row;
END $$;

GRANT EXECUTE ON FUNCTION complete_test_session(UUID, JSONB, JSONB, TEXT[], TEXT, TEXT) TO authenticated;
REVOKE EXECUTE ON FUNCTION complete_test_session(UUID, JSONB, JSONB, TEXT[], TEXT, TEXT) FROM anon;

-- ============================================================================
-- RPC: save_test_session_progress  — autosave for live in-progress sessions.
-- Used by useTestSession.flush(). SECURITY DEFINER for the same RLS reason.
-- Refuses to write if session is already completed.
-- ============================================================================
CREATE OR REPLACE FUNCTION save_test_session_progress(
  p_session_id UUID,
  p_selected_answers JSONB DEFAULT NULL,
  p_scores JSONB DEFAULT NULL,
  p_meta JSONB DEFAULT NULL,
  p_completed_sections TEXT[] DEFAULT NULL,
  p_current_section TEXT DEFAULT NULL,
  p_current_part TEXT DEFAULT NULL,
  p_current_question_index INT DEFAULT NULL
)
RETURNS test_sessions
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_row test_sessions;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'auth required'; END IF;
  UPDATE test_sessions
     SET selected_answers       = COALESCE(p_selected_answers, selected_answers),
         scores                 = COALESCE(p_scores, scores),
         meta                   = COALESCE(p_meta, meta),
         completed_sections     = COALESCE(p_completed_sections, completed_sections),
         current_section        = COALESCE(p_current_section, current_section),
         current_part           = COALESCE(p_current_part, current_part),
         current_question_index = COALESCE(p_current_question_index, current_question_index)
   WHERE id = p_session_id AND user_id = v_uid AND is_completed = FALSE
   RETURNING * INTO v_row;
  IF NOT FOUND THEN RAISE EXCEPTION 'session not found or already completed'; END IF;
  RETURN v_row;
END $$;

GRANT EXECUTE ON FUNCTION save_test_session_progress(UUID, JSONB, JSONB, JSONB, TEXT[], TEXT, TEXT, INT) TO authenticated;
REVOKE EXECUTE ON FUNCTION save_test_session_progress(UUID, JSONB, JSONB, JSONB, TEXT[], TEXT, TEXT, INT) FROM anon;
