-- ═══════════════════════════════════════════════════════════════
-- celpipAce — Subscriptions schema (Stripe recurring)
-- Run AFTER auth_premium.sql and payments_schema.sql.
-- Idempotent — safe to re-run.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Augment profiles with subscription state ───────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_status      TEXT,                  -- active | trialing | past_due | canceled | expired | incomplete
  ADD COLUMN IF NOT EXISTS stripe_subscription_id   TEXT,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end     BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS current_period_start     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS current_period_end       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_payment_at          TIMESTAMPTZ;

-- Default plan column for existing rows
UPDATE public.profiles SET current_plan = 'free' WHERE current_plan IS NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_subscription
  ON public.profiles(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_profiles_premium_expiry
  ON public.profiles(premium_expires_at) WHERE premium_expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_status
  ON public.profiles(subscription_status);

-- ── 2. Source-of-truth premium check ──────────────────────────────────────
-- Returns TRUE only if:
--   • profile.is_premium is true AND
--   • premium_expires_at is null (lifetime/admin) OR in the future AND
--   • subscription_status is not 'expired' (canceled is fine until period ends)
--
-- The auto-expiry sweep (function below) will flip stale rows to
-- is_premium=false, so this stays a fast index lookup.
CREATE OR REPLACE FUNCTION public.is_premium_active(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT
        p.is_premium
        AND COALESCE(p.subscription_status, 'active') <> 'expired'
        AND (p.premium_expires_at IS NULL OR p.premium_expires_at > now())
      FROM public.profiles p
      WHERE p.id = p_user_id
    ),
    FALSE
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_premium_active(UUID) TO authenticated, anon;

-- Convenience: caller's own status without passing UUID
CREATE OR REPLACE FUNCTION public.am_i_premium()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.is_premium_active(auth.uid());
$$;

GRANT EXECUTE ON FUNCTION public.am_i_premium() TO authenticated;

-- ── 3. Server-side gate used by other RPCs ────────────────────────────────
-- Use this inside any future RPC that returns premium-only payloads:
--   PERFORM public.assert_premium();
CREATE OR REPLACE FUNCTION public.assert_premium()
RETURNS VOID
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'auth required' USING ERRCODE = '42501';
  END IF;
  IF NOT public.is_premium_active(auth.uid()) THEN
    RAISE EXCEPTION 'premium required' USING ERRCODE = '42501';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.assert_premium() TO authenticated;

-- ── 4. Auto-expire stale premium rows ─────────────────────────────────────
-- Call from a Supabase scheduled job (Edge Function / pg_cron) every 15 min.
-- Also safe to call from the webhook on every event as a backstop.
CREATE OR REPLACE FUNCTION public.expire_premium_users()
RETURNS INT
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE public.profiles
     SET is_premium          = FALSE,
         subscription_status = 'expired',
         current_plan        = 'free',
         updated_at          = now()
   WHERE is_premium = TRUE
     AND premium_expires_at IS NOT NULL
     AND premium_expires_at <= now();
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.expire_premium_users() TO service_role;

-- Optional: schedule via pg_cron if available (uncomment after enabling extension)
-- SELECT cron.schedule('expire-premium-users', '*/15 * * * *', $$SELECT public.expire_premium_users();$$);

-- ── 5. RLS: lock down profile writes that affect billing ──────────────────
-- Users may already update their profile (display_name, avatar) but they must
-- NOT be able to flip is_premium/subscription_status themselves. Enforce by
-- replacing the UPDATE policy with one that rejects billing-column changes.

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin updates all profiles" ON public.profiles;

-- Users can update only safe columns (others must come from service role / webhook)
CREATE POLICY "Users update own profile (safe columns)"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin updates all profiles"
  ON public.profiles FOR UPDATE
  USING (auth.jwt() ->> 'email' = 'clint.viegas@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'clint.viegas@gmail.com');

-- Trigger guard: even with a permissive UPDATE policy, reject changes to billing fields
CREATE OR REPLACE FUNCTION public.guard_profile_billing_columns()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Allow service role and the admin console account to bypass.
  IF auth.role() = 'service_role' OR auth.jwt() ->> 'email' = 'clint.viegas@gmail.com' THEN
    RETURN NEW;
  END IF;

  IF NEW.is_premium             IS DISTINCT FROM OLD.is_premium             OR
     NEW.subscription_status    IS DISTINCT FROM OLD.subscription_status    OR
     NEW.current_plan           IS DISTINCT FROM OLD.current_plan           OR
     NEW.premium_expires_at     IS DISTINCT FROM OLD.premium_expires_at     OR
     NEW.premium_granted_at     IS DISTINCT FROM OLD.premium_granted_at     OR
     NEW.premium_source         IS DISTINCT FROM OLD.premium_source         OR
     NEW.stripe_customer_id     IS DISTINCT FROM OLD.stripe_customer_id     OR
     NEW.stripe_subscription_id IS DISTINCT FROM OLD.stripe_subscription_id OR
     NEW.cancel_at_period_end   IS DISTINCT FROM OLD.cancel_at_period_end   OR
     NEW.current_period_start   IS DISTINCT FROM OLD.current_period_start   OR
     NEW.current_period_end     IS DISTINCT FROM OLD.current_period_end
  THEN
    RAISE EXCEPTION 'Billing columns are read-only from the client'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_profile_billing ON public.profiles;
CREATE TRIGGER trg_guard_profile_billing
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_billing_columns();

-- ── 6. Helper view for the user's own subscription summary ────────────────
CREATE OR REPLACE VIEW public.my_subscription AS
SELECT
  p.id                         AS user_id,
  p.email,
  p.current_plan,
  p.is_premium,
  p.subscription_status,
  p.cancel_at_period_end,
  p.current_period_start,
  p.current_period_end,
  p.premium_expires_at,
  p.premium_granted_at,
  p.last_payment_at,
  p.stripe_customer_id IS NOT NULL AS has_stripe_account
FROM public.profiles p
WHERE p.id = auth.uid();

GRANT SELECT ON public.my_subscription TO authenticated;

-- ── 7. Mark clint.viegas@gmail.com (admin) as lifetime active ────────────────
UPDATE public.profiles
   SET is_premium = TRUE,
       subscription_status = 'active',
       current_plan = 'admin',
       premium_expires_at = NULL
 WHERE email = 'clint.viegas@gmail.com';
