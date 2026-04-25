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

-- 5. Helpful index
CREATE INDEX IF NOT EXISTS idx_profiles_created_at
  ON public.profiles(created_at DESC);
