# Question Bank Automation — Google Sheets + Google Apps Script Setup Guide

## Overview
This system allows you to manage all CELPIP questions in a **Google Sheet** and sync them to **Supabase** with one click. No manual SQL needed.

**Flow**:
```
Google Sheet (content) → Google Apps Script (validation) → Webhook → Your Backend → Supabase
```

---

## Step 1: Create Backend Webhook Endpoint

### Option A: Using Supabase Edge Functions (Recommended)

1. Go to your **Supabase Dashboard** → **Edge Functions**
2. Create a new function:
   ```bash
   supabase functions new question-sync
   ```
3. Copy the content from `src/api/questionSync.js` into the function file
4. Deploy:
   ```bash
   supabase functions deploy question-sync
   ```
5. Get your endpoint: `https://<your-project>.supabase.co/functions/v1/question-sync`

### Option B: Using Express.js Server (Local)

1. Install dependencies:
   ```bash
   npm install express body-parser cors
   ```

2. Create `server.js` in your project root:
   ```javascript
   import express from 'express';
   import bodyParser from 'body-parser';
   import cors from 'cors';
   import router from './src/api/routes.js';

   const app = express();

   app.use(cors());
   app.use(bodyParser.json({ limit: '10mb' }));
   app.use('/api', router);

   app.listen(5000, () => {
     console.log('Question Sync Server running on http://localhost:5000');
   });
   ```

3. Start server:
   ```bash
   node server.js
   ```

4. Your webhook URL: `http://localhost:5000/api/question-sync`

---

## Step 2: Create Google Sheet

### Sheet Structure

Create a Google Sheet with **exactly these columns** (Header Row):

| Section | Part | Title | Passage | Instruction | Q1_Text | Q1_Type | Q1_Opts_A | Q1_Opts_B | Q1_Opts_C | Q1_Opts_D | Q1_Answer | Q1_Explanation | Q1_Difficulty | Q2_Text | Q2_Type | ... |
|---------|------|-------|---------|-------------|---------|---------|-----------|-----------|-----------|-----------|-----------|----------------|---------------|---------|---------|-----|

### Example Data Row

| Reading | R1 | Email — Fitness Centre | Dear Marcus, I am writing to... | Read the passage. Answer questions. | What is the gist of the email? | gist | To inquire about membership | To complain about fees | To cancel subscription | To book a class | 0 | The passage shows Sarah inquiring about... | easy | Who sent the first email? | detail | ... |

### Column Details

- **Section**: Reading, Listening, Writing, or Speaking
- **Part**: R1, R2, R3, R4, L1, L2, W1, W2, S1, S2
- **Title**: Display name for the question set
- **Passage**: Full text passage (can be very long)
- **Instruction**: Instructions for takers (optional)
- **Q{N}_Text**: Question text
- **Q{N}_Type**: One of:
  - `gist` — Main idea
  - `detail` — Specific info
  - `inference` — Read between lines
  - `vocab_context` — Word meaning
  - `tone_purpose` — Tone/purpose
  - `speaker_view` — Which speaker said this
  - `speaker_id` — Identify speaker
  - `paragraph_match` — Which paragraph contains...
  - `mcq` — Multiple choice
- **Q{N}_Opts_A/B/C/D**: Option texts
- **Q{N}_Answer**: `0`, `1`, `2`, or `3` (matching the correct option index)
- **Q{N}_Explanation**: Why this answer is correct
- **Q{N}_Difficulty**: `easy`, `medium`, or `hard`

### Extending to More Questions

Just add columns: `Q2_Text`, `Q2_Type`, `Q2_Opts_A`, etc.  
The script auto-detects how many questions exist by looking for column names.

**Max**: No hard limit, but keep under 20 questions per row.

---

## Step 3: Set Up Google Apps Script

1. Open your Google Sheet
2. Click **Extensions** → **Apps Script**
3. Delete the default code
4. Paste the entire content from `/docs/GoogleAppsScript.js`
5. **IMPORTANT**: Replace two values:
   ```javascript
   const WEBHOOK_URL = 'YOUR_WEBHOOK_URL_HERE'; // Your endpoint from Step 1
   // And in sendToWebhook():
   'Authorization': 'Bearer YOUR_API_KEY_HERE', // Your Supabase anon key or custom API key
   ```
6. Click **Save**
7. Run `onOpen` once (from the Functions dropdown) to set up the menu
8. Refresh your Google Sheet — you should see a **"Celpip Sync"** menu

---

## Step 4: Configure Your Backend

### Set Webhook URL in Script

In `GoogleAppsScript.js`, update:

```javascript
const WEBHOOK_URL = 'https://your-project.supabase.co/functions/v1/question-sync';
// OR
const WEBHOOK_URL = 'http://localhost:5000/api/question-sync';
```

### Set API Key

Get your **Supabase Anon Key** from:
- Supabase Dashboard → **Settings** → **API** → Copy `anon` key

Update in `GoogleAppsScript.js`:
```javascript
'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY'
```

---

## Step 5: Test the Sync

