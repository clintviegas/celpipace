/**
 * Question Bank Sync API
 * 
 * Receives question data from Google Sheets via Google Apps Script
 * Syncs to Supabase and optionally updates local cache
 * 
 * Usage:
 * POST /api/question-sync
 * Body: { section, data: [...questions] }
 */

import { supabase } from '../lib/supabaseClient';

/**
 * Validate question structure before syncing
 */
const validateQuestion = (question, index) => {
  const errors = [];

  if (!question.id) errors.push(`Q${index}: missing 'id'`);
  if (!question.text) errors.push(`Q${index}: missing 'text'`);
  if (!question.options || !Array.isArray(question.options)) {
    errors.push(`Q${index}: 'options' must be an array`);
  } else if (question.options.length < 2) {
    errors.push(`Q${index}: must have at least 2 options`);
  }
  if (typeof question.answer !== 'number') {
    errors.push(`Q${index}: 'answer' must be a number (0-3)`);
  }
  if (question.answer < 0 || question.answer >= question.options.length) {
    errors.push(`Q${index}: answer index out of range (${question.options.length} options)`);
  }
  if (!['easy', 'medium', 'hard'].includes(question.difficulty)) {
    errors.push(`Q${index}: difficulty must be 'easy', 'medium', or 'hard'`);
  }
  if (!question.questionType) {
    errors.push(`Q${index}: missing 'questionType'`);
  }

  return errors;
};

/**
 * Validate practice set structure
 */
const validatePracticeSet = (data) => {
  const errors = [];

  if (!data.section) errors.push("missing 'section' (e.g., 'Reading')");
  if (!data.part) errors.push("missing 'part' (e.g., 'R1')");
  if (!data.title) errors.push("missing 'title'");
  if (!data.passage && data.section !== 'Writing' && data.section !== 'Speaking') {
    errors.push("missing 'passage' (not required for Writing/Speaking)");
  }
  if (!Array.isArray(data.questions) || data.questions.length === 0) {
    errors.push("'questions' must be a non-empty array");
  } else {
    data.questions.forEach((q, idx) => {
      const qErrors = validateQuestion(q, idx + 1);
      errors.push(...qErrors);
    });
  }

  return errors;
};

/**
 * Transform question data to snake_case for Supabase storage
 */
const transformQuestionForDB = (question, practiceSetId) => {
  return {
    practice_set_id: practiceSetId,
    question_text: question.text,
    question_type: question.questionType,
    options: question.options, // Stored as JSON array
    correct_answer_index: question.answer,
    explanation: question.explanation || '',
    difficulty_level: question.difficulty,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

/**
 * Main sync endpoint
 */
export const syncQuestionsFromSheet = async (req, res) => {
  try {
    // Validate authorization (optional: add API key check)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const payload = req.body;

    // Validate payload
    const errors = validatePracticeSet(payload);
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    const { section, part, title, passage, questions } = payload;

    // 1. Create or update practice_set in Supabase
    const { data: practiceSet, error: psError } = await supabase
      .from('practice_sets')
      .upsert(
        {
          section,
          part,
          title,
          passage,
          instruction: payload.instruction || '',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'section,part' } // Unique constraint on section+part
      )
      .select()
      .single();

    if (psError) {
      return res.status(500).json({
        error: 'Failed to upsert practice set',
        details: psError.message,
      });
    }

    // 2. Delete old questions for this practice set (optional: soft delete or update instead)
    const { error: delError } = await supabase
      .from('questions')
      .delete()
      .eq('practice_set_id', practiceSet.id);

    if (delError) {
      console.warn('Warning: Failed to delete old questions', delError);
      // Don't fail the whole sync, just warn
    }

    // 3. Insert new questions
    const questionsForDB = questions.map((q) => transformQuestionForDB(q, practiceSet.id));

    const { error: qError } = await supabase
      .from('questions')
      .insert(questionsForDB);

    if (qError) {
      return res.status(500).json({
        error: 'Failed to insert questions',
        details: qError.message,
      });
    }

    // 4. Return success response
    return res.status(200).json({
      success: true,
      message: `Synced ${section} ${part}: ${title}`,
      practiceSetId: practiceSet.id,
      questionsCount: questions.length,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Health check endpoint for testing
 */
export const healthCheck = (req, res) => {
  return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
};
