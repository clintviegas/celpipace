# Persistent Test Sessions — Setup & Integration Guide

This feature replaces the volatile `sessionStorage`/in-memory React state for test progress with a Supabase-backed `test_sessions` table. Users can leave the site, reload, switch devices, and pick up exactly where they left off.

---

## 1. Apply the Database Migration

Run [supabase/test_sessions_schema.sql](supabase/test_sessions_schema.sql) in the Supabase SQL editor.

This creates:

- **`test_sessions`** table with the user-spec'd fields plus supporting JSONB columns:
  - `id`, `user_id`, `kind` (`practice` | `mock`)
  - `practice_set_id` (UUID — see note below), `section`, `part_id`, `set_number`
  - `exam_number` (for mocks)
  - `current_section`, `current_part`, `current_question_index`
  - `completed_sections TEXT[]`
  - `selected_answers JSONB`, `scores JSONB`, `meta JSONB`
  - `is_completed`, `started_at`, `updated_at`, `completed_at`
- **`user_attempts.session_id`** — new nullable FK so per-question rows can be grouped by session
- **Unique partial indexes** that enforce *one active session per (user, practice_set)* and *one active mock session per user*
- **RPCs**:
  - `start_or_resume_practice_session(section, part_id, set_number, practice_set_id?)`
  - `start_or_resume_mock_session(exam_number)`
  - `complete_test_session(session_id)`
- RLS policies: users read/write only their own sessions; `sales@celpipace.com` reads all.
- Auto-updating `updated_at` trigger.

> **Spec note:** the original requirement listed `practice_set_id (int8)` but the existing `practice_sets.id` column is `UUID`. We use `UUID` to keep the foreign key valid. The composite `(section, part_id, set_number)` is also indexed so static/data-driven sets that don't have a DB row still resume correctly (`practice_set_id` left `NULL`).

---

## 2. New Hook — `useTestSession`

[src/hooks/useTestSession.js](src/hooks/useTestSession.js) is a drop-in hook that:

- Calls the appropriate `start_or_resume_*` RPC on mount
- Restores `selected_answers`, `current_section`, `current_part`, `current_question_index`, `completed_sections`, `scores`, `meta` from the row
- Provides debounced autosave (~400 ms) on every mutation
- Flushes pending writes on unmount and `beforeunload`
- Exposes `complete()` to mark the session done and `reset()` to start a fresh one

### Example — practice set

```jsx
import { useTestSession } from '../hooks/useTestSession'

const session = useTestSession({
  kind: 'practice',
  section: 'reading',
  partId: 'R1',
  setNumber: 1,
  practiceSetId: null,    // optional UUID if you have one
})

// On answer click:
session.saveAnswer(`q_${qIdx}`, optionIndex)
session.setCurrentQuestionIndex(qIdx)

// On mount, restore previously selected answers:
useEffect(() => {
  if (!session.loading && session.answers) {
    setLocalAnswers(session.answers)         // hydrate UI from cloud
  }
}, [session.loading])

// On submit:
await session.complete()
```

### Example — mock exam (already wired in MockTestPage)

```jsx
const session = useTestSession({ kind: 'mock', examNumber })
session.setScores('L1', { correct: 7, total: 8 })
session.markSectionComplete('listening')
session.setCurrentPart('L2')
```

---

## 3. What's Already Wired

| File | Change |
|------|--------|
| [supabase/test_sessions_schema.sql](supabase/test_sessions_schema.sql) | New migration |
| [src/hooks/useTestSession.js](src/hooks/useTestSession.js) | New hook |
| [src/pages/MockTestPage.jsx](src/pages/MockTestPage.jsx) | Top-level mock state now backed by Supabase. On reload the page restores `sectionIdx`, `partIdx`, and per-part `scores`. `handleStart`, `handlePartDone`, and `handleContinueSection` autosave to the session. The session is closed via `complete()` when reaching the final results screen. |
| [src/pages/DashboardPage.jsx](src/pages/DashboardPage.jsx) | New "Resume Where You Left Off" card — queries incomplete `test_sessions` and renders a Resume button that deep-links back to the right page. |

---

## 4. Pending Wiring — `PracticeSetPage` Layouts

`PracticeSetPage.jsx` is large (~5800 lines) and delegates to four section layouts: `ListeningLayout`, `ReadingLayout`, `WritingLayout`, `SpeakingLayout`. Each manages its own `useState({})` for answers and an `activeSetIdx`/`qIndex`. To make per-section progress resumable, drop `useTestSession` into each layout component using this pattern:

```jsx
function ReadingLayout({ partId, color, onComplete }) {
  const session = useTestSession({
    kind: 'practice',
    section: 'reading',
    partId,
    setNumber: activeSetIdx + 1,    // call this AFTER you decide which set to load
  })

  const [answers, setAnswers] = useState({})

  // Hydrate from cloud once
  useEffect(() => {
    if (!session.loading && session.answers) {
      setAnswers(session.answers)
      if (typeof session.currentQuestionIndex === 'number') {
        setQIndex(session.currentQuestionIndex)
      }
    }
  }, [session.loading])

  // On answer:
  const handleSelect = (qIdx, optIdx) => {
    const key = `q_${qIdx}`
    setAnswers(a => ({ ...a, [key]: optIdx }))
    session.saveAnswer(key, optIdx)         // autosave
    session.setCurrentQuestionIndex(qIdx)
  }

  // On final submit (after onComplete + insert into user_attempts):
  await session.complete()
}
```

Notes:

1. The hook is **idempotent** — multiple mounts for the same `(user, section, partId, setNumber)` will resolve to the same active session row.
2. Pass `session.id` into your existing `user_attempts` insert payload to bind attempts to the session:
   ```js
   await supabase.from('user_attempts').insert(
     answers.map(a => ({ ...a, session_id: session.id }))
   )
   ```
3. After `session.complete()`, the next mount will create a *new* session — this preserves history while letting users re-attempt cleanly.

---

## 5. Constraints Honoured

| User requirement | How it's met |
|------------------|--------------|
| Don't rely on React state for persistence | Every mutator in `useTestSession` writes through to Supabase (debounced); `beforeunload` flushes pending writes. |
| All critical progress in Supabase | `selected_answers`, `current_section`, `current_part`, `current_question_index`, `completed_sections`, `scores` all live on `test_sessions`. |
| Autosave after each action | 400 ms debounce per change; section transitions / completion flush immediately (`queueSave(0)`). |
| Resume on reload / cross-device | RPC finds the active session by `(user_id, kind, practice_set_id?)` or `(user_id, kind='mock')`. |
| Group results by session | `user_attempts.session_id` + dashboard query already join on it. |

---

## 6. Verifying Locally

1. Run the migration in Supabase.
2. Start a mock exam, answer a couple of parts, then **hard-reload** the tab.
3. The mock test page should drop you back on the section/part you were on with prior part scores intact.
4. Open the Dashboard — the "Resume Where You Left Off" card should list the active mock session.
5. Complete the exam → the session disappears from the resume list.
