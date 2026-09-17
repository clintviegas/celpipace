-- ============================================================================
-- Marketing email infrastructure (CASL-compliant)
--
-- Adds explicit-consent fields to profiles and a per-user campaign-step ledger
-- so cron jobs can drive idempotent drip sequences without ever sending the
-- same step twice or sending to anyone who hasn't opted in.
--
-- Safe to re-run.
-- ============================================================================

-- ── 1. profiles consent columns ───────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS marketing_consent          BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS marketing_consent_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS marketing_unsubscribed_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS resend_contact_id          TEXT,
  ADD COLUMN IF NOT EXISTS terms_accepted_at          TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS terms_version              TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_marketing_eligible
  ON public.profiles (created_at)
  WHERE marketing_consent = TRUE
    AND marketing_unsubscribed_at IS NULL
    AND is_premium = FALSE;

-- ── 2. marketing_sends ledger ────────────────────────────────────────────
-- One row per (user_id, campaign_key). UNIQUE constraint is the idempotency
-- guard — INSERT...ON CONFLICT DO NOTHING in the cron path means a duplicate
-- run can never double-send.
CREATE TABLE IF NOT EXISTS public.marketing_sends (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_key  TEXT        NOT NULL,
  email_log_id  UUID        REFERENCES public.email_log(id) ON DELETE SET NULL,
  sent_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata      JSONB       NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (user_id, campaign_key)
);

CREATE INDEX IF NOT EXISTS idx_marketing_sends_user
  ON public.marketing_sends (user_id, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_marketing_sends_campaign
  ON public.marketing_sends (campaign_key, sent_at DESC);

ALTER TABLE public.marketing_sends ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own marketing sends" ON public.marketing_sends;
CREATE POLICY "Users read own marketing sends"
  ON public.marketing_sends FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin reads all marketing sends" ON public.marketing_sends;
CREATE POLICY "Admin reads all marketing sends"
  ON public.marketing_sends FOR SELECT
  USING (COALESCE(auth.jwt() ->> 'email', '') = 'clint.viegas@gmail.com');

-- INSERT/UPDATE only via service role (cron + endpoints). No client write policies.

-- ── 3. extend email_log.kind to allow marketing kinds ─────────────────────
-- email_log already has a free-text `kind` column (no enum). No schema change
-- needed; we'll use kinds: 'free2premium_d2', 'free2premium_d5', 'free2premium_d14',
-- 'broadcast:<slug>', etc.
