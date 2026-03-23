# 🚀 Set Up Your Google Sheet — 3 Steps

## Your Sheet
https://docs.google.com/spreadsheets/d/1w9d4lfmr5dJ_aIQZnu3OgZ1dGM6m6mFT39uzLDyA9qg

---

## Step 1: Add Google Apps Script (5 min)

### In Your Google Sheet:
1. Click **Extensions** → **Apps Script**
2. Delete all existing code
3. Copy the ENTIRE content from: `/docs/GoogleAppsScript-Universal.js`
4. Paste it all
5. Find these lines and UPDATE them:

   ```javascript
   const WEBHOOK_URL = 'https://YOUR_PROJECT.supabase.co/functions/v1/question-sync';
   const API_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```

   **Get your values:**
   - Go to Supabase Dashboard
   - Settings → API
   - Copy the `anon` key → paste after `Bearer ` in API_KEY
   - Copy your project URL → paste in WEBHOOK_URL

6. Click **Save**
7. Close Apps Script tab
8. **Refresh your sheet** (F5)
9. You should see **"Celpip Sync"** menu at the top ✅

---

## Step 2: Verify Your Columns (2 min)

Click **Celpip Sync** → **Column Inspector**

This shows all your sheet's column names. Check that they match:

```
Section, Part, Title, Passage, Instruction,
Q1_Text, Q1_Type, Q1_Opts_A, Q1_Opts_B, Q1_Opts_C, Q1_Opts_D, Q1_Answer, Q1_Explanation, Q1_Difficulty,
Q2_Text, Q2_Type, ... (and so on)
```

**If your columns are DIFFERENT:**
- Tell me the actual column names
- I'll adjust the script in 2 minutes

**If they match exactly:**
- Continue to Step 3 ✅

---

## Step 3: Test Sync (5 min)

### Fill Test Data:
Fill one complete row in your sheet with question data:
- Section: `Reading`
- Part: `R1`
- Title: (your title)
- Passage: (your passage)
- Q1_Text, Q1_Type, Q1_Opts_A/B/C/D, Q1_Answer (0–3), Q1_Explanation, Q1_Difficulty
- (Optional) Q2, Q3, etc.

### Validate:
Click **Celpip Sync** → **Validate Sheet**
- If errors: fix them
- If OK: continue

### Sync:
Click **Celpip Sync** → **Sync to Celpip**
- Watch for: `"Synced Reading R1: ... X questions uploaded"` ✅

### Verify in Supabase:
Go to Supabase Dashboard → SQL Editor:
```sql
SELECT * FROM practice_sets WHERE part = 'R1';
```

Should show your data ✅

---

## What's Next?

Once Step 3 works:
1. Fill all your questions in the sheet
2. Click "Sync to Celpip" for each row
3. Questions auto-appear in your app ✨

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Menu doesn't appear | Refresh sheet (F5) after saving Apps Script |
| "Authorization failed" 401 | Check API key in script is correct |
| "Invalid difficulty" | Use lowercase: `easy`, `medium`, `hard` |
| "Answer out of range" | Make answer 0–3 matching option count |
| "Column not found" | Check column names match exactly (case-sensitive) |

---

## Need Help?

Tell me:
1. Your actual column names
2. Any error messages
3. What you're trying to sync

I'll fix it immediately! 🚀
