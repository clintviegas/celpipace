/**
 * COMPLETE Google Apps Script with Webhook Handler
 * 
 * This script runs IN your Google Sheet AND as a web endpoint
 * 
 * SETUP:
 * 1. Open your Google Sheet
 * 2. Extensions → Apps Script
 * 3. Delete old code, paste this entire script
 * 4. Update WEBHOOK_URL and API_KEY below
 * 5. Click Deploy → New Deployment → Type: Web app → Execute as: Your account
 * 6. Copy the new deployment URL
 * 7. In Sheet menu, click "Celpip Sync" → "Sync to Celpip"
 */

// ═══════════════════════════════════════════════════════════════
// ⚙️  CONFIGURATION — UPDATE THESE
// ═══════════════════════════════════════════════════════════════

// Where to send the data (your Supabase Edge Function)
const SUPABASE_WEBHOOK = 'https://ljwnzakoqlydgcyxuqny.supabase.co/functions/v1/question-sync';
const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqd256YWtvcWx5ZGdjeXh1cW55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNjQ1MjMsImV4cCI6MjA4OTc0MDUyM30.6fgxOorqAyD9VU0_0mt7h7nXXW9I6kyCFEByAl2leu8';  // Replace with your anon key

// Map your sheet columns to our system
const CONFIG = {
  section: 'Section',
  part: 'Part',
  title: 'Title',
  passage: 'Passage',
  instruction: 'Instruction',
};

// ═══════════════════════════════════════════════════════════════
// 🌐 WEB ENDPOINT (for webhook calls)
// ═══════════════════════════════════════════════════════════════

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    return forwardToSupabase(payload);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ok',
    message: 'Celpip Question Sync Webhook is running'
  })).setMimeType(ContentService.MimeType.JSON);
}

// ═══════════════════════════════════════════════════════════════
// 📊 SHEET MENU (for manual sync from sheet)
// ═══════════════════════════════════════════════════════════════

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Celpip Sync')
    .addItem('Sync to Celpip', 'syncFromSheet')
    .addItem('Validate Sheet', 'validateSheet')
    .addItem('Column Inspector', 'inspectColumns')
    .addToUi();
}

function syncFromSheet() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();

  if (data.length < 2) {
    showAlert('Error', 'Sheet must have header row + at least 1 data row');
    return;
  }

  const headers = data[0];
  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;
  const errors = [];

  try {
    // Process ALL rows
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const parsed = parseRow(headers, row);
      
      if (!parsed) {
        skipCount++;
        continue; // Skip empty rows
      }
      
      const validationErrors = validatePayload(parsed);
      
      if (validationErrors.length > 0) {
        failCount++;
        if (errors.length < 5) errors.push(`Row ${i+1}: ${validationErrors.join(', ')}`);
        continue;
      }

      const response = forwardToSupabase(parsed);
      if (response.success) {
        successCount++;
      } else {
        failCount++;
        if (errors.length < 5) errors.push(`Row ${i+1}: ${response.error}`);
      }
    }

    Logger.log(`Processed: ${data.length - 1} rows | Success: ${successCount} | Failed: ${failCount} | Skipped: ${skipCount}`);

    if (successCount === 0) {
      showAlert('Sync Error ❌', `No questions synced. ${failCount} had errors.\n\n${errors.join('\n')}`);
    } else {
      showAlert(
        'Sync Success ✅',
        `Synced ${successCount} questions${failCount > 0 ? ` (${failCount} failed, ${skipCount} skipped)` : ''}`
      );
      appendLog(`Synced ${successCount} questions`);
    }
  } catch (error) {
    showAlert('Error', error.toString());
    Logger.log('Error: ' + error);
  }
}

function validateSheet() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();

  if (data.length < 2) {
    showAlert('Error', 'Sheet must have header row + at least 1 data row');
    return;
  }

  const headers = data[0];
  let validCount = 0;
  let errorCount = 0;
  let errors = [];

  // Validate all rows
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const parsed = parseRow(headers, row);
    
    if (!parsed) continue; // Skip empty rows
    
    const rowErrors = validatePayload(parsed);
    if (rowErrors.length > 0) {
      errorCount++;
      errors.push(`Row ${i+1}: ${rowErrors.join(', ')}`);
    } else {
      validCount++;
    }
  }

  if (validCount === 0) {
    showAlert('Validation Error', 'No valid questions found in sheet. ' + (errors.length > 0 ? 'First error: ' + errors[0] : ''));
  } else if (errorCount === 0) {
    showAlert('Validation Success ✅', `Found ${validCount} valid questions`);
  } else {
    showAlert('Validation Complete', `✅ ${validCount} valid | ❌ ${errorCount} errors\n\n${errors.slice(0, 5).join('\n')}`);
  }
}


