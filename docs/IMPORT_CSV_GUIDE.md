# 📥 How to Import CSV Data into Google Sheets

## Option 1: Import CSV File (Fastest Method)

1. **Open your Google Sheet**
2. **Click File → Import**
3. **Select "Upload" tab**
4. **Choose `/docs/CELPIP_ALL_QUESTIONS.csv`** from your desktop
5. **Select "Replace current sheet"** or **"Insert new sheet"**
6. **Click Import**

✅ **Done!** All 38 questions will be automatically formatted and ready to sync.

---

## Option 2: Copy-Paste Data

If you prefer to paste manually:

1. **Download the CSV file**: `/docs/CELPIP_ALL_QUESTIONS.csv`
2. **Open in Excel or Numbers**
3. **Select all data** (Ctrl/Cmd + A)
4. **Copy** (Ctrl/Cmd + C)
5. **In your Google Sheet, click cell A1**
6. **Paste Special → Values only** (Ctrl/Cmd + Shift + V)

---

## Option 3: Add Columns if Not Present

If your sheet already has data but is missing column headers:

### Add these headers in Row 1:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Section | Part | Number | Title | Passage | Instruction | QuestionText | Type | CorrectAnswer | OptionA | OptionB | OptionC | OptionD | Explanation | Difficulty |

Then copy question data into the rows below.

---

## After Import

### ✅ Verify the Import

1. **Check Row 1 has headers**: Section, Part, Number, Title, etc.
2. **Check Row 2 starts with**: Reading, R1, 1, Email Inquiry, ...
3. **Scroll down to verify all 38 questions are present**
4. **Save your sheet** (Google Sheets auto-saves, but good to confirm)

### 🔄 Test the Sync

1. **Close and reopen the sheet** (or press F5 to refresh)
2. **Click "Celpip Sync" menu** (should appear at top of sheet)
3. **Click "Column Inspector"** — should show all columns detected
4. **Click "Validate Sheet"** — should show "✓ All questions valid"
5. **Click "Sync to Celpip"** — should show success message

### ✨ Verify in Supabase

1. **Go to your Supabase Dashboard**
2. **Click SQL Editor**
3. **Run this query**:
   ```sql
   SELECT COUNT(*) as total_questions FROM questions;
   ```
4. **You should see `38` questions in the results**

---

## Troubleshooting

### Issue: "Column not found" error
**Solution**: Make sure Row 1 has exact column names (case-sensitive):
- ✓ Correct: `Section`, `Part`, `Number`, `Title`
- ✗ Wrong: `section`, `SECTION`, `Sec`, `sections`

### Issue: "Passage is empty"
**Solution**: The CSV might have very long passages. This is normal. Check that the Passage column (E) has text.

### Issue: Sync shows "0 questions processed"
**Solution**: 
- Click "Column Inspector" to verify columns are detected
- Check that you clicked "Sync to Celpip" (not "Validate Sheet")
- Check your internet connection

### Issue: "Script function not found" error
**Solution**: You haven't deployed the corrected Google Apps Script yet. See `/docs/FIX_YOUR_SCRIPT.md`

---

## Next Steps

1. ✅ Import the CSV into your Google Sheet
2. ✅ Verify the import (check row count and columns)
3. ✅ Test sync (click "Celpip Sync" → "Sync to Celpip")
4. ✅ Verify in Supabase (run COUNT query)
5. ✅ Done! All questions are now in your database

**Questions?** Check `/docs/SHEET_STRUCTURE_GUIDE.md` for detailed format explanations.