1. Fill your Google Sheet with **one complete question set** (e.g., R1)
2. Click **Celpip Sync** → **Validate Sheet** (checks for errors)
3. If validation passes, click **Celpip Sync** → **Sync to Celpip**
4. You should see a success message with the question count
5. **Verify in Supabase**:
   - Go to Supabase Dashboard → **SQL Editor**
   - Run:
     ```sql
     SELECT * FROM practice_sets WHERE part = 'R1';
     SELECT COUNT(*) FROM questions WHERE practice_set_id = (SELECT id FROM practice_sets WHERE part = 'R1');
     ```

---

## Step 6: Sync All Reading Questions

Once testing works, fill your sheet with all Reading questions:

| Reading | R1 | Email — Fitness Centre | ... | (11 questions)
| Reading | R2 | Community Centre Schedule | ... | (8 questions)
| Reading | R3 | Digital Literacy in Schools | ... | (9 questions)
| Reading | R4 | AI Regulation Debate | ... | (10 questions)

You can have **one row per practice set** OR create multiple sheets, each with one set.

---

## API Reference

### POST /api/question-sync

**Request Body**:
```json
{
  "section": "Reading",
  "part": "R1",
  "title": "Email — Fitness Centre Membership",
  "passage": "Dear Marcus...",
  "instruction": "Read the passage and answer the questions.",
  "questions": [
    {
      "id": 1,
      "text": "What is the gist of the email?",
      "questionType": "gist",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 0,
      "explanation": "Sarah is inquiring...",
      "difficulty": "easy"
    },
    ...
  ]
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "Synced Reading R1: Email — Fitness Centre Membership",
  "practiceSetId": "550e8400-e29b-41d4-a716-446655440000",
  "questionsCount": 11
}
```

**Response (Error)**:
```json
{
  "error": "Validation failed",
  "details": [
    "Q1: answer index out of range (3 options but index 3 given)"
  ]
}
```

---

## Troubleshooting

### "Authorization failed" or "401 Unauthorized"
- Check your API key in the Apps Script (`YOUR_API_KEY_HERE`)
- Make sure the key has `DELETE`, `INSERT`, `UPDATE` permissions on `practice_sets` and `questions` tables

### "Validation Error: answer index out of range"
- Your answer value (e.g., `4`) exceeds the number of options (e.g., 3)
- Make sure **Q{N}_Answer** is `0`, `1`, `2`, or `3`

### "CORS Error" or "Network Error"
- If using local server: make sure it's running on `localhost:5000`
- If using Supabase Edge Functions: check function deployment status
- Check your webhook URL doesn't have trailing slashes

### Questions not appearing in Supabase
- Run `SELECT * FROM practice_sets;` in Supabase SQL Editor
- If the practice_set exists, check `SELECT * FROM questions;`
- Verify the `practice_set_id` foreign key is correct

### "Invalid difficulty" or other validation errors
- Check spelling: use `easy`, `medium`, `hard` (lowercase)
- Check question types are spelled correctly (see Column Details above)

---

## Advanced: Batch Sync Multiple Sets

If you want to sync multiple practice sets from one sheet:

1. Create multiple **separate rows** (one per practice set)
2. Modify `GoogleAppsScript.js` to loop through all rows:
   ```javascript
   function syncAllToWebhook() {
     const sheet = SpreadsheetApp.getActiveSheet();
     const data = sheet.getDataRange().getValues();
     
     for (let i = 1; i < data.length; i++) {
       try {
         const parsed = parseRow(data[0], data[i]);
         const response = sendToWebhook(parsed);
         // Log result
       } catch (e) {
         Logger.log(`Error on row ${i + 1}: ${e}`);
       }
     }
   }
   ```
3. Call `syncAllToWebhook()` from the menu

---

## Maintenance & Updates

### To Update Existing Questions

1. Edit the Google Sheet row
2. Click **Celpip Sync** → **Sync to Celpip**
3. The system **deletes old questions** for that practice set and inserts new ones
4. No downtime — the update is atomic

### To Add New Questions to an Existing Set

1. Add more columns: `Q12_Text`, `Q12_Type`, etc.
2. Fill in the data
3. Sync again — the old 11 questions are replaced with 12

### Backup Strategy

- Keep a **master copy** of your sheet (File → Version History)
- Download a CSV every week (File → Download → CSV)
- Store in your repo under `/docs/question-backup-{date}.csv`

---

## Database Schema Reminder

Make sure you've run `schema_v4.sql` in your Supabase Dashboard:

```sql
CREATE TABLE practice_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL,
  part TEXT NOT NULL,
  title TEXT NOT NULL,
  passage TEXT,
  instruction TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(section, part)
);

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_set_id UUID REFERENCES practice_sets(id),
  question_text TEXT NOT NULL,
  question_type TEXT,
  options JSONB,
  correct_answer_index INTEGER,
  explanation TEXT,
  difficulty_level TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

---

## Next Steps

1. ✅ Create your webhook endpoint (Step 1)
2. ✅ Create your Google Sheet (Step 2)
3. ✅ Set up Google Apps Script (Step 3)
4. ✅ Configure backend (Step 4)
5. ✅ Test with one question set (Step 5)
6. ✅ Sync all Reading questions (Step 6)
7. Build Listening, Writing, Speaking questions in the same sheet
8. Automate sync on a schedule (optional): Use Google Sheets + Zapier or Cloud Scheduler

---

## Questions?

Check the `/docs` folder for:
- `GoogleAppsScript.js` — Full script code
- `questionSync.js` — Backend logic
- `schema_v4.sql` — Database schema
