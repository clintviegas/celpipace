# Question Bank Automation — Integration with Your App

## Architecture Overview

```
┌─────────────────┐
│ Google Sheet    │ (Content source)
└────────┬────────┘
         │ (Google Apps Script)
         ↓
┌─────────────────┐
│ Your Backend    │ (Webhook endpoint)
│ /api/           │
│ question-sync   │
└────────┬────────┘
         │ (HTTP POST)
         ↓
┌─────────────────┐
│ Supabase        │ (Database)
│ practice_sets   │
│ questions       │
└────────┬────────┘
         │ (Supabase SDK)
         ↓
┌─────────────────┐
│ React App       │ (Your CELPIP app)
│ PracticeSetPage │
│ (usePracticeSet)│
└─────────────────┘
```

## Current State (Static Code)

**Today**, your questions are hardcoded in:
- `src/pages/PracticeSetPage.jsx` → `READING_SETS`, `LISTENING_SETS`, etc.
- Components fetch static data, no Supabase involved

**Benefits**: Fast, no DB delays, simple  
**Downsides**: Hard to scale, manual code edits for updates, no central admin

---

## With Question Bank Automation

**Tomorrow**, your workflow becomes:

1. **Edit Google Sheet** (non-technical)
   - Add/update questions in a spreadsheet
   - No coding knowledge required
   - Multiple people can collaborate

2. **Click "Sync to Celpip"** (one-click)
   - Google Apps Script reads the sheet
   - Validates all data
   - Sends to your webhook

3. **Webhook updates Supabase** (automatic)
   - `practice_sets` table stores meta (title, passage, instruction)
   - `questions` table stores individual questions
   - Old data is replaced cleanly (no duplicates)

4. **React app fetches from DB** (live)
   - `usePracticeSet()` hook queries Supabase
   - Questions load dynamically
   - No code changes needed

---

## Migration Path (Recommended)

### Phase 1: Sync to Supabase (This Week)
- ✅ Set up Google Sheets + Apps Script
- ✅ Create backend endpoint
- ✅ Test syncing R1–R4 questions to Supabase
- ✅ Verify data integrity in Supabase Dashboard
- **Keep** hardcoded questions in code (as backup)

### Phase 2: Fallback Pattern (Next Week)
```javascript
// In PracticeSetPage.jsx
const { sets, loading, error } = usePracticeSet('reading', 'R1');

if (loading) return <LoadingSpinner />;

// Use Supabase data if available, else fall back to code
const activeSet = sets.length > 0 ? sets[0] : READING_SETS.R1;
```
- Supabase data takes priority
- If DB is down, code fallback works
- Zero risk of breaking the app

### Phase 3: Remove Static Code (Future)
- Delete all `READING_SETS`, `LISTENING_SETS`, etc.
- Questions are 100% from Supabase
- Google Sheets is your single source of truth

---

## Integration Example

### Current (Static Data)
```javascript
// src/pages/PracticeSetPage.jsx

const READING_SETS = {
  R1: {
    title: 'Email — Fitness Centre',
    passage: '...',
    questions: [
      { id: 1, text: '...', options: [...], answer: 0, ... },
      // ... 10 more questions
    ],
  },
};

export default function PracticeSetPage() {
  const { section, part } = useActivePart();
  const set = READING_SETS[part];
  
  return (
    <SingleQuestionPanel
      set={set}
      questions={set.questions}
      // ...
    />
  );
}
```

### With Automation (Hybrid)
```javascript
// src/pages/PracticeSetPage.jsx

const READING_SETS = {
  R1: { /* ... static backup ... */ },
  // ...
};

export default function PracticeSetPage() {
  const { section, part } = useActivePart();
  
  // Try to fetch from Supabase
  const { sets, loading, error } = usePracticeSet(section, part);
  
  if (loading) return <LoadingSpinner />;
  
  // Prefer DB data, fall back to code
  const set = sets.length > 0 ? sets[0] : READING_SETS[part];
  
  return (
    <SingleQuestionPanel
      set={set}
      questions={set.questions}
      // ... no other changes needed
    />
  );
}
```

### Future (100% DB-Driven)
```javascript
// src/pages/PracticeSetPage.jsx

// READING_SETS removed entirely

export default function PracticeSetPage() {
  const { section, part } = useActivePart();
  
  const { sets, loading, error } = usePracticeSet(section, part);
  
  if (loading) return <LoadingSpinner />;
  if (error || sets.length === 0) return <ErrorPage />;
  
  const set = sets[0];
  
  return (
    <SingleQuestionPanel
      set={set}
      questions={set.questions}
    />
  );
}
```

---

## File Structure After Setup

