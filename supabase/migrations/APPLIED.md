# Applied migration ledger

Authoritative list of what is in `supabase_migrations.schema_migrations` on project
`ljwnzakoqlydgcyxuqny`, so the repo is not silently behind the database again.

Everything from `20260806061448` onward was applied via the Supabase MCP during the
platform-readiness work on 2026-08-06. Regenerate this list with `list_migrations`.

| Version | Name | What it did |
|---|---|---|
| 20260430113235 | phase1_audit_tables | pre-existing |
| 20260430171432 | phase3_expire_premium_rpc | pre-existing |
| 20260430182109 | phase4_rate_log | pre-existing |
| 20260503112248 | phase5_security_hardening | pre-existing |
| 20260503113207 | phase5b_revoke_public_rpcs | pre-existing |
| 20260513114033 | add_location_fields_to_profiles | pre-existing |
| 20260518112914 | create_blog_posts_table | pre-existing |
| 20260518120154 | fix_blog_posts_admin_rls | pre-existing |
| 20260520132348 | add_attribution_and_ip_to_profiles | pre-existing |
| 20260606100422 | learning_path_journey_columns | pre-existing |
| 20260806061448 | rag_schema_essay_embeddings | `vector` ext, `essay_embeddings`, RAG RPCs — closed the unlimited-free-tier leak |
| 20260806061538 | rag_schema_restore_dim_scores | restored `dim_scores` in `match_essay_exemplars` |
| 20260806062317 | rag_rpcs_revoke_public_execute | revoked PUBLIC execute (IDOR on `get_user_weakness_profile`) |
| 20260806063808 | inbox_state_machine_and_event_effects | `webhook_events.status/attempts/lease`, `event_effects`, `system_state`, `claim_webhook_events` |
| 20260806064527 | job_queue_outbox | `job_queue` + `claim_jobs` |
| 20260806093517 | claim_webhook_event_by_id | lets the webhook do a best-effort inline pass without racing the worker |
| 20260806141444 | pg_cron_schedule_functions | `pg_cron`/`pg_net` + schedule helpers — **inert until `cron_secret` is in Vault** |
| 20260806142007 | phase7a_app_admins_roles_table | `app_admins` roles table, seeded |
| 20260806142037 | phase7c_is_app_admin_via_roles_table | `is_app_admin()` reads the table (founder email kept as fallback) |
| 20260806142138 | phase7c_policies_use_is_app_admin | 14 policies switched off the inlined email literal |
| 20260806142301 | phase7ab_rate_log_rls_and_rpc_grants | `api_rate_log` policy; revoked anon on 11 SECURITY DEFINER functions |
| 20260806142406 | phase7d_pin_function_search_paths | pinned `search_path` on 3 functions |

## Still unapplied, on purpose

`20260806070000_pg_cron_schedule.sql` — superseded by `20260806141444`, which applied the
functions only. What remains is the activation, which needs a secret and so must be run by a
human in the SQL editor:

```sql
select vault.create_secret('<CRON_SECRET from Vercel>', 'cron_secret');
select public.schedule_celpipace_jobs('https://www.celpipace.ca');  -- must be www: the
  -- apex domain 308-redirects, and pg_net drops the Authorization header across
  -- that redirect, so every call silently 401s (found + fixed 2026-09-17)
select * from public.cron_job_health;   -- expect 12 rows
```
