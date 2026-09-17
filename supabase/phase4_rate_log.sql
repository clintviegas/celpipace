-- ═══════════════════════════════════════════════════════════════
-- api_rate_log — append-only log used by the API rate limiter.
-- Service-role-only writes; users have no read access. Auto-pruned by
-- prune_api_rate_log() — call daily from cron-sweep.
-- Idempotent.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.api_rate_log (
  id          BIGSERIAL PRIMARY KEY,
  scope       TEXT NOT NULL,
  key         TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_rate_log_scope_key_time
  ON public.api_rate_log (scope, key, created_at DESC);

ALTER TABLE public.api_rate_log ENABLE ROW LEVEL SECURITY;
-- No user-facing policies — only service role writes/reads.

CREATE OR REPLACE FUNCTION public.prune_api_rate_log(retain_days INT DEFAULT 30)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count BIGINT;
BEGIN
  WITH d AS (
    DELETE FROM public.api_rate_log
    WHERE created_at < now() - make_interval(days => retain_days)
    RETURNING 1
  )
  SELECT COUNT(*) INTO deleted_count FROM d;
  RETURN deleted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.prune_api_rate_log(INT) TO service_role;
REVOKE EXECUTE ON FUNCTION public.prune_api_rate_log(INT) FROM PUBLIC, anon, authenticated;
