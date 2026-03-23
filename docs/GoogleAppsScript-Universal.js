/**
 * UNIVERSAL Google Apps Script
 * 
 * Works with ANY column structure!
 * Just update the CONFIG object below to match YOUR sheet columns
 * 
 * HOW TO USE:
 * 1. Open your Google Sheet
 * 2. Extensions → Apps Script
 * 3. Paste this entire code
 * 4. Update CONFIG below with your column names
 * 5. Update WEBHOOK_URL and API_KEY
 * 6. Save and deploy
 */

// ═══════════════════════════════════════════════════════════════
// ⚙️  CONFIGURATION — UPDATE THESE FOR YOUR SHEET
// ═══════════════════════════════════════════════════════════════

const WEBHOOK_URL = 'https://YOUR_PROJECT.supabase.co/functions/v1/question-sync';
const API_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Map your sheet columns to our system
// Change these names to match YOUR column headers exactly
const CONFIG = {
  // Main practice set columns
  section: 'Section',      // "Reading", "Listening", etc.
  part: 'Part',            // "R1", "R2", "L1", "W1", etc.
  title: 'Title',          // Practice set title
  passage: 'Passage',      // The passage/prompt
  instruction: 'Instruction',  // Instructions for test-takers
  
  // Question columns (we look for Q1, Q2, Q3, ... until not found)
  // Just list the suffixes — script auto-generates Q1_Text, Q2_Text, etc.
  questionSuffixes: ['Text', 'Type', 'Opts_A', 'Opts_B', 'Opts_C', 'Opts_D', 'Answer', 'Explanation', 'Difficulty']
  // If your columns are different, adjust these
  // Example: if you have "Question1Text" instead of "Q1_Text", change:
  // questionPattern: 'Question' // and adjust suffixes accordingly
};

// ═══════════════════════════════════════════════════════════════
// 🔧 FUNCTIONS (Don't modify below unless needed)
// ═══════════════════════════════════════════════════════════════

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Celpip Sync')
    .addItem('Sync to Celpip', 'syncToWebhook')
    .addItem('Validate Sheet', 'validateSheet')
    .addItem('Column Inspector', 'inspectColumns')
    .addToUi();
}

function inspectColumns() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const html = '<h3>Sheet Columns:</h3><pre>' + JSON.stringify(headers, null, 2) + '</pre>';
  const ui = SpreadsheetApp.getUi();
  ui.showModelessDialog(
    HtmlService.createHtmlOutput(html),
    'Column Inspector'
  );
  
  Logger.log('Headers:', headers);
}

function syncToWebhook() {
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

    const response = sendToWebhook(parsed);

    if (response.success) {
      showAlert(
        'Success ✅',
        `Synced: ${parsed.section} ${parsed.part}\n${response.questionsCount} questions uploaded`
      );
      appendLog(`[${new Date().toLocaleString()}] Synced ${parsed.section} ${parsed.part}`);
    } else {
      showAlert('Error', response.error || 'Unknown error');
    }
  } catch (error) {
    showAlert('Error', error.toString());
  }
}

function parseRow(headers, row) {
  // Find column indices
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
    // Look for Q{N}_Text to know if question exists
    const textColName = `Q${qNum}_Text`;
    const textIdx = getColIndex(textColName);
    
    if (textIdx === -1) break; // No more questions

    const text = row[textIdx];
    if (!text) break; // Empty question

    // Build question object
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
      errors.push(`Q${idx + 1}: Answer index out of range (${q.options.length} options, got ${q.answer})`);
    }
    if (!['easy', 'medium', 'hard'].includes(q.difficulty)) {
      errors.push(`Q${idx + 1}: Invalid difficulty (use easy/medium/hard, got "${q.difficulty}")`);
    }
  });

  return errors;
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

function sendToWebhook(payload) {
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  try {
    const response = UrlFetchApp.fetch(WEBHOOK_URL, options);
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
