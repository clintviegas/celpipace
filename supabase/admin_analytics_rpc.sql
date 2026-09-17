-- Admin analytics RPCs for /admin Product, Retention, and Exam-date tabs.
-- Safe to re-run. Requires public.is_app_admin() from admin_hardening.sql.

-- Weekly signup cohort retention (active = last_seen_at or practice attempt in window)
CREATE OR REPLACE FUNCTION public.get_admin_cohort_retention(p_weeks INTEGER DEFAULT 8)
RETURNS TABLE (
  cohort_week DATE,
  cohort_size BIGINT,
  active_week_0 BIGINT,
  active_week_1 BIGINT,
  active_week_2 BIGINT,
  active_week_4 BIGINT,
  paid_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT public.is_app_admin() THEN
    RAISE EXCEPTION 'admin required' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  WITH bounds AS (
    SELECT date_trunc('week', now())::date AS this_week
  ),
  cohorts AS (
    SELECT
      p.id AS user_id,
      date_trunc('week', p.created_at)::date AS cohort_week,
      p.created_at,
      p.last_seen_at,
      p.is_premium,
      p.premium_source
    FROM public.profiles p, bounds b
    WHERE p.created_at >= (b.this_week - (GREATEST(p_weeks, 1) || ' weeks')::interval)
  ),
  practice AS (
    SELECT user_id, min(created_at) AS first_at, max(created_at) AS last_at
    FROM public.practice_attempts
    GROUP BY user_id
  ),
  enriched AS (
    SELECT
      c.cohort_week,
      c.user_id,
      c.is_premium,
      c.premium_source,
      GREATEST(c.last_seen_at, pr.last_at) AS last_active_at,
      c.created_at
    FROM cohorts c
    LEFT JOIN practice pr ON pr.user_id = c.user_id
  )
  SELECT
    e.cohort_week,
    count(*)::bigint AS cohort_size,
    count(*) FILTER (
      WHERE e.last_active_at IS NOT NULL
        AND e.last_active_at >= e.created_at
        AND e.last_active_at < e.created_at + interval '7 days'
    )::bigint AS active_week_0,
    count(*) FILTER (
      WHERE e.last_active_at >= e.created_at + interval '7 days'
        AND e.last_active_at < e.created_at + interval '14 days'
    )::bigint AS active_week_1,
    count(*) FILTER (
      WHERE e.last_active_at >= e.created_at + interval '14 days'
        AND e.last_active_at < e.created_at + interval '21 days'
    )::bigint AS active_week_2,
    count(*) FILTER (
      WHERE e.last_active_at >= e.created_at + interval '28 days'
        AND e.last_active_at < e.created_at + interval '35 days'
    )::bigint AS active_week_4,
    count(*) FILTER (
      WHERE e.is_premium
        AND (
          lower(coalesce(e.premium_source, '')) IN ('paid', 'stripe')
          OR lower(coalesce(e.premium_source, '')) LIKE 'stripe:%'
        )
    )::bigint AS paid_count
  FROM enriched e
  GROUP BY e.cohort_week
  ORDER BY e.cohort_week DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_cohort_retention(INTEGER) TO authenticated;

-- Product engagement aggregates for admin dashboard
CREATE OR REPLACE FUNCTION public.get_admin_product_stats(p_days INTEGER DEFAULT 30)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_since TIMESTAMPTZ := now() - (GREATEST(p_days, 1) || ' days')::interval;
  v_result JSONB;
BEGIN
  IF NOT public.is_app_admin() THEN
    RAISE EXCEPTION 'admin required' USING ERRCODE = '42501';
  END IF;

  SELECT jsonb_build_object(
    'attempts_by_section', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('section', section, 'count', cnt) ORDER BY cnt DESC)
      FROM (
        SELECT section, count(*)::bigint AS cnt
        FROM public.practice_attempts
        WHERE created_at >= v_since
        GROUP BY section
      ) s
    ), '[]'::jsonb),
    'top_sets', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'section', section,
        'part_id', part_id,
        'set_number', set_number,
        'count', cnt
      ) ORDER BY cnt DESC)
      FROM (
        SELECT section, part_id, set_number, count(*)::bigint AS cnt
        FROM public.practice_attempts
        WHERE created_at >= v_since
        GROUP BY section, part_id, set_number
        ORDER BY cnt DESC
        LIMIT 15
      ) t
    ), '[]'::jsonb),
    'mock_completions', (
      SELECT count(*)::bigint
      FROM public.practice_attempts
      WHERE created_at >= v_since AND section = 'mock'
    ),
    'total_attempts', (
      SELECT count(*)::bigint FROM public.practice_attempts WHERE created_at >= v_since
    ),
    'unique_users', (
      SELECT count(DISTINCT user_id)::bigint FROM public.practice_attempts WHERE created_at >= v_since
    ),
    'activation_rate', (
      SELECT CASE WHEN signup_count = 0 THEN 0
        ELSE round((activated::numeric / signup_count) * 100, 1) END
      FROM (
        SELECT
          (SELECT count(*) FROM public.profiles WHERE created_at >= v_since) AS signup_count,
          (SELECT count(DISTINCT pa.user_id)
           FROM public.practice_attempts pa
           JOIN public.profiles p ON p.id = pa.user_id
           WHERE p.created_at >= v_since
             AND pa.created_at <= p.created_at + interval '7 days') AS activated
      ) x
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_product_stats(INTEGER) TO authenticated;
