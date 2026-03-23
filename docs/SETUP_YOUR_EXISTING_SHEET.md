# 🚀 Using Your Existing Google Sheet — Quick Setup

## ✅ You Already Have a Sheet!

Your sheet: https://docs.google.com/spreadsheets/d/1w9d4lfmr5dJ_aIQZnu3OgZ1dGM6m6mFT39uzLDyA9qg

Great news — we can use it directly! Just need to:
1. Verify the sheet structure
2. Add Google Apps Script (one-time)
3. Set up your backend endpoint
4. Test sync

---

## 📋 Step 1: Check Your Sheet Structure

Open your sheet and verify these columns exist:

| Expected Columns |
|------------------|
| Section |
| Part |
| Title |
| Passage |
| Instruction |
| Q1_Text |
| Q1_Type |
| Q1_Opts_A |
| Q1_Opts_B |
| Q1_Opts_C |
| Q1_Opts_D |
| Q1_Answer |
| Q1_Explanation |
| Q1_Difficulty |
| (repeat for Q2, Q3, etc) |

**If your sheet has different columns**, you'll need to:
- Either rename them to match above
- Or modify the Google Apps Script to match your column names

---

## 🔧 Step 2: Add Google Apps Script

1. **In your Google Sheet**: Extensions → Apps Script
2. Delete any existing code
3. **Copy entire content from**: `/docs/GoogleAppsScript.js` in your project
4. **Replace these 2 lines:**
   ```javascript
   const WEBHOOK_URL = 'https://YOUR_PROJECT.supabase.co/functions/v1/question-sync';
   // OR
   const WEBHOOK_URL = 'http://localhost:5000/api/question-sync';
   ```
   
   And:
   ```javascript
   'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY'
   ```

5. Click **Save**
6. Close Apps Script tab
7. **Refresh your sheet** (F5)
8. You should see **"Celpip Sync"** menu ✅

---

## 🌐 Step 3: Set Up Backend Endpoint

### Option A: Supabase Edge Functions (Recommended)
```bash
supabase functions new question-sync
# Copy code from src/api/questionSync.js into the function
supabase functions deploy question-sync
# Get endpoint: https://YOUR_PROJECT.supabase.co/functions/v1/question-sync
```

### Option B: Local Express Server
```bash
npm install express body-parser cors
# Create server.js (copy from src/api/routes.js)
node server.js
# Endpoint: http://localhost:5000/api/question-sync
```

---

## ✅ Step 4: Test Sync

1. **In your sheet**: Fill one complete row with question data
2. Click **Celpip Sync** → **Validate Sheet**
3. If errors: fix them
4. Click **Celpip Sync** → **Sync to Celpip**
5. See success message ✅

---

## 🎯 What's the Sheet Structure?

Before we proceed, please tell me:

1. **What columns does your sheet have?** (What are the actual header names?)
2. **What data is already in it?** (Any questions already entered?)
3. **What structure?** (One row per question set or something else?)

Once I see the actual structure, I can:
- ✅ Create a custom setup guide for YOUR sheet
- ✅ Adjust the Google Apps Script if needed
- ✅ Map your columns correctly to the automation system

---

## Quick Preview

Send a screenshot or tell me:
- Row 1 (headers): What are the exact column names?
- Row 2 (first data row): What's the section/part (e.g., "Reading", "R1")?
- Any existing questions already filled in?

This way I can give you **exact instructions for your specific sheet**.

---

## Fast Track

If your sheet matches our template columns exactly:
1. Copy `/docs/GoogleAppsScript.js` → paste into Apps Script
2. Set WEBHOOK_URL + API key
3. Click "Celpip Sync" → "Sync to Celpip"
4. Done! ✅

If your sheet has different structure:
- Tell me the actual columns
- I'll adjust the setup in 2 minutes

---

## Questions?

Just let me know what your sheet looks like and I'll provide exact setup instructions! 🚀
