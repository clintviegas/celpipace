# 🎯 START HERE — Question Bank Automation (5 Minutes)

## What You Have

✅ **Reading app** with 38 questions (R1–R4) — fully working  
✅ **Automation system** — ready to deploy  
✅ **Documentation** — complete setup guides  

## What You Need to Do This Week

**1-time setup** (1 hour) to never manually edit questions again.

---

## Step 1: Decide Your Backend (5 min)

Choose **ONE** of these:

### Option A: Supabase Edge Functions (Recommended) ⭐
- Most people choose this
- Free, serverless, scales automatically
- Deploy in 2 commands

```bash
supabase functions new question-sync
# Copy code from src/api/questionSync.js
supabase functions deploy question-sync
# Get endpoint: https://YOUR_PROJECT.supabase.co/functions/v1/question-sync
```

### Option B: Local Express Server
- Run locally during development
- Good if you prefer traditional Node.js

```bash
npm install express body-parser cors
# Create server.js (copy from src/api/routes.js)
node server.js
# Endpoint: http://localhost:5000/api/question-sync
```

**Choose A or B, then continue** 👇

---

## Step 2: Create Google Sheet (5 min)

1. Go to https://sheets.google.com
2. Create new sheet: **"CELPIP Question Bank"**
3. **Copy this header row exactly:**

```
Section | Part | Title | Passage | Instruction | Q1_Text | Q1_Type | Q1_Opts_A | Q1_Opts_B | Q1_Opts_C | Q1_Opts_D | Q1_Answer | Q1_Explanation | Q1_Difficulty | Q2_Text | Q2_Type | Q2_Opts_A | Q2_Opts_B | Q2_Opts_C | Q2_Opts_D | Q2_Answer | Q2_Explanation | Q2_Difficulty | Q3_Text | Q3_Type | Q3_Opts_A | Q3_Opts_B | Q3_Opts_C | Q3_Opts_D | Q3_Answer | Q3_Explanation | Q3_Difficulty
```

**OR** import template:
- File → Import → Upload → `docs/question-bank-template.csv`
- Choose "Insert new sheet"

---

## Step 3: Add Google Apps Script (5 min)

1. In your Sheet: **Extensions** → **Apps Script**
2. Delete all code
3. Copy from `/docs/GoogleAppsScript.js`
4. Paste it all
5. **REPLACE these 2 lines:**
   ```javascript
   // Line ~5
   const WEBHOOK_URL = 'https://YOUR_PROJECT.supabase.co/functions/v1/question-sync';
   // OR
   const WEBHOOK_URL = 'http://localhost:5000/api/question-sync';
   
   // Line ~80 (search for Bearer)
   'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY'
   // Get key: Supabase Dashboard → Settings → API → copy "anon" key
   ```
6. Click **Save**
7. Close the Apps Script tab
8. Refresh Sheet (F5)
9. You should see **"Celpip Sync"** menu at the top ✅

---

## Step 4: Test With One Question Set (5 min)

1. Fill your Sheet with **one complete practice set** (e.g., R1)
   - Section: `Reading`
   - Part: `R1`
   - Title: `Email — Fitness Centre Membership`
   - Passage: (long text or use template)
   - Instruction: `Read the passage...`
   - Fill at least Q1 + Q2 + Q3 completely
     - Q1_Text, Q1_Type, Q1_Opts_A/B/C/D, Q1_Answer (0–3), Q1_Explanation, Q1_Difficulty
     - Q2_Text, Q2_Type, ... (repeat)
     - Q3_Text, Q3_Type, ... (repeat)

2. Click **Celpip Sync** → **Validate Sheet**
   - If errors: fix them (see troubleshooting below)
   - If OK: continue

3. Click **Celpip Sync** → **Sync to Celpip**
   - Watch for success message: `"Synced Reading R1: ... 3 questions uploaded"` ✅

4. **Verify in Supabase Dashboard:**
   ```sql
   SELECT * FROM practice_sets WHERE part = 'R1';
   ```
   - Should see 1 row with your R1 data ✅

---

## Step 5: Sync All Reading Questions (15 min)

