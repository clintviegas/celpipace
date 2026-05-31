# Progress and Attempt Persistence Setup

The app saves progress in two layers:

- `user_progress`: compact summaries for dashboards, streaks, best scores, and activity.
- `practice_attempts`: immutable LSWR attempt history for signed-in users, including score metadata and available answer/response payloads.

## Run the SQL migrations

Run these in Supabase SQL Editor:

```sql
\i supabase/progress_schema.sql
\i supabase/test_sessions_schema.sql
\i supabase/writing_schema.sql
\i supabase/practice_attempts.sql
```

Mock exams save resumable state and final scores in `test_sessions`. LSWR practice completions save summaries in `user_progress` and a per-attempt row in `practice_attempts`.

## What is saved

- Listening and Reading: score plus answer-level review payload where available.
- Writing: score plus prompt, response text, word count, and AI result when scored inside the practice page.
- Speaking: completion row plus transcript and AI result when scored.
- Mock exams: current section/part/answers/scores/meta in `test_sessions`, flushed during section transitions and page hide.