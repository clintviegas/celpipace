# RAG Scoring Pipeline — Setup & Rollout

Phase 1 of the AI scoring upgrade: pgvector-backed retrieval-augmented feedback for Writing and Speaking. The system stays fully backward-compatible — every endpoint still returns scores even if the RAG layer fails.

## What changed

| File | Role |
| --- | --- |
| `supabase/rag_schema.sql` | pgvector extension, `essay_embeddings` table, `match_essay_exemplars` RPC, `get_user_weakness_profile` RPC, `user_score_trends` view |
| `api/_lib/embeddings.js` | Wrapper for OpenAI `text-embedding-3-small` (1536 dims) |
| `api/_lib/rag.js` | Retrieval helpers + prompt-block builders + persistence |
| `api/score-writing.js` | Now embeds → retrieves exemplars + weakness profile → injects → scores → persists |
| `api/score-speaking.js` | Same pipeline, mirrored for speaking |
| `api/study-recommendations.js` | New endpoint that turns a weakness profile into 3 concrete next steps |
| `scripts/seed-exemplars.mjs` | One-shot script that imports the 40 hand-written model answers as retrieval exemplars |
| `src/pages/PracticeSetPage.jsx`, `src/pages/MockTestPage.jsx` | Pass `userId` through to the scoring fetches |

## Architecture

```
                                 score request
                                       │
                                       ▼
                    ┌──────────────────────────────────────┐
                    │  /api/score-writing | score-speaking │
                    └──────────────────────────────────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              ▼                        ▼                        ▼
       embed(response)        retrieveExemplars()     retrieveWeaknessProfile()
       OpenAI 1536-d                pgvector                pgvector / SQL
              │                        │                        │
              └─────────────┬──────────┴────────────┬───────────┘
                            ▼                       ▼
                       buildExemplarBlock     buildWeaknessBlock
                            │                       │
                            └────────────┬──────────┘
                                         ▼
                                inject into system prompt
                                         │
                                         ▼
                                  GPT-4o-mini scores
                                         │
                       ┌─────────────────┼─────────────────┐
                       ▼                                   ▼
                   return JSON                    persistScoredEssay()
                                                  (embedding + scores
                                                   stored back to
                                                   essay_embeddings)
```

## Environment variables

The pipeline uses env vars that are already in `.env.example`:

- `OPENAI_API_KEY` — embeddings + chat completions
- `VITE_SUPABASE_URL` — used server-side for the service-role client
- `SUPABASE_SERVICE_ROLE_KEY` — required for inserts into `essay_embeddings` (RLS denies direct user inserts by design)

No new secrets needed.

## Rollout

### 1. Apply the schema

In the Supabase Dashboard → SQL Editor, run:

```
supabase/rag_schema.sql
```

This creates the `vector` extension, the `essay_embeddings` table, two RPCs, and the analytics view. RLS is enabled; only exemplar rows are publicly readable, and users can read their own rows. Inserts/updates are gated to the service role (i.e. our API routes).

### 2. Seed the exemplars

```
node scripts/seed-exemplars.mjs --dry      # parse only
node scripts/seed-exemplars.mjs            # full seed (~40 OpenAI embedding calls)
```

The `--dry` run reports coverage so you can confirm all 20 W1 + 20 W2 model answers were extracted. The full run costs roughly **$0.001** total (text-embedding-3-small is ~$0.02 per 1M tokens, and the corpus is ~10k tokens).

The script is idempotent: re-runs replace exemplar rows by their `source_key` rather than duplicating.

### 3. Deploy

Vercel will pick up the new `api/` files automatically on push. No frontend rebuild is required for the score path itself — the call sites already pass `userId`.

### 4. Verify

Submit a writing response while signed in. In the response JSON you should see:

```json
{
  "rag": {
    "embedded": true,
    "exemplarsRetrieved": 3,
    "weaknessSamples": 0
  }
}
```

After 2–3 submissions on the same section the `weaknessSamples` will start incrementing and the model will reference the user's weak dimensions in its feedback.

### 5. Personalised study plan (optional UI)

```
GET /api/study-recommendations?userId=<uuid>&section=writing
```

Returns:

```json
{
  "userId": "…",
  "sections": {
    "writing": {
      "profile": { "sample_count": 5, "avg_overall": 7.4, "weakest": "vocabulary", "dimensions": {...} },
      "plan":    { "summary": "…", "recommendations": [ … ] }
    }
  }
}
```

Wire this into the dashboard whenever you're ready — it's not required for the RAG scoring path itself.

## Cost & performance notes

- **Per-submission cost**: 1 embedding call (~$0.00001) + 1 chat call (existing). The RAG layer adds <1¢ per 1000 submissions.
- **Latency**: embedding adds ~150–250 ms; pgvector lookups <10 ms with the ivfflat index. Typical end-to-end overhead is well under 500 ms.
- **Index tuning**: `ivfflat` `lists = 100` is fine up to ~50k rows. Past that, recreate with `lists = sqrt(n)` and `ANALYZE`.
- **Window size**: `retrieveWeaknessProfile` looks at the last 10 submissions per section. Tunable via `p_window`.
- **Failure mode**: every retrieval call is wrapped in try/catch — if pgvector is down or the embedding fails, scoring still returns a valid response with `rag.embedded = false`.

## Why this design

- **One table for exemplars + submissions**: simpler ANN index, future-proofs auto-promoting top user submissions to exemplars without row migration.
- **Server-side similarity (RPC)**: keeps the 1536-dim vector inside Postgres — never goes to the browser, never bloats a JSON payload.
- **Service-role inserts only**: prevents tampered embeddings or fake scores being injected by a malicious client.
- **No LangChain yet**: this pipeline has 2 retrieval steps with no branching. A direct call is cleaner. Revisit when adding multi-step agents.

## Roadmap (not in this phase)

- **Phase 2** — analytics dashboard reading `user_score_trends` view + `/api/study-recommendations` endpoint.
- **Phase 3** — promote user submissions scoring ≥10/12 to exemplars automatically (cron job, requires manual review queue).
- **Phase 4** — only if call volume warrants it: extract embedding + retrieval into a FastAPI microservice. Not warranted today.
