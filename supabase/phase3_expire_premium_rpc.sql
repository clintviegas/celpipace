-- ═══════════════════════════════════════════════════════════════
-- expire_premium_users()
-- Backstop: any profile whose premium_expires_at has elapsed but is still
-- flagged is_premium gets corrected. Called from the Stripe webhook handler
-- on every event, and via a Vercel cron (see vercel.json).
-- Idempotent.
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.expire_premium_users()
RETURNS TABLE(expired_user_id uuid, expired_email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH expired AS (
    UPDATE public.profiles
    SET
      is_premium             = false,
      subscription_status    = CASE WHEN subscription_status IN ('expired','canceled') THEN subscription_status ELSE 'expired' END,
      current_plan           = 'free',
      cancel_at_period_end   = false,
      updated_at             = now()
    WHERE is_premium = true
      AND premium_expires_at IS NOT NULL
      AND premium_expires_at < now()
    RETURNING id, email
  )
  SELECT id AS expired_user_id, email AS expired_email FROM expired;
END;
$$;

GRANT EXECUTE ON FUNCTION public.expire_premium_users() TO service_role;
REVOKE EXECUTE ON FUNCTION public.expire_premium_users() FROM PUBLIC, anon, authenticated;
