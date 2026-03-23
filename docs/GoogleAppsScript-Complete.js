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
const SUPABASE_API_KEY = 'zQxNjQ1MjMs1mV4cCl6Mj...';  // Replace with your anon key

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
  const firstRow = data[1];

  try {
    const parsed = parseRow(headers, firstRow);
    const errors = validatePayload(parsed);
    
    if (errors.length > 0) {
      showAlert('Validation Error', errors.join('\n'));
      return;
    }

    const response = forwardToSupabase(parsed);

    if (response.success) {
      showAlert(
        'Success ✅',
        `Synced: ${parsed.section} ${parsed.part}\n${response.questionsCount} questions uploaded`
      );
      appendLog(`Synced ${parsed.section} ${parsed.part} (${response.questionsCount} questions)`);
    } else {
      showAlert('Error', response.error || 'Unknown error');
    }
  } catch (error) {
    showAlert('Error', error.toString());
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
  const firstRow = data[1];

  try {
    const parsed = parseRow(headers, firstRow);
    const errors = validatePayload(parsed);

    if (errors.length === 0) {
      showAlert(
        'Validation Success ✅',
        `${parsed.section} ${parsed.part}\n${parsed.questions.length} questions are valid`
      );
    } else {
      showAlert('Validation Errors', errors.join('\n'));
    }
  } catch (error) {
    showAlert('Error', error.toString());
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
  const getColIndex = (colName) => {
    const idx = headers.indexOf(colName);
    return idx >= 0 ? idx : -1;
  };

  const section = row[getColIndex(CONFIG.section)] || '';
  const part = row[getColIndex(CONFIG.part)] || '';
  const title = row[getColIndex(CONFIG.title)] || '';
  const passage = row[getColIndex(CONFIG.passage)] || '';
  const instruction = row[getColIndex(CONFIG.instruction)] || '';

  const questions = [];
  let qNum = 1;

  while (true) {
    const textColName = `Q${qNum}_Text`;
    const textIdx = getColIndex(textColName);
    
    if (textIdx === -1) break;

    const text = row[textIdx];
    if (!text) break;

    const question = {
      id: qNum,
      text: text,
      questionType: row[getColIndex(`Q${qNum}_Type`)] || 'mcq',
      options: [
        row[getColIndex(`Q${qNum}_Opts_A`)] || `Option ${qNum}.1`,
        row[getColIndex(`Q${qNum}_Opts_B`)] || `Option ${qNum}.2`,
        row[getColIndex(`Q${qNum}_Opts_C`)] || `Option ${qNum}.3`,
        row[getColIndex(`Q${qNum}_Opts_D`)] || `Option ${qNum}.4`,
      ],
      answer: parseInt(row[getColIndex(`Q${qNum}_Answer`)] || 0),
      explanation: row[getColIndex(`Q${qNum}_Explanation`)] || '',
      difficulty: (row[getColIndex(`Q${qNum}_Difficulty`)] || 'medium').toLowerCase(),
    };

    questions.push(question);
    qNum++;
  }

  return {
    section,
    part,
    title,
    passage,
    instruction,
    questions,
  };
}

function validatePayload(payload) {
  const errors = [];

  if (!payload.section) errors.push('Missing "Section"');
  if (!payload.part) errors.push('Missing "Part"');
  if (!payload.title) errors.push('Missing "Title"');
  if (payload.questions.length === 0) errors.push('No questions found');

  payload.questions.forEach((q, idx) => {
    if (!q.text) errors.push(`Q${idx + 1}: Missing text`);
    if (q.options.length < 2) errors.push(`Q${idx + 1}: Less than 2 options`);
    if (q.answer < 0 || q.answer >= q.options.length) {
      errors.push(`Q${idx + 1}: Answer index out of range (got ${q.answer}, max ${q.options.length - 1})`);
    }
    if (!['easy', 'medium', 'hard'].includes(q.difficulty)) {
      errors.push(`Q${idx + 1}: Invalid difficulty (use easy/medium/hard, got "${q.difficulty}")`);
    }
  });

  return errors;
}

function forwardToSupabase(payload) {
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': `Bearer ${SUPABASE_API_KEY}`,
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  try {
    const response = UrlFetchApp.fetch(SUPABASE_WEBHOOK, options);
    const result = JSON.parse(response.getContentText());

    if (response.getResponseCode() === 200) {
      return {
        success: true,
        questionsCount: payload.questions.length,
        ...result,
      };
    } else {
      return {
        success: false,
        error: result.error || `HTTP ${response.getResponseCode()}`,
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
