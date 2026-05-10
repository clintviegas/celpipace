-- ═══════════════════════════════════════════════════════════════
-- celpipAce — Phase 1 audit / observability tables
-- subscription_events  — interpreted subscription state changes
-- webhook_events       — raw Stripe event archive (replay + dedupe)
-- cancellation_feedback— user-provided cancel reasons
-- email_log            — outgoing transactional email audit
-- All RLS-locked; writes via service role only.
-- Idempotent.
-- ═══════════════════════════════════════════════════════════════

-- ── subscription_events ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscription_events (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email                    TEXT,
  event_type               TEXT NOT NULL,
  prev_status              TEXT,
  new_status               TEXT,
  plan                     TEXT,
  amount_cents             INTEGER,
  currency                 TEXT,
  cancel_at_period_end     BOOLEAN,
  current_period_end       TIMESTAMPTZ,
  stripe_event_id          TEXT,
  stripe_subscription_id   TEXT,
  stripe_customer_id       TEXT,
  stripe_invoice_id        TEXT,
  reason                   TEXT,
  metadata                 JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sub_events_user      ON public.subscription_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sub_events_type      ON public.subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_sub_events_stripe_id ON public.subscription_events(stripe_event_id);

ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own sub events"  ON public.subscription_events;
DROP POLICY IF EXISTS "Admin reads all sub events" ON public.subscription_events;
CREATE POLICY "Users read own sub events"
  ON public.subscription_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin reads all sub events"
  ON public.subscription_events FOR SELECT
  USING (COALESCE(auth.jwt() ->> 'email', '') = 'clint.viegas@gmail.com');

-- ── webhook_events ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source            TEXT NOT NULL DEFAULT 'stripe',
  stripe_event_id   TEXT UNIQUE,
  event_type        TEXT NOT NULL,
  payload           JSONB NOT NULL,
  signature_valid   BOOLEAN NOT NULL DEFAULT true,
  processed         BOOLEAN NOT NULL DEFAULT false,
  processing_error  TEXT,
  received_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at      TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_webhook_events_type      ON public.webhook_events(event_type, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON public.webhook_events(processed, received_at);

ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin reads all webhook events" ON public.webhook_events;
CREATE POLICY "Admin reads all webhook events"
  ON public.webhook_events FOR SELECT
  USING (COALESCE(auth.jwt() ->> 'email', '') = 'clint.viegas@gmail.com');

-- ── cancellation_feedback ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cancellation_feedback (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email                    TEXT,
  reason                   TEXT NOT NULL,
  free_text                TEXT,
  would_return             BOOLEAN,
  plan_at_cancel           TEXT,
  stripe_subscription_id   TEXT,
  current_period_end       TIMESTAMPTZ,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cancel_feedback_user    ON public.cancellation_feedback(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cancel_feedback_reason  ON public.cancellation_feedback(reason);

ALTER TABLE public.cancellation_feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own cancel feedback"  ON public.cancellation_feedback;
DROP POLICY IF EXISTS "Users insert own cancel feedback" ON public.cancellation_feedback;
DROP POLICY IF EXISTS "Admin reads all cancel feedback" ON public.cancellation_feedback;
CREATE POLICY "Users read own cancel feedback"
  ON public.cancellation_feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own cancel feedback"
  ON public.cancellation_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin reads all cancel feedback"
  ON public.cancellation_feedback FOR SELECT
  USING (COALESCE(auth.jwt() ->> 'email', '') = 'clint.viegas@gmail.com');

-- ── email_log ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.email_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  to_email      TEXT NOT NULL,
  kind          TEXT NOT NULL,
  subject       TEXT,
  provider      TEXT,
  provider_id   TEXT,
  pdf_url       TEXT,
  status        TEXT NOT NULL DEFAULT 'queued',
  error         TEXT,
  metadata      JSONB NOT NULL DEFAULT '{}'::jsonb,
  sent_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_email_log_user   ON public.email_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_log_kind   ON public.email_log(kind, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_log_status ON public.email_log(status);

ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own email log"  ON public.email_log;
DROP POLICY IF EXISTS "Admin reads all email log" ON public.email_log;
CREATE POLICY "Users read own email log"
  ON public.email_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin reads all email log"
  ON public.email_log FOR SELECT
  USING (COALESCE(auth.jwt() ->> 'email', '') = 'clint.viegas@gmail.com');
