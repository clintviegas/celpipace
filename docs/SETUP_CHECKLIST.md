# Question Bank Automation — Setup Checklist ✅

## Pre-Setup (5 minutes)
- [ ] Read `/docs/QUICK_START.md` (quick overview)
- [ ] Gather your **Supabase Anon Key** (Dashboard → Settings → API)
- [ ] Decide: Use Supabase Edge Functions OR local Express server?

---

## Phase 1: Backend Endpoint Setup (10 minutes)

### If Using Supabase Edge Functions (Recommended)
- [ ] Open terminal
- [ ] Run: `supabase functions new question-sync`
- [ ] Copy code from `src/api/questionSync.js` into the function file
- [ ] Run: `supabase functions deploy question-sync`
- [ ] Copy your endpoint URL: `https://YOUR_PROJECT.supabase.co/functions/v1/question-sync`
- [ ] Save it somewhere (you'll need it for Google Apps Script)

### If Using Express Server (Local)
- [ ] Run: `npm install express body-parser cors`
- [ ] Create `server.js` in project root with content from `src/api/routes.js`
- [ ] Run: `node server.js`
- [ ] Your endpoint: `http://localhost:5000/api/question-sync`
- [ ] Keep terminal running during setup

---

## Phase 2: Google Sheet Creation (5 minutes)

- [ ] Go to https://sheets.google.com
- [ ] Create new sheet: **CELPIP Question Bank**
- [ ] One option: Manually add header row (copy from `/docs/QUESTION_BANK_SETUP.md`)
- [ ] Other option: Import CSV template
  - [ ] File → Import → Upload → Select `docs/question-bank-template.csv`
  - [ ] Choose "Insert new sheet"
  - [ ] Click Import
- [ ] Verify header row has all columns (Section, Part, Title, Passage, Q1_Text, Q1_Type, ... Q{N}_Difficulty)

---

## Phase 3: Google Apps Script Setup (5 minutes)

- [ ] In Google Sheet: Extensions → Apps Script
- [ ] Delete all default code
- [ ] Open `docs/GoogleAppsScript.js`
- [ ] Copy entire content
- [ ] Paste into Apps Script editor
- [ ] **CRITICAL: Find and replace two values:**
  - [ ] Line ~5: `const WEBHOOK_URL = 'YOUR_WEBHOOK_URL_HERE'`
    - Replace with: `const WEBHOOK_URL = 'https://YOUR_PROJECT.supabase.co/functions/v1/question-sync'` (or your Express URL)
  - [ ] Line ~80: `'Authorization': 'Bearer YOUR_API_KEY_HERE'`
    - Replace with: `'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY'` (from Supabase Dashboard)
- [ ] Click Save
- [ ] Close Apps Script tab
- [ ] Refresh Google Sheet (F5)
- [ ] Verify: **"Celpip Sync"** menu appears at top of sheet

---

## Phase 4: Test Sync (15 minutes)

### Fill Test Data
- [ ] Go to your Google Sheet
- [ ] Fill **one complete row** with question data
  - [ ] Section: `Reading`
  - [ ] Part: `R1`
  - [ ] Title: `Email — Fitness Centre Membership`
  - [ ] Passage: (copy from `/docs/QUESTION_BANK_SETUP.md` example or your own)
  - [ ] Q1_Text, Q1_Type, Q1_Opts_A/B/C/D, Q1_Answer, Q1_Explanation, Q1_Difficulty
  - [ ] Fill at least 3 questions (Q1, Q2, Q3)

### Validate Before Syncing
- [ ] Click **Celpip Sync** → **Validate Sheet**
- [ ] Check for errors:
  - [ ] If errors appear, fix them and try again
  - [ ] Common errors: invalid difficulty (`easy` vs `Easy`), answer out of range (4+ when only 4 options)
  - [ ] See `/docs/QUESTION_BANK_SETUP.md` troubleshooting section

### Run Sync
- [ ] Click **Celpip Sync** → **Sync to Celpip**
- [ ] Watch for success message: `"Synced Reading R1: ... X questions uploaded"`
- [ ] If error: Check webhook URL and API key are correct

### Verify in Supabase
- [ ] Open Supabase Dashboard
- [ ] Go to **SQL Editor**
- [ ] Run this query:
  ```sql
  SELECT * FROM practice_sets WHERE part = 'R1' LIMIT 1;
  ```
- [ ] Verify: You see 1 row with your R1 data
- [ ] Run:
  ```sql
  SELECT COUNT(*) FROM questions WHERE practice_set_id = (SELECT id FROM practice_sets WHERE part = 'R1');
  ```
- [ ] Verify: Returns 3 (or however many questions you synced)

---

## Phase 5: Sync All Reading Questions (30 minutes)

- [ ] Fill your Google Sheet with all Reading practice sets (4 rows total):
  - [ ] Row 1: Reading R1 (11 questions)
  - [ ] Row 2: Reading R2 (8 questions)
  - [ ] Row 3: Reading R3 (9 questions)
  - [ ] Row 4: Reading R4 (10 questions)
- [ ] For each row:
  - [ ] Click **Celpip Sync** → **Validate Sheet**
  - [ ] Fix any errors
  - [ ] Click **Celpip Sync** → **Sync to Celpip**
  - [ ] Wait for success message
- [ ] When all 4 are synced:
  - [ ] Run in Supabase SQL Editor:
    ```sql
    SELECT part, COUNT(*) FROM practice_sets GROUP BY part;
    SELECT COUNT(*) as total_questions FROM questions;
    ```
  - [ ] Should see: 4 practice sets (R1, R2, R3, R4) + 38 total questions

---

## Phase 6: Verify Your App Still Works (10 minutes)

- [ ] Restart your React app if it was running
- [ ] Navigate to Reading section
- [ ] Click R1 → Verify questions still load (they use hardcoded data for now)
- [ ] No errors in browser console
- [ ] **Note**: App still uses static question code; Supabase sync is working in background

---

## Phase 7 (Optional): Switch to Supabase Live Data

Only do this after Phase 6 verification:

- [ ] Open `src/pages/PracticeSetPage.jsx`
- [ ] Find where it uses static `READING_SETS`
- [ ] Add this above the component return:
  ```javascript
  const { sets, loading, error } = usePracticeSet('Reading', part);
  
  if (loading) return <div>Loading questions...</div>;
  if (error) console.warn('Supabase fetch error:', error);
  
  // Use Supabase data if available, else fall back to static
  const activeSet = sets && sets.length > 0 ? sets[0] : READING_SETS[part];
  ```
- [ ] Replace `READING_SETS[part]` with `activeSet`
- [ ] Test in browser: questions should load from Supabase (may take 100-200ms longer)

---

## Common Issues & Fixes

### "CORS Error" or "Network Error"
- [ ] Check webhook URL in Apps Script (no typos, no trailing slash)
- [ ] If using local server: make sure `node server.js` is still running
- [ ] If using Edge Function: verify it's deployed (check Supabase Dashboard)

### "Authorization failed" (401)
- [ ] Check API key in Apps Script is correct (Dashboard → Settings → API → copy `anon` key)
- [ ] Key should be: `Authorization': 'Bearer ey....'` (exactly)

### "Answer index out of range"
- [ ] Check that `Q{N}_Answer` is 0, 1, 2, or 3
- [ ] Count your option columns: if you have 3 options, answer must be 0–2

### "Invalid difficulty"
- [ ] Use lowercase: `easy`, `medium`, `hard`
- [ ] NOT: `Easy`, `Medium`, `Hard`

### Questions not appearing in Supabase
- [ ] Run query: `SELECT * FROM practice_sets;`
- [ ] If empty: sync didn't work (check for errors in validation)
- [ ] If rows exist: run `SELECT * FROM questions;` to check questions table

---

## Done! 🎉

Your question bank automation is complete!

### What You Can Do Now
1. **Edit questions** in Google Sheet (non-technical)
2. **Click sync** → Questions update in Supabase + React app
3. **No manual SQL** → No code deployments needed
4. **Collaborate** → Multiple people can edit the sheet

### Next (Optional)
- Set up **scheduled syncing** (Zapier or Google Cloud Scheduler)
- Build **Listening questions** in the same sheet
- Build **Writing/Speaking prompts** in the same sheet
- Create **admin dashboard** to manage sheets and sync history

---

## Files Reference

| File | Purpose |
|------|---------|
| `/docs/QUICK_START.md` | 5-step overview (start here) |
| `/docs/QUESTION_BANK_SETUP.md` | Detailed setup + troubleshooting |
| `/docs/INTEGRATION_GUIDE.md` | How automation integrates with React app |
| `/docs/GoogleAppsScript.js` | Paste this into Google Apps Script |
| `/docs/question-bank-template.csv` | Sample data (import into Google Sheet) |
| `src/api/questionSync.js` | Backend validation + Supabase update logic |
| `src/api/routes.js` | Express route handler (if using local server) |
| `src/hooks/usePracticeSet.js` | React hook to fetch questions from Supabase |
| `supabase/schema_v4.sql` | Database schema (must be run once in Dashboard) |

---

## Support

- Check `/docs/QUICK_START.md` for quick ref
- Check `/docs/QUESTION_BANK_SETUP.md` for detailed guide
- Check `/docs/INTEGRATION_GUIDE.md` for app integration details
