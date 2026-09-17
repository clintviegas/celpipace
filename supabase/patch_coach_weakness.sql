-- Run once in Supabase SQL Editor if Study Coach shows:
--   get_user_weakness_profile(uuid, unknown, integer) does not exist
--
-- Safe to re-run. Requires essay_embeddings table (from rag_schema.sql).

CREATE OR REPLACE FUNCTION public.get_user_weakness_profile(
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
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_weakness_profile(UUID, TEXT, INT)
  TO authenticated, service_role;
