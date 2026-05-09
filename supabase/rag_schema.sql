-- ============================================================================
-- CELPIP ACE — RAG / Vector Schema
-- Adds pgvector-backed retrieval for the AI scoring pipelines.
--
-- Design:
--   essay_embeddings stores BOTH user submissions and curated exemplars in one
--   table, distinguished by is_exemplar. This keeps the similarity search
--   surface simple (one ANN index) and lets us later promote high-scoring user
--   essays into exemplars without moving rows.
--
--   match_essay_exemplars(...) returns top-K exemplars for a query embedding
--   filtered by section + task_type. Server-side so the embedding never round-
--   trips through the client.
--
--   get_user_weakness_profile(...) aggregates the user's recent scored
--   submissions into a per-dimension weakness map. Drives personalized prompt
--   injection and the study-recommendations endpoint.
-- ============================================================================

-- ── 0. Extension ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS vector;

-- ── 1. Tables ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS essay_embeddings (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Provenance
  user_id         UUID         REFERENCES auth.users(id) ON DELETE CASCADE,
  is_exemplar     BOOLEAN      NOT NULL DEFAULT FALSE,
  source          TEXT         NOT NULL DEFAULT 'submission'
                  CHECK (source IN ('submission','exemplar','seed')),

  -- Task context (used as filters at retrieval time)
  section         TEXT         NOT NULL CHECK (section IN ('writing','speaking')),
  task_type       TEXT         NOT NULL,           -- 'W1','W2','S1'..'S8','email','survey', etc.
  topic           TEXT,                            -- e.g. speaking scene topic, free-form
  prompt_text     TEXT,                            -- the prompt the response was written for

  -- The response itself
  response_text   TEXT         NOT NULL,
  word_count      INT,

  -- Scoring snapshot (NULL for raw exemplars without scores)
  overall_score   NUMERIC(4,1),
  dim_scores      JSONB,                           -- {"taskFulfillment":9,"coherence":8,...}
  feedback        TEXT,
  suggestions     JSONB,

  -- Embedding (OpenAI text-embedding-3-small = 1536 dims)
  embedding       vector(1536) NOT NULL,

  -- Timestamps
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ── 2. Indexes ──────────────────────────────────────────────────────────────
-- ivfflat for cosine similarity. Lists tuned for ~1k–10k rows; bump later.
CREATE INDEX IF NOT EXISTS idx_essay_embeddings_vec
  ON essay_embeddings USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_essay_embeddings_filter
  ON essay_embeddings (section, task_type, is_exemplar);

CREATE INDEX IF NOT EXISTS idx_essay_embeddings_user
  ON essay_embeddings (user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

-- ── 3. RLS ──────────────────────────────────────────────────────────────────
ALTER TABLE essay_embeddings ENABLE ROW LEVEL SECURITY;

-- Exemplars are world-readable. User rows are owner-readable only.
DROP POLICY IF EXISTS "ee_read_exemplars" ON essay_embeddings;
CREATE POLICY "ee_read_exemplars" ON essay_embeddings
  FOR SELECT USING (is_exemplar = TRUE);

DROP POLICY IF EXISTS "ee_read_own" ON essay_embeddings;
CREATE POLICY "ee_read_own" ON essay_embeddings
  FOR SELECT USING (auth.uid() = user_id);

-- Inserts/updates happen exclusively from the server (service-role key) so we
-- intentionally do NOT grant insert/update to authenticated users — this keeps
-- the embedding-generation path on the trusted backend.

-- ── 4. RPC: similarity search over exemplars ────────────────────────────────
-- Returns top-K high-scoring exemplars matching section+task_type, ranked by
-- cosine similarity. Threshold defaults to 0.0 (no filter); callers may tighten
-- for stricter matches. SECURITY DEFINER so it bypasses RLS for exemplars only
-- (the WHERE clause restricts to is_exemplar=TRUE so user data is never leaked).
CREATE OR REPLACE FUNCTION match_essay_exemplars(
  query_embedding vector(1536),
  p_section       TEXT,
  p_task_type     TEXT,
  p_match_count   INT     DEFAULT 3,
  p_min_score     NUMERIC DEFAULT 9.0
)
RETURNS TABLE (
  id            UUID,
  task_type     TEXT,
  topic         TEXT,
  prompt_text   TEXT,
  response_text TEXT,
  overall_score NUMERIC,
  dim_scores    JSONB,
  similarity    FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.task_type,
    e.topic,
    e.prompt_text,
    e.response_text,
    e.overall_score,
    e.dim_scores,
    1 - (e.embedding <=> query_embedding) AS similarity
  FROM essay_embeddings e
  WHERE e.is_exemplar = TRUE
    AND e.section = p_section
    AND e.task_type = p_task_type
    AND (e.overall_score IS NULL OR e.overall_score >= p_min_score)
  ORDER BY e.embedding <=> query_embedding
  LIMIT p_match_count;
END $$;

GRANT EXECUTE ON FUNCTION match_essay_exemplars(vector, TEXT, TEXT, INT, NUMERIC)
  TO authenticated, anon, service_role;

-- ── 5. RPC: per-user weakness profile ───────────────────────────────────────
-- Aggregates the user's recent scored submissions into a JSON map of
-- {dimension -> {avg, count, trend}}. Used for personalised prompt injection
-- and study recommendations.
CREATE OR REPLACE FUNCTION get_user_weakness_profile(
  p_user_id UUID,
  p_section TEXT DEFAULT NULL,
  p_window  INT  DEFAULT 10
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  WITH recent AS (
    SELECT dim_scores, overall_score, created_at
    FROM essay_embeddings
    WHERE user_id = p_user_id
      AND is_exemplar = FALSE
      AND dim_scores IS NOT NULL
      AND (p_section IS NULL OR section = p_section)
    ORDER BY created_at DESC
    LIMIT p_window
  ),
  unrolled AS (
    SELECT key AS dimension, (value)::TEXT::NUMERIC AS score
    FROM recent, jsonb_each(dim_scores)
  ),
  agg AS (
    SELECT
      dimension,
      ROUND(AVG(score)::NUMERIC, 2) AS avg_score,
      COUNT(*) AS sample_count,
      MIN(score) AS min_score,
      MAX(score) AS max_score
    FROM unrolled
    GROUP BY dimension
  )
  SELECT jsonb_build_object(
    'sample_count',  (SELECT COUNT(*) FROM recent),
    'avg_overall',   (SELECT ROUND(AVG(overall_score)::NUMERIC, 1) FROM recent),
    'dimensions',    COALESCE(jsonb_object_agg(
                       dimension,
                       jsonb_build_object(
                         'avg',   avg_score,
                         'min',   min_score,
                         'max',   max_score,
                         'count', sample_count
                       )
                     ), '{}'::jsonb),
    'weakest',       (SELECT dimension FROM agg ORDER BY avg_score ASC LIMIT 1),
    'strongest',     (SELECT dimension FROM agg ORDER BY avg_score DESC LIMIT 1)
  )
  INTO v_result
  FROM agg;

  RETURN COALESCE(v_result, '{"sample_count":0,"dimensions":{}}'::jsonb);
END $$;

GRANT EXECUTE ON FUNCTION get_user_weakness_profile(UUID, TEXT, INT)
  TO authenticated, service_role;

-- ── 6. Helper view for admin/analytics dashboards ───────────────────────────
CREATE OR REPLACE VIEW user_score_trends AS
SELECT
  user_id,
  section,
  task_type,
  date_trunc('day', created_at) AS day,
  COUNT(*)                       AS submissions,
  ROUND(AVG(overall_score)::NUMERIC, 2) AS avg_overall,
  AVG((dim_scores->>'taskFulfillment')::numeric) AS avg_task_fulfillment,
  AVG((dim_scores->>'coherence')::numeric)       AS avg_coherence,
  AVG((dim_scores->>'vocabulary')::numeric)      AS avg_vocabulary,
  AVG(COALESCE(
    (dim_scores->>'readability')::numeric,
    (dim_scores->>'listenability')::numeric
  )) AS avg_linguistic_control
FROM essay_embeddings
WHERE is_exemplar = FALSE
  AND dim_scores IS NOT NULL
GROUP BY user_id, section, task_type, day;

-- ============================================================================
-- DONE.  After applying:
--   1. ANALYZE essay_embeddings;     -- once you have rows, helps the planner
--   2. Re-create the ivfflat index with higher `lists` once row count > 50k.
-- ============================================================================
