# Migrations

**This directory is the source of truth for schema changes. `supabase/*.sql` in the parent
directory is not.**

## Why this exists

`supabase/*.sql` is a folder of loose scripts with no ordering and no applied-state tracking.
On 2026-08-06 an audit found real drift: `supabase/schema/coach-ai/rag_schema.sql` and `supabase/schema/practice/writing_schema.sql` were sitting in
the repo having never been applied. Six code paths queried `essay_embeddings`, a table that did not
exist — which silently disabled the free-tier evaluation cap, because the row count came back
`undefined` and `(count ?? 0) >= 2` never tripped.

A missing table surfaced as a wrong answer, not an error. That is the failure mode this directory
prevents.

## Rules

- Every schema change is a new timestamped file here. Never edit an applied migration.
- Apply with `supabase db push` (or the Supabase MCP `apply_migration`, which records the same
  `supabase_migrations.schema_migrations` rows).
- Run `get_advisors` after any migration — several defects found in the audit were advisor-visible
  (RLS enabled with no policy, `SECURITY DEFINER` functions executable by `anon`).
- **`CREATE FUNCTION` grants `EXECUTE` to `PUBLIC` by default.** Revoking from `anon, authenticated`
  is not enough; always `REVOKE ALL ... FROM PUBLIC` and then grant explicitly. Getting this wrong
  left `get_user_weakness_profile` — a `SECURITY DEFINER` function taking `p_user_id` with no
  `auth.uid()` check — callable by any signed-in user for any other user's data.

## Files here vs. the parent directory

The files in `supabase/*.sql` are kept for history but are **not** authoritative. Before assuming
any table, column, or RPC in them exists, verify against the live database. The baseline captured
here starts at `20260806061448`; everything earlier was applied ad hoc and is recorded only in
`supabase_migrations.schema_migrations`.

## Pending — not yet applied

`20260806070000_pg_cron_schedule.sql` is **deliberately unapplied**. It schedules pg_cron jobs that
POST to `/api/cron?job=worker` and `?job=reconcile-billing`; those endpoints only exist after the
Phase 2–4 code is deployed. Applying it early would just log 400s. See the header of that file for
the activation steps, which include storing `CRON_SECRET` in Supabase Vault.
