/**
 * Google Apps Script for Question Bank Sync
 * 
 * HOW TO USE:
 * 1. Open your Google Sheet
 * 2. Click Extensions > Apps Script
 * 3. Delete the default code
 * 4. Paste THIS entire code
 * 5. Save and run setupMenu()
 * 6. Fill your sheet with question data
 * 7. Click "Sync to Celpip" button in Sheet menu
 * 
 * SHEET FORMAT (Header Row):
 * | Section | Part | Title | Passage | Q1_Text | Q1_Type | Q1_Opts_A | Q1_Opts_B | Q1_Opts_C | Q1_Opts_D | Q1_Answer | Q1_Explanation | Q1_Difficulty | ... Q2, Q3, etc
 * 
 * Example Row:
 * | Reading | R1 | Email — Fitness Centre | [long passage] | What is the gist? | gist | Option 1 | Option 2 | Option 3 | Option 4 | 1 | Explanation... | easy | ...
 * 
 * NOTES:
 * - Answer: use 0, 1, 2, or 3 (matching option index)
 * - Type: gist, detail, inference, vocab_context, tone_purpose, speaker_view, mcq, paragraph_match, speaker_id
 * - Difficulty: easy, medium, hard
 */

const WEBHOOK_URL = 'YOUR_WEBHOOK_URL_HERE'; // Replace with your actual endpoint

/**
 * Setup menu on open
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Celpip Sync')
    .addItem('Sync to Celpip', 'syncToWebhook')
    .addItem('Validate Sheet', 'validateSheet')
    .addItem('Clear Response', 'clearResponse')
    .addToUi();
}

/**
 * Main sync function
 */
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
    // Parse first row (single practice set)
    const parsed = parseRow(headers, firstRow);

    // Validate before sending
    const errors = validatePayload(parsed);
    if (errors.length > 0) {
      showAlert('Validation Error', errors.join('\n'));
      return;
    }

    // Send to webhook
    const response = sendToWebhook(parsed);
    
    // Show result
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

/**
 * Parse a single row into question payload
 */
function parseRow(headers, row) {
  const section = row[headers.indexOf('Section')];
  const part = row[headers.indexOf('Part')];
  const title = row[headers.indexOf('Title')];
  const passage = row[headers.indexOf('Passage')] || '';
  const instruction = row[headers.indexOf('Instruction')] || '';

  const questions = [];
  let qNum = 1;

  while (true) {
    const textIdx = headers.indexOf(`Q${qNum}_Text`);
    if (textIdx === -1) break;

    const typeIdx = headers.indexOf(`Q${qNum}_Type`);
    const optAIdx = headers.indexOf(`Q${qNum}_Opts_A`);
    const optBIdx = headers.indexOf(`Q${qNum}_Opts_B`);
    const optCIdx = headers.indexOf(`Q${qNum}_Opts_C`);
    const optDIdx = headers.indexOf(`Q${qNum}_Opts_D`);
    const ansIdx = headers.indexOf(`Q${qNum}_Answer`);
    const expIdx = headers.indexOf(`Q${qNum}_Explanation`);
    const diffIdx = headers.indexOf(`Q${qNum}_Difficulty`);

    const text = row[textIdx];
    if (!text) break; // Empty question, stop parsing

    const type = row[typeIdx] || 'mcq';
    const opts = [
      row[optAIdx] || `Option ${qNum}.1`,
      row[optBIdx] || `Option ${qNum}.2`,
      row[optCIdx] || `Option ${qNum}.3`,
      row[optDIdx] || `Option ${qNum}.4`,
    ];
    const answer = parseInt(row[ansIdx] || 0);
    const explanation = row[expIdx] || '';
    const difficulty = (row[diffIdx] || 'medium').toLowerCase();

    questions.push({
      id: qNum,
      text,
      questionType: type,
      options: opts,
      answer,
      explanation,
      difficulty,
    });

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

/**
 * Validate payload before sending
 */
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
      errors.push(`Q${idx + 1}: Answer index out of range`);
    }
    if (!['easy', 'medium', 'hard'].includes(q.difficulty)) {
      errors.push(`Q${idx + 1}: Invalid difficulty (use easy/medium/hard)`);
    }
  });

  return errors;
}

/**
 * Send payload to webhook
 */
function sendToWebhook(payload) {
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY_HERE', // Replace with your API key
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true, // Don't throw on 4xx/5xx
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

/**
 * Validate sheet without sending
 */
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

/**
 * Helper: Show alert dialog
 */
function showAlert(title, message) {
  const ui = SpreadsheetApp.getUi();
  ui.alert(title + '\n\n' + message);
}

/**
 * Helper: Append log to sheet
 */
function appendLog(message) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let logSheet = ss.getSheetByName('_Log');
  if (!logSheet) {
    logSheet = ss.insertSheet('_Log');
    logSheet.appendRow(['Timestamp', 'Message']);
  }
  logSheet.appendRow([new Date().toLocaleString(), message]);
}

/**
 * Clear log sheet
 */
function clearResponse() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const logSheet = ss.getSheetByName('_Log');
  if (logSheet) {
    const range = logSheet.getDataRange();
    if (range.getNumRows() > 1) {
      logSheet.deleteRows(2, range.getNumRows() - 1);
    }
  }
  showAlert('Cleared', 'Log sheet cleared');
}