1. Fill your Sheet with ALL reading sets:
   ```
   Row 1: Reading | R1 | Email — Fitness Centre | ... | (11 questions)
   Row 2: Reading | R2 | Community Centre | ... | (8 questions)
   Row 3: Reading | R3 | Digital Literacy | ... | (9 questions)
   Row 4: Reading | R4 | AI Regulation | ... | (10 questions)
   ```

2. For each row:
   - Click **Celpip Sync** → **Validate Sheet**
   - Click **Celpip Sync** → **Sync to Celpip**
   - Wait for success ✅

3. Verify all are in Supabase:
   ```sql
   SELECT COUNT(*) FROM questions;
   ```
   - Should return ~38 ✅

---

## Troubleshooting (Common Issues)

| Problem | Fix |
|---------|-----|
| Menu doesn't appear | Refresh Sheet (F5) after saving Apps Script |
| "Authorization failed" 401 | Check API key in Apps Script (Bearer token from Supabase) |
| "Answer out of range" | Make sure answer is 0–3 (matching option count) |
| "Invalid difficulty" | Use lowercase: `easy`, `medium`, `hard` |
| Webhook error (CORS) | Check webhook URL has no trailing slash |
| Questions not in Supabase | Run `SELECT * FROM practice_sets;` to verify |

**Still stuck?** See `/docs/QUESTION_BANK_SETUP.md` troubleshooting section.

---

## What's Happening Behind the Scenes

```
You edit Google Sheet
    ↓
Click "Sync to Celpip"
    ↓
Google Apps Script reads the Sheet
    ↓
Validates all data (answers, types, difficulty)
    ↓
Sends JSON to your webhook
    ↓
Your backend stores in Supabase
    ↓
React app fetches from Supabase (or uses hardcoded backup)
    ↓
Questions display in the app ✅
```

**No manual SQL. Ever. Again.** 🎉

---

## What's Next

### This Week
- ✅ Run this setup (1 hour)
- ✅ Verify all Reading questions in Supabase

### Next Week (Optional)
- Add **Listening** questions to the same Sheet
- Add **Writing** questions to the same Sheet
- Add **Speaking** questions to the same Sheet

### Later
- Switch React app to fetch from Supabase (see `/docs/INTEGRATION_GUIDE.md` Phase 2)
- Set up scheduled syncing (auto-sync every day via Zapier)

---

## Files Reference

| File | Purpose | Read This If... |
|------|---------|-----------------|
| `/docs/QUICK_START.md` | Column reference + 5-step overview | You want quick reference |
| `/docs/SETUP_CHECKLIST.md` | Step-by-step checklist | You like checkboxes |
| `/docs/QUESTION_BANK_SETUP.md` | Full detailed guide | You want all details |
| `/docs/INTEGRATION_GUIDE.md` | How it integrates with React | You're curious how it works |
| `/docs/GoogleAppsScript.js` | Google Apps Script code | You need to paste it |
| `src/api/questionSync.js` | Backend validation logic | You're setting up backend |

---

## Success Criteria

You've succeeded when:
- ✅ Google Sheet "Celpip Sync" menu appears
- ✅ Validation passes without errors
- ✅ Sync shows success message
- ✅ Supabase has your questions
- ✅ React app still loads questions (from code or DB)

---

## That's It! 🚀

You now have:
1. ✅ A Google Sheet for managing questions (non-technical)
2. ✅ Automated syncing to Supabase (one-click)
3. ✅ A working React app that displays questions
4. ✅ Zero manual SQL editing needed

**Next time you want to add/update questions:**
1. Edit Google Sheet
2. Click "Sync to Celpip"
3. Done! 🎉

---

## Questions?

- **Setup help**: `/docs/SETUP_CHECKLIST.md`
- **Error help**: `/docs/QUESTION_BANK_SETUP.md` (Troubleshooting section)
- **How it works**: `/docs/INTEGRATION_GUIDE.md`
- **Full details**: `/docs/QUESTION_BANK_SETUP.md`

---

**Estimated time to complete: 1 hour**  
**Difficulty: Easy (no coding required)**  
**Benefit: Never write SQL for questions again** ✨
