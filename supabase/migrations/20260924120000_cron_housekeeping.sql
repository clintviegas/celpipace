-- 20260924120000_cron_housekeeping.sql
--
-- pg_cron writes a row to cron.job_run_details for every run and never deletes
-- any. With the worker ticking every minute that is ~1,500 rows a day, forever,
-- on a free-tier Nano instance whose disk-IO budget ran out repeatedly in
-- September 2026 (see the 522 / statement-timeout Sentry issues). Keep a week,
-- which is all cron_job_status-style debugging ever needs.
--
-- Runs inside the database, so unlike the other jobs it does not go through
-- call_cron_job / pg_net / Vercel.

SELECT cron.schedule(
  'celpipace_cron_housekeeping',
  '30 3 * * *',
  $$DELETE FROM cron.job_run_details WHERE end_time < now() - interval '7 days'$$
);
