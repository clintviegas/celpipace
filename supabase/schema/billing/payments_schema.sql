-- ═══════════════════════════════════════════════════════════════
-- celpipAce — payments / subscriptions schema (Stripe)
-- Run in Supabase Dashboard → SQL Editor → New Query
-- Idempotent — safe to re-run.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Augment profiles with subscription fields ──────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS premium_source       TEXT,
  ADD COLUMN IF NOT EXISTS premium_granted_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS premium_expires_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stripe_customer_id   TEXT,
  ADD COLUMN IF NOT EXISTS current_plan         TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer
  ON public.profiles(stripe_customer_id);

-- ── 2. payments table — one row per successful Stripe checkout ──
CREATE TABLE IF NOT EXISTS public.payments (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email                    TEXT NOT NULL,
  plan                     TEXT NOT NULL,            -- 'weekly' | 'monthly' | 'annual'
  amount_cents             INTEGER NOT NULL,         -- amount actually charged, in cents
  currency                 TEXT NOT NULL DEFAULT 'usd',
  status                   TEXT NOT NULL DEFAULT 'paid',  -- paid | refunded | failed
  stripe_session_id        TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  stripe_customer_id       TEXT,
  granted_days             INTEGER,                  -- access window granted
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_created_at  ON public.payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_user_id     ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status      ON public.payments(status);

-- ── 3. RLS ──────────────────────────────────────────────────────
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own payments"  ON public.payments;
DROP POLICY IF EXISTS "Admin reads all payments" ON public.payments;

CREATE POLICY "Users read own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admin reads all payments"
  ON public.payments FOR SELECT
  USING (auth.jwt() ->> 'email' = 'clint.viegas@gmail.com');

-- NOTE: writes are performed by the Stripe webhook using the SERVICE ROLE key,
-- which bypasses RLS. We deliberately do NOT add INSERT/UPDATE policies for
-- regular users.

-- ── 4. Revenue summary view (admin-only via RLS on underlying table) ──
CREATE OR REPLACE VIEW public.revenue_daily AS
SELECT
  date_trunc('day', created_at)::date AS day,
  count(*)                            AS num_payments,
  sum(amount_cents) / 100.0           AS revenue
FROM public.payments
WHERE status = 'paid'
GROUP BY 1
ORDER BY 1 DESC;
