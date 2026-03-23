# Question Bank Automation — QUICK START (5 Steps)

## 1️⃣ Set Up Backend Endpoint (5 min)

**Option A: Supabase Edge Functions (Recommended)**
```bash
# Deploy question-sync function to Supabase
supabase functions new question-sync
# Copy code from src/api/questionSync.js into the function
supabase functions deploy question-sync
# Endpoint: https://YOUR_PROJECT.supabase.co/functions/v1/question-sync
```

**Option B: Local Express Server**
```bash
npm install express body-parser cors
# Create server.js with content from src/api/routes.js
node server.js
# Endpoint: http://localhost:5000/api/question-sync
```

---

## 2️⃣ Create Google Sheet (3 min)

1. Go to https://sheets.google.com → Create new sheet
2. Name it: `CELPIP Question Bank`
3. **Header row (copy/paste exactly)**:
   ```
   Section | Part | Title | Passage | Instruction | Q1_Text | Q1_Type | Q1_Opts_A | Q1_Opts_B | Q1_Opts_C | Q1_Opts_D | Q1_Answer | Q1_Explanation | Q1_Difficulty | Q2_Text | Q2_Type | ... (repeat Q2, Q3, etc)
   ```
4. Save

**Or import the CSV template:**
- File → Import → Upload → `question-bank-template.csv`

---

## 3️⃣ Set Up Google Apps Script (3 min)

1. Open your Sheet
2. **Extensions** → **Apps Script**
3. Delete default code → Paste from `/docs/GoogleAppsScript.js`
4. **REPLACE these two lines:**
   ```javascript
   const WEBHOOK_URL = 'https://YOUR_PROJECT.supabase.co/functions/v1/question-sync';
   'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY',
   ```
5. Get your Supabase Anon Key:
   - https://app.supabase.com → Your Project → Settings → API
   - Copy the `anon` key
6. **Save**

---

## 4️⃣ Test Sync (5 min)

1. Fill one row in your sheet with question data (see template)
2. Refresh the Sheet (F5)
3. Click **Celpip Sync** → **Validate Sheet**
4. If ✅ passes, click **Celpip Sync** → **Sync to Celpip**
5. See success message with question count
6. **Verify** in Supabase:
   ```sql
   SELECT * FROM practice_sets WHERE part = 'R1';
   SELECT COUNT(*) FROM questions WHERE practice_set_id = (SELECT id FROM practice_sets WHERE part = 'R1');
   ```

---

## 5️⃣ Sync All Questions (10 min)

Fill your sheet with all Reading questions (one row per practice set):

| Reading | R1 | Email — Fitness Centre | ... (11 Qs) | ...
| Reading | R2 | Community Centre | ... (8 Qs) | ...
| Reading | R3 | Digital Literacy | ... (9 Qs) | ...
| Reading | R4 | AI Regulation | ... (10 Qs) | ...

Then **Celpip Sync** → **Sync to Celpip** for each row (or modify script to sync all at once).

---

## Column Reference

| Column | Example | Notes |
|--------|---------|-------|
| Section | Reading | Reading, Listening, Writing, Speaking |
| Part | R1 | R1–R4, L1–L2, W1–W2, S1–S2 |
| Title | Email — Fitness Centre | Display name |
| Passage | Long text... | Full passage text |
| Instruction | Read the passage... | Instructions for test-takers |
| Q{N}_Text | What is the gist? | Question text |
| Q{N}_Type | gist, detail, vocab_context, inference, tone_purpose, speaker_view, speaker_id, mcq, paragraph_match | See full list below |
| Q{N}_Opts_A/B/C/D | Option text | 4 options (can have fewer, add blank cols) |
| Q{N}_Answer | 0, 1, 2, 3 | Index of correct option (0 = first) |
| Q{N}_Explanation | Why this answer... | Why the answer is correct |
| Q{N}_Difficulty | easy, medium, hard | Lowercase only |

---

## Question Types

- `gist` — Main idea / general understanding
- `detail` — Specific information from passage
- `inference` — Read between the lines
- `vocab_context` — Word meaning from context
- `tone_purpose` — Tone, purpose, author's intent
- `speaker_view` — Which speaker supports this view
- `speaker_id` — Who said / wrote this
- `paragraph_match` — Which paragraph contains this info
- `mcq` — General multiple choice

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Authorization failed" | Check API key in Apps Script (Bearer token) |
| "Answer index out of range" | Make sure answer is 0–3 and matches option count |
| "Invalid difficulty" | Use lowercase: `easy`, `medium`, `hard` |
| "CORS Error" | Check webhook URL (no trailing slash) |
| No menu appears | Refresh sheet (F5) after saving script |
| Questions not in Supabase | Verify practice_set exists, check foreign key |

---

## Files Reference

- **Google Apps Script**: `/docs/GoogleAppsScript.js`
- **Setup Guide**: `/docs/QUESTION_BANK_SETUP.md` (full details)
- **Question Bank CSV Template**: `/docs/question-bank-template.csv`
- **Backend Logic**: `src/api/questionSync.js`
- **API Routes**: `src/api/routes.js`
- **Database Schema**: `supabase/schema_v4.sql`

---

## Next: Automate on Schedule (Optional)

Once working, you can auto-sync every day using:
- **Zapier**: Google Sheets → Webhook trigger
- **Google Cloud Scheduler**: Cron job to call webhook
- **GitHub Actions**: On push, sync questions

Ask if you want setup for scheduled syncing!

---

## Commit This Setup

```bash
git add docs/ src/api/
git commit -m "feat: Question bank automation — Google Sheets + Apps Script sync"
git push
```

Done! 🎉
