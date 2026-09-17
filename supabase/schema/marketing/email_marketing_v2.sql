-- ==========================================================================
-- CELPIPACE — Email marketing v2
--
-- Adds the data model behind four new code-driven email sequences:
--   1. Exam-date countdown   → profiles.exam_date
--   2. Abandoned checkout     → public.checkout_intents
--   3. Weekly progress digest → public.weekly_digest_candidates() RPC
--   4. Educational broadcast  → public.broadcasts
--
-- All sequences reuse the existing public.marketing_sends ledger for
-- idempotency (UNIQUE (user_id, campaign_key)) — no per-feature ledger.
--
-- Safe to re-run.
-- ==========================================================================

-- ── 1. Exam-date countdown ────────────────────────────────────────────────
-- A learner-supplied target test date. Drives the T-14 / T-7 / T-3 / T-1
-- countdown sequence (job=examcountdown). Campaign keys embed the date
-- (exam_t7:<date>) so booking a new exam later starts a fresh sequence.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS exam_date DATE;

-- Partial index: only consented, not-unsubscribed learners with a future-ish
-- exam date are ever scanned by the countdown job.
CREATE INDEX IF NOT EXISTS idx_profiles_exam_date
  ON public.profiles (exam_date)
  WHERE exam_date IS NOT NULL
    AND marketing_consent = TRUE
    AND marketing_unsubscribed_at IS NULL;

-- ── 2. Abandoned-checkout recovery ────────────────────────────────────────
-- One row per Stripe Checkout Session we create. Marked converted by the
-- stripe-webhook on checkout.session.completed. The abandoned-checkout job
-- (job=abandoned) finds rows created 1 / 3 days ago that never converted.
CREATE TABLE IF NOT EXISTS public.checkout_intents (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email              TEXT,
  plan               TEXT,
  stripe_session_id  TEXT        NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  converted_at       TIMESTAMPTZ,
  UNIQUE (stripe_session_id)
);

CREATE INDEX IF NOT EXISTS idx_checkout_intents_open
  ON public.checkout_intents (created_at)
  WHERE converted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_checkout_intents_user
  ON public.checkout_intents (user_id, created_at DESC);

ALTER TABLE public.checkout_intents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own checkout intents" ON public.checkout_intents;
CREATE POLICY "Users read own checkout intents"
  ON public.checkout_intents FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin reads all checkout intents" ON public.checkout_intents;
CREATE POLICY "Admin reads all checkout intents"
  ON public.checkout_intents FOR SELECT
  USING (COALESCE(auth.jwt() ->> 'email', '') = 'clint.viegas@gmail.com');
-- INSERT/UPDATE only via service role (checkout endpoint + webhook + cron).

