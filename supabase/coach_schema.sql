-- ==========================================================================
-- CELPIPACE — Personalized AI Coach
-- Unified coach profile RPC, usage limits, optional session storage.
-- Safe to re-run.
-- ==========================================================================

-- ── 1. Coach usage (free tier: 5 messages / calendar week) ───────────────
CREATE TABLE IF NOT EXISTS public.coach_usage (
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start    DATE NOT NULL,
  message_count INTEGER NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_coach_usage_user_week
  ON public.coach_usage (user_id, week_start DESC);

ALTER TABLE public.coach_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own coach usage" ON public.coach_usage;
DROP POLICY IF EXISTS "Users insert own coach usage" ON public.coach_usage;
DROP POLICY IF EXISTS "Users update own coach usage" ON public.coach_usage;

CREATE POLICY "Users read own coach usage"
  ON public.coach_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own coach usage"
  ON public.coach_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own coach usage"
  ON public.coach_usage FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 2. Optional coach sessions (message history) ───────────────────────────
CREATE TABLE IF NOT EXISTS public.coach_sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  messages   JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coach_sessions_user_updated
  ON public.coach_sessions (user_id, updated_at DESC);

ALTER TABLE public.coach_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own coach sessions" ON public.coach_sessions;
DROP POLICY IF EXISTS "Users insert own coach sessions" ON public.coach_sessions;
DROP POLICY IF EXISTS "Users update own coach sessions" ON public.coach_sessions;

CREATE POLICY "Users read own coach sessions"
  ON public.coach_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own coach sessions"
  ON public.coach_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own coach sessions"
  ON public.coach_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 3. Helper: pct → CLB (mirrors client bandPrediction) ─────────────────
CREATE OR REPLACE FUNCTION public.pct_to_clb(p_pct INTEGER)
RETURNS INTEGER
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_pct IS NULL THEN NULL
    WHEN p_pct >= 95 THEN 12
    WHEN p_pct >= 90 THEN 11
    WHEN p_pct >= 85 THEN 10
    WHEN p_pct >= 78 THEN 9
    WHEN p_pct >= 70 THEN 8
    WHEN p_pct >= 60 THEN 7
    WHEN p_pct >= 50 THEN 6
    WHEN p_pct >= 40 THEN 5
    WHEN p_pct >= 30 THEN 4
    ELSE 3
  END;
$$;

-- ── 4. RPC: unified coach profile ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_user_coach_profile(
  p_user_id UUID,
  p_target_clb INTEGER DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target INTEGER;
  v_plan RECORD;
  v_result JSONB;
  v_pain_points JSONB := '[]'::jsonb;
  v_sections JSONB := '{}'::jsonb;
  v_lr_skills JSONB := '[]'::jsonb;
  v_review_due INTEGER := 0;
  v_review_total INTEGER := 0;
  v_weakest_section TEXT;
  v_weakest_clb INTEGER;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT target_clb, target_date, days_per_week
  INTO v_plan
  FROM study_plans
  WHERE user_id = p_user_id;

  v_target := COALESCE(p_target_clb, v_plan.target_clb, 9);

  -- Section bands from recent practice_attempts (last 30 days per section)
  WITH section_recent AS (
    SELECT DISTINCT ON (section)
      section,
      score,
      total,
      pct,
      part_id,
      set_number,
      created_at
    FROM practice_attempts
    WHERE user_id = p_user_id
      AND section IN ('listening', 'reading', 'writing', 'speaking')
      AND created_at > now() - INTERVAL '90 days'
    ORDER BY section, created_at DESC
  ),
  section_best AS (
    SELECT
      section,
      MAX(
        CASE
          WHEN section IN ('writing', 'speaking') AND total >= 12 THEN score::INTEGER
          ELSE pct_to_clb(pct)
        END
      ) AS best_clb
    FROM practice_attempts
    WHERE user_id = p_user_id
      AND section IN ('listening', 'reading', 'writing', 'speaking')
    GROUP BY section
  ),
  section_agg AS (
    SELECT
      sr.section,
      CASE
        WHEN sr.section IN ('writing', 'speaking') AND sr.total >= 12 THEN sr.score::INTEGER
        ELSE pct_to_clb(sr.pct)
      END AS latest_clb,
      sb.best_clb,
      sr.part_id,
      sr.set_number,
      (SELECT COUNT(*) FROM practice_attempts pa WHERE pa.user_id = p_user_id AND pa.section = sr.section) AS attempt_count
    FROM section_recent sr
    LEFT JOIN section_best sb ON sb.section = sr.section
  )
  SELECT COALESCE(jsonb_object_agg(
    section,
    jsonb_build_object(
      'latestCLB', latest_clb,
      'bestCLB', best_clb,
      'attemptCount', attempt_count,
      'gapToTarget', GREATEST(0, v_target - COALESCE(latest_clb, 0)),
      'lastPartId', part_id,
      'lastSetNumber', set_number
    )
  ), '{}'::jsonb)
  INTO v_sections
  FROM section_agg;

  -- L/R micro-skill miss rates from payload questions
  WITH q_rows AS (
    SELECT
      pa.section,
      COALESCE(NULLIF(q->>'skill', ''), 'general') AS skill,
      (q->>'isCorrect')::boolean AS is_correct,
      pa.part_id,
      pa.set_number
    FROM practice_attempts pa,
         LATERAL jsonb_array_elements(COALESCE(pa.payload->'questions', '[]'::jsonb)) q
    WHERE pa.user_id = p_user_id
      AND pa.section IN ('listening', 'reading')
      AND pa.created_at > now() - INTERVAL '180 days'
  ),
  skill_agg AS (
    SELECT
      section,
      skill,
      COUNT(*) AS total_q,
      COUNT(*) FILTER (WHERE is_correct IS NOT TRUE) AS missed_q,
      ROUND(100.0 * COUNT(*) FILTER (WHERE is_correct IS NOT TRUE) / NULLIF(COUNT(*), 0)) AS miss_pct
    FROM q_rows
    GROUP BY section, skill
    HAVING COUNT(*) >= 3
  )
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'section', section,
      'skill', skill,
      'totalQuestions', total_q,
      'missedQuestions', missed_q,
      'missPct', miss_pct
    ) ORDER BY miss_pct DESC, missed_q DESC
  ), '[]'::jsonb)
  INTO v_lr_skills
  FROM skill_agg;

  -- Review backlog
  SELECT
    COUNT(*) FILTER (WHERE due_at <= now() AND status <> 'mastered'),
    COUNT(*)
  INTO v_review_due, v_review_total
  FROM review_items
  WHERE user_id = p_user_id;

  -- Build pain points from sections, dimensions, skills, review
  WITH skill_pain AS (
    SELECT
      section,
      skill,
      miss_pct,
      total_q
    FROM (
      SELECT
        pa.section,
        COALESCE(NULLIF(q->>'skill', ''), 'general') AS skill,
        ROUND(100.0 * COUNT(*) FILTER (WHERE (q->>'isCorrect')::boolean IS NOT TRUE) / NULLIF(COUNT(*), 0)) AS miss_pct,
        COUNT(*)::int AS total_q
      FROM practice_attempts pa,
           LATERAL jsonb_array_elements(COALESCE(pa.payload->'questions', '[]'::jsonb)) q
      WHERE pa.user_id = p_user_id
        AND pa.section IN ('listening', 'reading')
        AND pa.created_at > now() - INTERVAL '180 days'
      GROUP BY pa.section, COALESCE(NULLIF(q->>'skill', ''), 'general')
      HAVING COUNT(*) >= 3
    ) s
    WHERE miss_pct >= 35
  ),
  wp_w AS (SELECT get_user_weakness_profile(p_user_id, 'writing', 10) AS wp),
  wp_s AS (SELECT get_user_weakness_profile(p_user_id, 'speaking', 10) AS wp)
  SELECT COALESCE(jsonb_agg(p ORDER BY (p->>'priority')::int, (p->>'metric')::numeric DESC), '[]'::jsonb)
  INTO v_pain_points
  FROM (
    SELECT jsonb_build_object(
      'kind', 'dimension',
      'section', 'writing',
      'label', wp->>'weakest',
      'detail', 'Writing ' || (wp->>'weakest') || ' averaging CLB ' || (wp->'dimensions'->(wp->>'weakest')->>'avg') || ' over ' || (wp->>'sample_count') || ' attempts',
      'metric', (wp->'dimensions'->(wp->>'weakest')->>'avg')::numeric,
      'samples', (wp->>'sample_count')::int,
      'priority', 1
    ) AS p
    FROM wp_w
    WHERE (wp->>'sample_count')::int >= 2 AND wp->>'weakest' IS NOT NULL
    UNION ALL
    SELECT jsonb_build_object(
      'kind', 'dimension',
      'section', 'speaking',
      'label', wp->>'weakest',
      'detail', 'Speaking ' || (wp->>'weakest') || ' averaging CLB ' || (wp->'dimensions'->(wp->>'weakest')->>'avg') || ' over ' || (wp->>'sample_count') || ' attempts',
      'metric', (wp->'dimensions'->(wp->>'weakest')->>'avg')::numeric,
      'samples', (wp->>'sample_count')::int,
      'priority', 1
    )
    FROM wp_s
    WHERE (wp->>'sample_count')::int >= 2 AND wp->>'weakest' IS NOT NULL
    UNION ALL
    SELECT jsonb_build_object(
      'kind', 'skill',
      'section', section,
      'label', skill,
      'detail', INITCAP(section) || ' ' || REPLACE(skill, '_', ' ') || ': ' || miss_pct || '% miss rate over ' || total_q || ' questions',
      'metric', miss_pct,
      'samples', total_q,
      'priority', 2
    )
    FROM skill_pain
    UNION ALL
    SELECT jsonb_build_object(
      'kind', 'review',
      'section', 'reading',
      'label', 'review_backlog',
      'detail', v_review_due || ' review mistakes due now (' || v_review_total || ' total in queue)',
      'metric', v_review_due,
      'samples', v_review_total,
      'priority', 3
    ) WHERE v_review_due > 0
  ) pains;

  -- Weakest section by latest CLB vs target
  SELECT section, (value->>'latestCLB')::int
  INTO v_weakest_section, v_weakest_clb
  FROM jsonb_each(v_sections) AS e(section, value)
  WHERE (value->>'latestCLB') IS NOT NULL
  ORDER BY (value->>'latestCLB')::int ASC NULLS LAST
  LIMIT 1;

  v_result := jsonb_build_object(
    'targetCLB', v_target,
    'targetDate', v_plan.target_date,
    'daysPerWeek', v_plan.days_per_week,
    'sections', v_sections,
    'lrSkills', v_lr_skills,
    'writingProfile', get_user_weakness_profile(p_user_id, 'writing', 10),
    'speakingProfile', get_user_weakness_profile(p_user_id, 'speaking', 10),
    'reviewDue', v_review_due,
    'reviewTotal', v_review_total,
    'painPoints', v_pain_points,
    'weakestSection', v_weakest_section,
    'weakestCLB', v_weakest_clb,
    'dataRich', (
      (SELECT COUNT(*) FROM practice_attempts WHERE user_id = p_user_id) >= 3
      OR (SELECT COUNT(*) FROM essay_embeddings WHERE user_id = p_user_id AND is_exemplar = FALSE) >= 2
    )
  );

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_coach_profile(UUID, INTEGER)
  TO authenticated, service_role;