function inspectColumns() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const html = '<h3>Your Sheet Columns:</h3><pre>' + JSON.stringify(headers, null, 2) + '</pre>';
  const ui = SpreadsheetApp.getUi();
  ui.showModelessDialog(
    HtmlService.createHtmlOutput(html),
    'Column Inspector'
  );
}

// ═══════════════════════════════════════════════════════════════
// 🔧 HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function parseRow(headers, row) {
  // Case-insensitive column finder
  const findColIndex = (colName) => {
    return headers.findIndex(h => h && h.toString().toLowerCase() === colName.toLowerCase());
  };

  // Find columns dynamically (case-insensitive)
  const section = (row[findColIndex('Section')] || '').toString().trim();
  const part = (row[findColIndex('Part')] || '').toString().trim();
  const number = (row[findColIndex('Number')] || '').toString().trim();
  const title = (row[findColIndex('Title')] || '').toString().trim();
  const passage = (row[findColIndex('Passage')] || '').toString().trim();
  const instruction = (row[findColIndex('Instruction')] || '').toString().trim();
  const questionText = (row[findColIndex('QuestionText')] || '').toString().trim();
  const type = (row[findColIndex('Type')] || 'detail').toString().trim();
  const correctAnswer = (row[findColIndex('CorrectAnswer')] || '').toString().trim();
  const optionA = (row[findColIndex('OptionA')] || '').toString().trim();
  const optionB = (row[findColIndex('OptionB')] || '').toString().trim();
  const optionC = (row[findColIndex('OptionC')] || '').toString().trim();
  const optionD = (row[findColIndex('OptionD')] || '').toString().trim();
  const explanation = (row[findColIndex('Explanation')] || '').toString().trim();
  const difficulty = (row[findColIndex('Difficulty')] || 'medium').toString().trim();

  // Skip empty rows (check if critical fields are empty)
  if (!section || !part || !questionText) {
    return null;
  }

  // Build the question object for Supabase
  return {
    section: section,
    part: part,
    number: parseInt(number) || 0,
    title: title,
    passage: passage,
    instruction: instruction,
    question_text: questionText,
    type: type.toLowerCase(),
    correct_answer: correctAnswer,
    option_a: optionA,
    option_b: optionB,
    option_c: optionC,
    option_d: optionD,
    explanation: explanation,
    difficulty: difficulty.toLowerCase(),
  };
}

function validatePayload(payload) {
  const errors = [];

  // Validate required fields
  if (!payload.section) errors.push('Missing "section"');
  if (!payload.part) errors.push('Missing "part"');
  if (!payload.question_text) errors.push('Missing "question_text"');
  if (!payload.correct_answer) errors.push('Missing "correct_answer"');

  // Validate difficulty
  if (payload.difficulty && !['easy', 'medium', 'hard'].includes(payload.difficulty)) {
    errors.push(`Invalid difficulty: "${payload.difficulty}" (use easy/medium/hard)`);
  }

  return errors;
}

function forwardToSupabase(payload) {
  // Insert directly into Supabase using REST API
  const tableName = 'questions';
  const url = `https://ljwnzakoqlydgcyxuqny.supabase.co/rest/v1/${tableName}?apikey=${SUPABASE_API_KEY}`;
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Prefer': 'return=minimal',
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();

    if (statusCode === 201 || statusCode === 200) {
      return {
        success: true,
        message: 'Question inserted successfully',
      };
    } else {
      const errorBody = response.getContentText();
      return {
        success: false,
        error: `HTTP ${statusCode}: ${errorBody}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.toString(),
    };
  }
}

function showAlert(title, message) {
  const ui = SpreadsheetApp.getUi();
  ui.alert(title + '\n\n' + message);
}

function appendLog(message) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let logSheet = ss.getSheetByName('_Log');
  if (!logSheet) {
    logSheet = ss.insertSheet('_Log');
    logSheet.appendRow(['Timestamp', 'Message']);
  }
  logSheet.appendRow([new Date().toLocaleString(), message]);
}
