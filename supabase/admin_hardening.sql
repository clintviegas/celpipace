-- ============================================================================
-- celpipAce admin/auth hardening
-- Run after auth_premium.sql, payments_schema.sql, subscriptions_schema.sql,
-- progress_schema.sql, writing_schema.sql, and test_sessions_schema.sql.
-- Safe to re-run.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Profiles: columns used by auth, billing, and activity analytics
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS premium_source TEXT,
  ADD COLUMN IF NOT EXISTS premium_granted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS current_plan TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_payment_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_profiles_last_seen_at
  ON public.profiles(last_seen_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_profiles_email_lower
  ON public.profiles(lower(email));

-- ---------------------------------------------------------------------------
-- Single admin predicate used by policies and RPCs
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_app_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT COALESCE(auth.jwt() ->> 'email', '') = 'sales@celpipace.com';
$$;

GRANT EXECUTE ON FUNCTION public.is_app_admin() TO anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Profile creation/sync for every Supabase Auth user
-- Fixes signups that do not appear in the admin users list.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_full_name TEXT;
  v_avatar_url TEXT;
BEGIN
  v_full_name := NULLIF(
    regexp_replace(
      trim(COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', '')),
      '\s+',
      ' ',
      'g'
    ),
    ''
  );
  v_avatar_url := NULLIF(COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture'), '');

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    is_premium,
    subscription_status,
    current_plan,
    created_at,
    updated_at,
    last_seen_at
  ) VALUES (
    NEW.id,
    lower(COALESCE(NEW.email, '')),
    v_full_name,
    v_avatar_url,
    lower(COALESCE(NEW.email, '')) = 'sales@celpipace.com',
    CASE WHEN lower(COALESCE(NEW.email, '')) = 'sales@celpipace.com' THEN 'active' ELSE 'none' END,
    CASE WHEN lower(COALESCE(NEW.email, '')) = 'sales@celpipace.com' THEN 'admin' ELSE 'free' END,
    COALESCE(NEW.created_at, now()),
    now(),
    COALESCE(NEW.last_sign_in_at, NEW.created_at, now())
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    is_premium = CASE
      WHEN EXCLUDED.email = 'sales@celpipace.com' THEN TRUE
      ELSE public.profiles.is_premium
    END,
    subscription_status = CASE
      WHEN EXCLUDED.email = 'sales@celpipace.com' THEN 'active'
      ELSE COALESCE(public.profiles.subscription_status, 'none')
    END,
    current_plan = CASE
      WHEN EXCLUDED.email = 'sales@celpipace.com' THEN 'admin'
      ELSE COALESCE(public.profiles.current_plan, 'free')
    END,
    last_seen_at = GREATEST(
      COALESCE(public.profiles.last_seen_at, '-infinity'::timestamptz),
      COALESCE(EXCLUDED.last_seen_at, '-infinity'::timestamptz)
    ),
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE OF email, raw_user_meta_data, last_sign_in_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill/sync any users created before the trigger existed.
WITH auth_profiles AS (
  SELECT
    u.id,
    lower(COALESCE(u.email, '')) AS email,
    NULLIF(
      regexp_replace(
        trim(COALESCE(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', '')),
        '\s+',
        ' ',
        'g'
      ),
      ''
    ) AS full_name,
    NULLIF(COALESCE(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture'), '') AS avatar_url,
    u.created_at,
    u.last_sign_in_at
  FROM auth.users u
)
INSERT INTO public.profiles (id, email, full_name, avatar_url, is_premium, subscription_status, current_plan, created_at, updated_at, last_seen_at)
SELECT
  id,
  email,
  full_name,
  avatar_url,
  email = 'sales@celpipace.com',
  CASE WHEN email = 'sales@celpipace.com' THEN 'active' ELSE 'none' END,
  CASE WHEN email = 'sales@celpipace.com' THEN 'admin' ELSE 'free' END,
  COALESCE(created_at, now()),
  now(),
  COALESCE(last_sign_in_at, created_at, now())
FROM auth_profiles
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
  avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
  is_premium = CASE WHEN EXCLUDED.email = 'sales@celpipace.com' THEN TRUE ELSE public.profiles.is_premium END,
  subscription_status = CASE WHEN EXCLUDED.email = 'sales@celpipace.com' THEN 'active' ELSE COALESCE(public.profiles.subscription_status, 'none') END,
  current_plan = CASE WHEN EXCLUDED.email = 'sales@celpipace.com' THEN 'admin' ELSE COALESCE(public.profiles.current_plan, 'free') END,
  last_seen_at = GREATEST(
    COALESCE(public.profiles.last_seen_at, '-infinity'::timestamptz),
    COALESCE(EXCLUDED.last_seen_at, '-infinity'::timestamptz)
  ),
  updated_at = now();

-- ---------------------------------------------------------------------------
-- RLS: users manage their own safe profile fields; admin can read/update all.
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile (safe columns)" ON public.profiles;
DROP POLICY IF EXISTS "Admin reads all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin updates all profiles" ON public.profiles;

CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users update own profile (safe columns)"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin reads all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_app_admin());

CREATE POLICY "Admin updates all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_app_admin())
  WITH CHECK (public.is_app_admin());

-- Billing fields are server/admin only. Regular users may still edit safe fields.
CREATE OR REPLACE FUNCTION public.guard_profile_billing_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, auth
AS $$
BEGIN
  IF auth.role() = 'service_role' OR public.is_app_admin() THEN
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
     NEW.current_period_end     IS DISTINCT FROM OLD.current_period_end     OR
     NEW.last_payment_at        IS DISTINCT FROM OLD.last_payment_at
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

-- Client heartbeat for last_seen_at. This is throttled in the React app.
CREATE OR REPLACE FUNCTION public.touch_user_activity()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RETURN;
  END IF;

  UPDATE public.profiles
     SET last_seen_at = now(), updated_at = now()
   WHERE id = v_uid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.touch_user_activity() TO authenticated;

-- ---------------------------------------------------------------------------
-- Admin read policies for activity sources, if those tables exist.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.user_progress') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Admin reads all user progress" ON public.user_progress';
    EXECUTE 'CREATE POLICY "Admin reads all user progress" ON public.user_progress FOR SELECT USING (public.is_app_admin())';
  END IF;

  IF to_regclass('public.test_sessions') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Admin reads all test sessions" ON public.test_sessions';
    EXECUTE 'CREATE POLICY "Admin reads all test sessions" ON public.test_sessions FOR SELECT USING (public.is_app_admin())';
  END IF;

  IF to_regclass('public.writing_responses') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.writing_responses ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Admin reads all writing responses" ON public.writing_responses';
    EXECUTE 'CREATE POLICY "Admin reads all writing responses" ON public.writing_responses FOR SELECT USING (public.is_app_admin())';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Admin-only activity RPC used by /admin Activity tab.
-- Uses dynamic SQL so it still works if an optional activity table is absent.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_admin_user_activity()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ,
  last_response_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  response_count BIGINT,
  completed_sessions_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_progress_sql TEXT;
  v_sessions_sql TEXT;
  v_writing_sql TEXT;
  v_sql TEXT;
BEGIN
  IF NOT public.is_app_admin() THEN
    RAISE EXCEPTION 'admin required' USING ERRCODE = '42501';
  END IF;

  IF to_regclass('public.user_progress') IS NOT NULL THEN
    v_progress_sql := $q$
      SELECT
        user_id,
        updated_at AS progress_last_at,
        CASE
          WHEN jsonb_typeof(progress_data -> 'activity') = 'array'
            THEN jsonb_array_length(progress_data -> 'activity')::bigint
          ELSE 0::bigint
        END AS progress_count
      FROM public.user_progress
    $q$;
  ELSE
    v_progress_sql := 'SELECT NULL::uuid AS user_id, NULL::timestamptz AS progress_last_at, 0::bigint AS progress_count WHERE FALSE';
  END IF;

  IF to_regclass('public.test_sessions') IS NOT NULL THEN
    v_sessions_sql := $q$
      SELECT
        user_id,
        max(COALESCE(completed_at, updated_at, started_at)) AS session_last_at,
        count(*)::bigint AS session_count,
        count(*) FILTER (WHERE is_completed)::bigint AS completed_sessions_count
      FROM public.test_sessions
      GROUP BY user_id
    $q$;
  ELSE
    v_sessions_sql := 'SELECT NULL::uuid AS user_id, NULL::timestamptz AS session_last_at, 0::bigint AS session_count, 0::bigint AS completed_sessions_count WHERE FALSE';
  END IF;

  IF to_regclass('public.writing_responses') IS NOT NULL THEN
    v_writing_sql := $q$
      SELECT
        user_id,
        max(COALESCE(submitted_at, created_at)) AS writing_last_at,
        count(*)::bigint AS writing_count
      FROM public.writing_responses
      GROUP BY user_id
    $q$;
  ELSE
    v_writing_sql := 'SELECT NULL::uuid AS user_id, NULL::timestamptz AS writing_last_at, 0::bigint AS writing_count WHERE FALSE';
  END IF;

  v_sql := '
    WITH progress AS (' || v_progress_sql || '),
    sessions AS (' || v_sessions_sql || '),
    writing AS (' || v_writing_sql || '),
    combined AS (
      SELECT
        p.id AS user_id,
        p.email,
        p.full_name,
        p.created_at,
        COALESCE(p.last_seen_at, p.created_at) AS last_seen_at,
        NULLIF(
          GREATEST(
            COALESCE(pr.progress_last_at, ''-infinity''::timestamptz),
            COALESCE(s.session_last_at, ''-infinity''::timestamptz),
            COALESCE(w.writing_last_at, ''-infinity''::timestamptz)
          ),
          ''-infinity''::timestamptz
        ) AS last_response_at,
        GREATEST(
          COALESCE(p.last_seen_at, p.created_at, ''-infinity''::timestamptz),
          COALESCE(pr.progress_last_at, ''-infinity''::timestamptz),
          COALESCE(s.session_last_at, ''-infinity''::timestamptz),
          COALESCE(w.writing_last_at, ''-infinity''::timestamptz)
        ) AS last_activity_at,
        (COALESCE(pr.progress_count, 0) + COALESCE(s.session_count, 0) + COALESCE(w.writing_count, 0))::bigint AS response_count,
        COALESCE(s.completed_sessions_count, 0)::bigint AS completed_sessions_count
      FROM public.profiles p
      LEFT JOIN progress pr ON pr.user_id = p.id
      LEFT JOIN sessions s ON s.user_id = p.id
      LEFT JOIN writing w ON w.user_id = p.id
    )
    SELECT
      user_id,
      email,
      full_name,
      created_at,
      last_seen_at,
      last_response_at,
      last_activity_at,
      response_count,
      completed_sessions_count
    FROM combined
    ORDER BY last_activity_at DESC NULLS LAST, created_at DESC
  ';

  RETURN QUERY EXECUTE v_sql;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_user_activity() TO authenticated;

-- Keep the admin account premium/lifetime if it already exists.
UPDATE public.profiles
   SET is_premium = TRUE,
       subscription_status = 'active',
       current_plan = 'admin',
       premium_expires_at = NULL,
       updated_at = now()
 WHERE email = 'sales@celpipace.com';
