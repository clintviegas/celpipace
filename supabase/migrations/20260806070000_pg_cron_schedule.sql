-- ============================================================================
-- Phase 5 — move scheduling from vercel.json crons to pg_cron + pg_net.
--
-- ⚠️  NOT YET APPLIED. Apply only AFTER the Phase 2-4 code is deployed,
--     otherwise the worker/reconciler jobs POST to endpoints that do not exist
--     yet and simply log 400s.
--
-- WHY MOVE OFF VERCEL CRONS
--   * Hobby documents a 2-cron-job cap. All 9 declared paths are observably
--     firing today, but that is not something to rely on across a redeploy.
--   * Hobby crons fire "within the hour", not on the minute — observed drift
--     is ~30 minutes (jobs declared at :00 ran at :53). The inbox worker needs
--     a one-minute tick, which Vercel crons cannot express at all.
--   * pg_cron records every run in cron.job_run_details, so "did the job run?"
--     becomes a query instead of a guess.
--
-- SAFE TO RUN ALONGSIDE the existing vercel.json crons during migration: every
-- job is idempotent (marketing_sends UNIQUE locks, inbox/outbox claim leases),
-- so double-firing is a no-op. Remove the `crons` array from vercel.json once
-- cron.job_run_details shows a clean week.
--
-- ── ACTIVATION ──────────────────────────────────────────────────────────────
--   1. Store the cron secret (same value as the CRON_SECRET Vercel env var):
--        SELECT vault.create_secret('<CRON_SECRET value>', 'cron_secret');
--      To rotate later:
--        SELECT vault.update_secret(
--          (SELECT id FROM vault.secrets WHERE name = 'cron_secret'),
--          '<new value>');
--   2. SELECT public.schedule_celpipace_jobs('https://celpipace.ca');
--   3. Verify:  SELECT jobname, schedule, active FROM cron.job ORDER BY jobname;
--   4. After a week:  SELECT public.unschedule_celpipace_jobs();  -- to roll back
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Dispatch helper. Reads the bearer token from Vault at call time so the secret
-- never appears in cron.job.command (which is world-readable to superusers and
-- shows up in logs).
CREATE OR REPLACE FUNCTION public.call_cron_job(p_base_url TEXT, p_job TEXT)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault, extensions
AS $$
DECLARE
  v_secret TEXT;
  v_request_id BIGINT;
BEGIN
  SELECT decrypted_secret INTO v_secret
    FROM vault.decrypted_secrets
   WHERE name = 'cron_secret'
   LIMIT 1;

  IF v_secret IS NULL THEN
    RAISE EXCEPTION 'vault secret "cron_secret" is not set — see the activation steps';
  END IF;

  SELECT net.http_post(
    url     := p_base_url || '/api/cron?job=' || p_job,
    headers := jsonb_build_object(
                 'Content-Type',  'application/json',
                 'Authorization', 'Bearer ' || v_secret
               ),
    body    := '{}'::jsonb,
    timeout_milliseconds := 25000
  ) INTO v_request_id;

  RETURN v_request_id;
END $$;

REVOKE ALL ON FUNCTION public.call_cron_job(TEXT, TEXT) FROM PUBLIC, anon, authenticated;

-- ── Schedule ────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.schedule_celpipace_jobs(
  p_base_url TEXT DEFAULT 'https://celpipace.ca'
)
RETURNS TABLE (jobname TEXT, schedule TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, cron
AS $$
DECLARE
  v_jobs CONSTANT TEXT[][] := ARRAY[
    -- The two that Vercel crons genuinely cannot express:
    ['worker',            '* * * * *'   ],  -- drain inbox + outbox every minute
    ['reconcile-billing', '0 * * * *'   ],  -- Stripe Events backfill + drift repair
    ['health-report',     '*/15 * * * *'],  -- dead/stuck counters -> Sentry
    -- Existing lifecycle jobs, now on exact schedules:
    ['sweep',             '0 0 * * *'   ],
    ['marketing',         '0 10 * * *'  ],
    ['winback',           '0 11 * * *'  ],
    ['examcountdown',     '0 13 * * *'  ],
    ['digest',            '0 14 * * *'  ],
    ['abandoned',         '0 15 * * *'  ],
    ['reminders',         '0 16 * * *'  ],
    ['broadcast',         '0 17 * * *'  ],
    ['gsc-summary',       '0 5 * * 1'   ]
  ];
  v_job TEXT;
  v_sched TEXT;
  i INT;
BEGIN
  FOR i IN 1 .. array_length(v_jobs, 1) LOOP
    v_job   := v_jobs[i][1];
    v_sched := v_jobs[i][2];

    -- cron.schedule upserts by name, so this is safe to re-run.
    PERFORM cron.schedule(
      'celpipace_' || v_job,
      v_sched,
      format('SELECT public.call_cron_job(%L, %L);', p_base_url, v_job)
    );

    jobname  := 'celpipace_' || v_job;
    schedule := v_sched;
    RETURN NEXT;
  END LOOP;
END $$;

REVOKE ALL ON FUNCTION public.schedule_celpipace_jobs(TEXT) FROM PUBLIC, anon, authenticated;

-- ── Rollback ────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.unschedule_celpipace_jobs()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, cron
AS $$
DECLARE
  v_count INT := 0;
  v_name TEXT;
BEGIN
  FOR v_name IN SELECT j.jobname FROM cron.job j WHERE j.jobname LIKE 'celpipace_%' LOOP
    PERFORM cron.unschedule(v_name);
    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END $$;

REVOKE ALL ON FUNCTION public.unschedule_celpipace_jobs() FROM PUBLIC, anon, authenticated;

-- ── Observability ───────────────────────────────────────────────────────────
-- "Did the job actually run, and did the endpoint answer?" in one query.
CREATE OR REPLACE VIEW public.cron_job_health
WITH (security_invoker = true) AS
SELECT
  j.jobname,
  j.schedule,
  j.active,
  r.status        AS last_status,
  r.start_time    AS last_run,
  r.return_message
FROM cron.job j
LEFT JOIN LATERAL (
  SELECT d.status, d.start_time, d.return_message
    FROM cron.job_run_details d
   WHERE d.jobid = j.jobid
   ORDER BY d.start_time DESC
   LIMIT 1
) r ON TRUE
WHERE j.jobname LIKE 'celpipace_%';
