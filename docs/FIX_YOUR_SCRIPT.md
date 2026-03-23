# 🔧 Fix Your Google Apps Script — Complete Setup

## The Problem
Your current script is missing the `doGet` handler that the web endpoint needs.

## ✅ The Solution

### Step 1: Replace Your Script (5 min)

1. **Open your Google Sheet**: https://docs.google.com/spreadsheets/d/1w9d4lfmr5dJ_aIQZnu3OgZ1dGM6m6mFT39uzLDyA9qg
2. **Click**: Extensions → Apps Script
3. **Delete ALL existing code**
4. **Copy ENTIRE content from**: `/docs/GoogleAppsScript-Complete.js`
5. **Paste it all** into the Apps Script editor
6. **Find and replace these 2 lines:**
   ```javascript
   const SUPABASE_WEBHOOK = 'https://ljwnzakoqlydgcyxuqny.supabase.co/functions/v1/question-sync';
   const SUPABASE_API_KEY = 'zQxNjQ1MjMs1mV4cCl6Mj...';  // Your anon key
   ```
7. **Click Save**

---

### Step 2: Deploy as Web App (3 min)

1. In Apps Script editor, click **Deploy** (top right)
2. Click **New Deployment** (if you have old deployments)
3. **Type**: Select "Web app"
4. **Execute as**: Your account (Clint Viegas)
5. **Who has access**: Anyone
6. Click **Deploy**
7. **Copy the deployment URL** that appears:
   ```
   https://script.google.com/macros/s/AKfycbx...../exec
   ```

---

### Step 3: Test It (2 min)

1. **Close the Apps Script tab**
2. **Go back to your Google Sheet**
3. **Refresh** (F5)
4. You should see **"Celpip Sync"** menu at the top ✅
5. Click **Celpip Sync** → **Column Inspector**
   - Should show your sheet columns

---

### Step 4: Do a Test Sync (5 min)

1. **Fill one row** in your sheet with test question data:
   - Section: `Reading`
   - Part: `R1`
   - Title: (any title)
   - Passage: (any passage)
   - Q1_Text, Q1_Type, Q1_Opts_A/B/C/D, Q1_Answer (0–3), Q1_Explanation, Q1_Difficulty

2. **Click**: Celpip Sync → Validate Sheet
   - If OK, continue
   - If errors, fix them

3. **Click**: Celpip Sync → Sync to Celpip
   - Should see success message ✅

4. **Verify in Supabase Dashboard**:
   ```sql
   SELECT * FROM practice_sets WHERE part = 'R1';
   ```

---

## ⚠️ Common Issues

| Issue | Fix |
|-------|-----|
| "doGet not found" | You didn't replace the script. Use GoogleAppsScript-Complete.js |
| "Menu doesn't appear" | Refresh sheet (F5) after saving script |
| "Auth failed" 401 | Check API key is correct (copy from Supabase) |
| "Answer out of range" | Make sure answer is 0–3 matching options |

---

## 🎯 Summary

**Old script**: Missing web handler (doGet/doPost)  
**New script**: Complete with both sheet menu AND web endpoint  
**Result**: Everything works! ✅

---

## Next: Fill Your Questions

Once test works:
1. Fill all your Reading questions in the sheet (R1, R2, R3, R4)
2. Each row = one practice set
3. Click "Sync to Celpip" for each row
4. All questions auto-upload ✨

---

## Need Help?

Tell me:
1. Did the deployment work?
2. Do you see "Celpip Sync" menu?
3. What error message (if any)?

I'll fix it immediately! 🚀