-- ── 5. RPC: increment coach usage (returns remaining count) ──────────────
CREATE OR REPLACE FUNCTION public.increment_coach_usage(
  p_user_id UUID,
  p_weekly_limit INTEGER DEFAULT 5,
  p_is_premium BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_week DATE := date_trunc('week', now())::date;
  v_count INTEGER;
  v_limit INTEGER;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  IF p_is_premium THEN
    RETURN jsonb_build_object('allowed', true, 'remaining', NULL, 'limit', NULL, 'premium', true);
  END IF;

  v_limit := GREATEST(1, COALESCE(p_weekly_limit, 5));

  INSERT INTO coach_usage (user_id, week_start, message_count)
  VALUES (p_user_id, v_week, 1)
  ON CONFLICT (user_id, week_start)
  DO UPDATE SET
    message_count = coach_usage.message_count + 1,
    updated_at = now()
  RETURNING message_count INTO v_count;

  IF v_count > v_limit THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'limit', v_limit,
      'premium', false,
      'limitReached', true
    );
  END IF;

  RETURN jsonb_build_object(
    'allowed', true,
    'remaining', v_limit - v_count,
    'limit', v_limit,
    'premium', false,
    'limitReached', false
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_coach_usage(UUID, INTEGER, BOOLEAN)
  TO authenticated, service_role;