-- Candidate query for the abandoned-checkout job. Returns the most recent
-- un-converted intent per user inside [p_lower, p_upper), but only for users
-- who are consented, not unsubscribed, and still NOT premium (i.e. they truly
-- abandoned — anyone who paid is excluded).
CREATE OR REPLACE FUNCTION public.abandoned_checkout_candidates(
  p_lower TIMESTAMPTZ,
  p_upper TIMESTAMPTZ,
  p_limit INTEGER DEFAULT 200
)
RETURNS TABLE (
  user_id            UUID,
  email              TEXT,
  full_name          TEXT,
  plan               TEXT,
  stripe_session_id  TEXT,
  created_at         TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT ON (ci.user_id)
    ci.user_id,
    COALESCE(ci.email, p.email)  AS email,
    p.full_name                  AS full_name,
    ci.plan                      AS plan,
    ci.stripe_session_id         AS stripe_session_id,
    ci.created_at                AS created_at
  FROM public.checkout_intents ci
  JOIN public.profiles p ON p.id = ci.user_id
  WHERE ci.converted_at IS NULL
    AND ci.created_at >= p_lower
    AND ci.created_at <  p_upper
    AND p.is_premium = FALSE
    AND p.marketing_consent = TRUE
    AND p.marketing_unsubscribed_at IS NULL
    AND COALESCE(ci.email, p.email) IS NOT NULL
  ORDER BY ci.user_id, ci.created_at DESC
  LIMIT GREATEST(p_limit, 0);
$$;

REVOKE ALL ON FUNCTION public.abandoned_checkout_candidates(TIMESTAMPTZ, TIMESTAMPTZ, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.abandoned_checkout_candidates(TIMESTAMPTZ, TIMESTAMPTZ, INTEGER) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.abandoned_checkout_candidates(TIMESTAMPTZ, TIMESTAMPTZ, INTEGER) TO service_role;

-- ── 3. Weekly progress digest ─────────────────────────────────────────────
-- Per-user practice stats for the last 7 days (job=digest). Returns one row
-- per consented user who practised at least once in the window, with a
-- per-section breakdown so the email can call out their weakest section.
CREATE OR REPLACE FUNCTION public.weekly_digest_candidates(
  p_since TIMESTAMPTZ,
  p_limit INTEGER DEFAULT 200,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  user_id        UUID,
  email          TEXT,
  full_name      TEXT,
  is_premium     BOOLEAN,
  sets_7d        BIGINT,
  avg_pct_7d     NUMERIC,
  section_stats  JSONB
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH recent AS (
    SELECT user_id, section, pct
    FROM public.practice_attempts
    WHERE created_at >= p_since
      AND pct IS NOT NULL
  ),
  per_section AS (
    SELECT
      user_id,
      section,
      COUNT(*)              AS n,
      ROUND(AVG(pct))::INT  AS avg_pct
    FROM recent
    GROUP BY user_id, section
  ),
  agg AS (
    SELECT
      user_id,
      COUNT(*)              AS sets_7d,
      ROUND(AVG(pct), 1)    AS avg_pct_7d
    FROM recent
    GROUP BY user_id
  )
  SELECT
    p.id                              AS user_id,
    p.email                           AS email,
    p.full_name                       AS full_name,
    p.is_premium                      AS is_premium,
    a.sets_7d                         AS sets_7d,
    a.avg_pct_7d                      AS avg_pct_7d,
    COALESCE(
      (SELECT jsonb_object_agg(ps.section, jsonb_build_object('n', ps.n, 'avg_pct', ps.avg_pct))
         FROM per_section ps
        WHERE ps.user_id = p.id),
      '{}'::jsonb
    )                                 AS section_stats
  FROM agg a
  JOIN public.profiles p ON p.id = a.user_id
  WHERE p.marketing_consent = TRUE
    AND p.marketing_unsubscribed_at IS NULL
    AND p.email IS NOT NULL
  ORDER BY a.sets_7d DESC, p.id
  LIMIT GREATEST(p_limit, 0)
  OFFSET GREATEST(p_offset, 0);
$$;

REVOKE ALL ON FUNCTION public.weekly_digest_candidates(TIMESTAMPTZ, INTEGER, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.weekly_digest_candidates(TIMESTAMPTZ, INTEGER, INTEGER) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.weekly_digest_candidates(TIMESTAMPTZ, INTEGER, INTEGER) TO service_role;

-- ── 4. Educational broadcast / newsletter ─────────────────────────────────
-- One row per newsletter. The broadcast job (job=broadcast) picks up rows
-- with status='scheduled' whose scheduled_at <= now() and emails every
-- consented learner once (campaign_key = 'broadcast:'||slug). Long lists are
-- paginated across daily runs; status flips to 'sent' when fully delivered.
CREATE TABLE IF NOT EXISTS public.broadcasts (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT        NOT NULL UNIQUE,
  subject       TEXT        NOT NULL,
  preheader     TEXT,
  heading       TEXT        NOT NULL,
  body_html     TEXT        NOT NULL,
  cta_url       TEXT,
  cta_label     TEXT,
  audience      TEXT        NOT NULL DEFAULT 'all'   -- 'all' | 'free' | 'premium'
                  CHECK (audience IN ('all', 'free', 'premium')),
  status        TEXT        NOT NULL DEFAULT 'draft'  -- 'draft' | 'scheduled' | 'sending' | 'sent'
                  CHECK (status IN ('draft', 'scheduled', 'sending', 'sent')),
  scheduled_at  TIMESTAMPTZ,
  sent_count    INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_broadcasts_due
  ON public.broadcasts (scheduled_at)
  WHERE status IN ('scheduled', 'sending');

ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin manages broadcasts" ON public.broadcasts;
CREATE POLICY "Admin manages broadcasts"
  ON public.broadcasts FOR ALL
  USING (COALESCE(auth.jwt() ->> 'email', '') = 'clint.viegas@gmail.com')
  WITH CHECK (COALESCE(auth.jwt() ->> 'email', '') = 'clint.viegas@gmail.com');
-- Cron writes via service role (bypasses RLS).

-- Seed the first newsletter as a DRAFT so nothing sends until you flip it to
-- 'scheduled'. Edit the copy, set scheduled_at, then:
--   UPDATE public.broadcasts SET status='scheduled', scheduled_at=now() WHERE slug='clb-myths-01';
INSERT INTO public.broadcasts (slug, subject, preheader, heading, body_html, cta_url, cta_label, audience, status)
VALUES (
  'clb-myths-01',
  '3 CELPIP myths that are costing you a band',
  'The "use big words" trap, the speaking-speed myth, and what examiners actually reward.',
  '3 CELPIP myths that quietly cost you marks',
  '<p>Hi there,</p>
   <p>After scoring thousands of practice responses, the same three misconceptions keep dragging scores down. Fix these and most learners jump half a band.</p>
   <p><strong>1. "Bigger words = higher score."</strong> Examiners reward <em>precise, natural</em> word choice — not thesaurus dumps. A clear common word beats a misused rare one every time.</p>
   <p><strong>2. "Speak fast to sound fluent."</strong> Fluency is about <em>smoothness</em>, not speed. Slow down, finish your sentences, and let your ideas connect.</p>
   <p><strong>3. "More content is better."</strong> A focused answer that fully addresses the task scores higher than a long, scattered one. Answer the question in sentence one.</p>
   <p>Want to see exactly where you stand? Run a timed mock and get an instant CLB report.</p>',
  'https://www.celpipace.ca/exam',
  'Take a free practice set',
  'all',
  'draft'
)
ON CONFLICT (slug) DO NOTHING;
