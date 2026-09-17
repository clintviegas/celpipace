-- ==========================================================================
-- CELPIPACE — Study reminder / re-engagement campaign support
--
-- Re-engagement targets learners who PRACTISED before but have gone quiet.
-- "Last activity" = the most recent row in practice_attempts. We expose it
-- through an RPC so the cron job can do the heavy MAX()/GROUP BY in Postgres
-- instead of pulling every attempt into the function.
--
-- The cron job ticks daily and fires a reminder when a user's LAST attempt
-- falls into the window for a step (e.g. exactly 3 / 7 / 14 days ago). Because
-- practising again moves last_attempt_at forward, each step fires at most once
-- per inactivity streak.
--
-- Reuses the existing marketing_sends ledger for idempotency (UNIQUE
-- (user_id, campaign_key)) — no new table needed.
--
-- Safe to re-run.
-- ==========================================================================

-- Returns consented, not-unsubscribed users whose most-recent practice attempt
-- falls in [p_lower, p_upper). One row per user.
CREATE OR REPLACE FUNCTION public.reminder_candidates(
  p_lower TIMESTAMPTZ,
  p_upper TIMESTAMPTZ,
  p_limit INTEGER DEFAULT 200
)
RETURNS TABLE (
  user_id          UUID,
  email            TEXT,
  full_name        TEXT,
  is_premium       BOOLEAN,
  last_attempt_at  TIMESTAMPTZ,
  total_attempts   BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id                         AS user_id,
    p.email                      AS email,
    p.full_name                  AS full_name,
    p.is_premium                 AS is_premium,
    a.last_attempt_at            AS last_attempt_at,
    a.total_attempts             AS total_attempts
  FROM public.profiles p
  JOIN (
    SELECT
      user_id,
      MAX(created_at) AS last_attempt_at,
      COUNT(*)        AS total_attempts
    FROM public.practice_attempts
    GROUP BY user_id
  ) a ON a.user_id = p.id
  WHERE p.marketing_consent = TRUE
    AND p.marketing_unsubscribed_at IS NULL
    AND p.email IS NOT NULL
    AND a.last_attempt_at >= p_lower
    AND a.last_attempt_at <  p_upper
  ORDER BY a.last_attempt_at ASC
  LIMIT GREATEST(p_limit, 0);
$$;

-- Only the service role (cron) should call this. Lock out anon/authenticated.
REVOKE ALL ON FUNCTION public.reminder_candidates(TIMESTAMPTZ, TIMESTAMPTZ, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reminder_candidates(TIMESTAMPTZ, TIMESTAMPTZ, INTEGER) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reminder_candidates(TIMESTAMPTZ, TIMESTAMPTZ, INTEGER) TO service_role;

-- Helps the MAX(created_at) per-user aggregation above.
CREATE INDEX IF NOT EXISTS idx_practice_attempts_user_created_at
  ON public.practice_attempts (user_id, created_at);
