-- ═══════════════════════════════════════════════════════════════
-- celpipAce — profiles + premium flag + admin view
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- Safe to re-run (idempotent).
-- ═══════════════════════════════════════════════════════════════

-- 1. profiles table (email marketing list + premium flag)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT        NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  is_premium  BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add column if an older profiles table already existed
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

-- 2. Row-Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own profile"    ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile"  ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile"  ON public.profiles;
DROP POLICY IF EXISTS "Admin reads all profiles"  ON public.profiles;

CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admin (sales@celpipace.com) can read every profile
CREATE POLICY "Admin reads all profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.jwt() ->> 'email' = 'sales@celpipace.com'
  );

-- 3. Flip sales@celpipace.com → premium + admin tag (runs only after account exists)
UPDATE public.profiles
   SET is_premium = true
 WHERE email = 'sales@celpipace.com';

-- 4. Auto-set is_premium=true every time the sales account's profile is inserted/updated
CREATE OR REPLACE FUNCTION public.ensure_admin_premium()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email = 'sales@celpipace.com' THEN
    NEW.is_premium := true;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ensure_admin_premium ON public.profiles;
CREATE TRIGGER trg_ensure_admin_premium
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.ensure_admin_premium();

-- 4b. Create/sync a profile row whenever Supabase Auth creates a user.
-- This keeps the admin user list complete and preserves signup display names.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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

  INSERT INTO public.profiles (id, email, full_name, avatar_url, is_premium, created_at, updated_at, last_seen_at)
  VALUES (
    NEW.id,
    lower(COALESCE(NEW.email, '')),
    v_full_name,
    v_avatar_url,
    lower(COALESCE(NEW.email, '')) = 'sales@celpipace.com',
    COALESCE(NEW.created_at, now()),
    now(),
    COALESCE(NEW.last_sign_in_at, NEW.created_at, now())
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    is_premium = CASE WHEN EXCLUDED.email = 'sales@celpipace.com' THEN TRUE ELSE public.profiles.is_premium END,
    last_seen_at = GREATEST(
      COALESCE(public.profiles.last_seen_at, '-infinity'::timestamptz),
      COALESCE(EXCLUDED.last_seen_at, '-infinity'::timestamptz)
    ),
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE OF email, raw_user_meta_data, last_sign_in_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill any auth users created before this trigger existed.
INSERT INTO public.profiles (id, email, full_name, avatar_url, is_premium, created_at, updated_at, last_seen_at)
SELECT
  u.id,
  lower(COALESCE(u.email, '')),
  NULLIF(
    regexp_replace(
      trim(COALESCE(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', '')),
      '\s+',
      ' ',
      'g'
    ),
    ''
  ),
  NULLIF(COALESCE(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture'), ''),
  lower(COALESCE(u.email, '')) = 'sales@celpipace.com',
  COALESCE(u.created_at, now()),
  now(),
  COALESCE(u.last_sign_in_at, u.created_at, now())
FROM auth.users u
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
  avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
  is_premium = CASE WHEN EXCLUDED.email = 'sales@celpipace.com' THEN TRUE ELSE public.profiles.is_premium END,
  last_seen_at = GREATEST(
    COALESCE(public.profiles.last_seen_at, '-infinity'::timestamptz),
    COALESCE(EXCLUDED.last_seen_at, '-infinity'::timestamptz)
  ),
  updated_at = now();

-- 5. Helpful index
CREATE INDEX IF NOT EXISTS idx_profiles_created_at
  ON public.profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen_at
  ON public.profiles(last_seen_at DESC NULLS LAST);
