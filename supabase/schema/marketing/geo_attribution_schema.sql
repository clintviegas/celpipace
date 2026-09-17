-- ============================================================================
-- Signup geo + attribution fields for the admin dashboard
--
-- Safe to re-run. Run this in Supabase if the Admin users table shows blank
-- locations or if /api/on-signup logs missing profile geo/attribution columns.
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country_code TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS region TEXT,
  ADD COLUMN IF NOT EXISTS timezone TEXT,
  ADD COLUMN IF NOT EXISTS locale TEXT,
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS utm_content TEXT,
  ADD COLUMN IF NOT EXISTS utm_term TEXT,
  ADD COLUMN IF NOT EXISTS landing_page TEXT,
  ADD COLUMN IF NOT EXISTS referrer TEXT,
  ADD COLUMN IF NOT EXISTS first_touch_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS signup_ip_hash TEXT,
  ADD COLUMN IF NOT EXISTS signup_user_agent TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_country_code
  ON public.profiles(country_code) WHERE country_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_utm_source
  ON public.profiles(utm_source) WHERE utm_source IS NOT NULL;

COMMENT ON COLUMN public.profiles.signup_ip_hash IS
  'SHA-256 hash of signup IP with server-side salt. Raw IP is not stored.';