```
your-celpip-app/
├── src/
│   ├── pages/
│   │   └── PracticeSetPage.jsx (unchanged, will fetch from Supabase)
│   ├── hooks/
│   │   └── usePracticeSet.js (✅ already exists, ready to use)
│   ├── api/
│   │   ├── questionSync.js (NEW: Backend validation & DB update logic)
│   │   └── routes.js (NEW: Express route handler)
│   └── lib/
│       └── supabaseClient.js (existing)
│
├── docs/
│   ├── QUESTION_BANK_SETUP.md (NEW: Full setup guide)
│   ├── QUICK_START.md (NEW: 5-step quick guide)
│   ├── GoogleAppsScript.js (NEW: Google Apps Script to paste into Sheets)
│   ├── question-bank-template.csv (NEW: Sample data to import)
│   └── schema_v4.sql (existing: Database schema)
│
├── supabase/
│   └── schema_v4.sql (existing: Must be run in Dashboard)
│
└── server.js (NEW if using Express: Node.js server for webhook)
```

---

## Database Schema (Already in schema_v4.sql)

```sql
-- Practice sets (one per R1, R2, L1, etc.)
CREATE TABLE practice_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL,           -- "Reading", "Listening", "Writing", "Speaking"
  part TEXT NOT NULL,              -- "R1", "R2", "L1", "W1", etc.
  title TEXT NOT NULL,             -- "Email — Fitness Centre"
  passage TEXT,                    -- Full passage/prompt (null for Writing/Speaking)
  instruction TEXT,                -- Test instructions
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(section, part)
);

-- Individual questions (11 for R1, 8 for R2, etc.)
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_set_id UUID REFERENCES practice_sets(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,     -- "What is the gist?"
  question_type TEXT,              -- "gist", "detail", "inference", etc.
  options JSONB,                   -- ["Option A", "Option B", "Option C", "Option D"]
  correct_answer_index INTEGER,    -- 0, 1, 2, or 3
  explanation TEXT,                -- Why this answer is correct
  difficulty_level TEXT,           -- "easy", "medium", "hard"
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

---

## Step-by-Step Integration

### 1. Run Supabase Schema (One-Time)
```sql
-- In Supabase Dashboard > SQL Editor, run:
-- Copy entire content from: supabase/schema_v4.sql
-- This creates practice_sets and questions tables
```

### 2. Set Up Backend (Choose One)

**Option A: Supabase Edge Function**
```bash
# No changes needed if using Edge Functions
# The webhook calls your Supabase project directly
```

**Option B: Express Server**
```bash
npm install express body-parser cors
# Create server.js with code from src/api/routes.js
# Run: node server.js
# Set webhook URL to http://localhost:5000/api/question-sync
```

### 3. Create & Configure Google Sheet
- See `/docs/QUICK_START.md` (5-step guide)

### 4. Test Sync
```bash
# Fill Google Sheet with one question set
# Click "Celpip Sync" → "Sync to Celpip"
# Verify in Supabase Dashboard

# Query to verify:
SELECT * FROM practice_sets WHERE part = 'R1';
SELECT * FROM questions WHERE practice_set_id = (SELECT id FROM practice_sets WHERE part = 'R1');
```

### 5. Add Supabase Fetch to React (Optional)
```javascript
// PracticeSetPage.jsx already uses usePracticeSet hook
// No changes needed if you keep static data as fallback

// If you want to test live fetching:
const { sets, loading, error } = usePracticeSet('Reading', 'R1');
```

---

## Troubleshooting Integration

| Issue | Cause | Solution |
|-------|-------|----------|
| "usePracticeSet returns empty array" | Supabase has no data yet | Run schema_v4.sql, then sync from Google Sheets |
| App breaks after syncing | Unexpected data format | Check Supabase data structure matches schema |
| Questions appear empty in app | Column name mismatch (snake_case ↔ camelCase) | usePracticeSet hook handles transformation |
| Google Sheets sync fails but no error | Backend not configured | Set WEBHOOK_URL and Bearer token in Apps Script |

---

## Performance Considerations

### Current (Static Data)
- ✅ Instant load (data in code)
- ❌ Can't update without redeploying

### With Supabase
- ⏱️ ~100–200ms delay (network + DB query)
- ✅ Updates instantly via Google Sheets
- ✅ Scales to thousands of questions

**Optimization**: Cache practice sets in localStorage or useEffect dependency

```javascript
const { sets, loading, error } = usePracticeSet(section, part);

// Optionally cache:
useEffect(() => {
  if (sets.length > 0) {
    localStorage.setItem(`${section}-${part}`, JSON.stringify(sets));
  }
}, [sets, section, part]);
```

---

## Next Steps

1. ✅ Follow `/docs/QUICK_START.md` to set up
2. ✅ Test syncing R1–R4 to Supabase
3. ⏳ Keep hardcoded questions as backup (Phase 1)
4. ⏳ Add usePracticeSet fallback pattern (Phase 2)
5. ⏳ Remove static data and go 100% DB-driven (Phase 3)

**Current**: You have working R1–R4 in code + automation system ready  
**Target**: Update questions by editing Google Sheet (non-technical)

---

## Questions?

Check:
- Full setup: `/docs/QUESTION_BANK_SETUP.md`
- Quick start: `/docs/QUICK_START.md`
- Google Apps Script: `/docs/GoogleAppsScript.js`
- Backend logic: `src/api/questionSync.js`
