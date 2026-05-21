/* global process */
// /api/score-writing.js
// CELPIP Writing scoring — RAG-augmented, anchored, dual-pass.
//
// Pipeline:
//   1. Embed the response.
//   2. Retrieve top-3 exemplars (same task_type) + user's weakness profile.
//   3. Inject calibration anchors (CLB 6/8/9/11), exemplars, and weakness
//      profile into the system prompt.
//   4. Run dual-pass scoring (gpt-4o, two temperatures, structured outputs),
//      average per-dimension scores, apply length-based hard rules.
//   5. Persist the submission + embedding + scores for future RAG.
//
// All RAG steps are best-effort. If embedding/retrieval fails, scoring still
// proceeds with anchors-only calibration.

import { embed } from './embeddings.js';
import {
  retrieveExemplars,
  retrieveWeaknessProfile,
  buildExemplarBlock,
  buildWeaknessBlock,
  persistScoredEssay,
} from './rag.js';
import { requireUser } from './auth.js';
import { checkRateLimit } from './rateLimit.js';
import { buildWritingAnchorBlock } from './score-anchors.js';
import { runDualPassScoring } from './score-shared.js';

const MAX_RESPONSE_CHARS = 4000;  // ~600 words — well above CELPIP 250-word ceiling
const MAX_PROMPT_CHARS   = 2000;

const DIMENSIONS = ['taskFulfillment', 'coherence', 'vocabulary', 'readability'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Scoring service is not configured' });
  }

  const auth = await requireUser(req);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
  const userId = auth.user.id;

  const rl = await checkRateLimit({ supabase: auth.supabase, scope: 'score-writing', key: userId, limit: 30, windowSec: 3600 });
  if (!rl.ok) return res.status(429).json({ error: 'too_many_requests', message: rl.message });

  const { responseText, prompt, criteria, taskType } = req.body || {};

  if (!responseText || !prompt) {
    return res.status(400).json({ error: 'Missing responseText or prompt' });
  }
  if (typeof responseText !== 'string' || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'responseText and prompt must be strings' });
  }
  if (responseText.length > MAX_RESPONSE_CHARS) {
    return res.status(413).json({ error: 'response_too_long', message: `Response must be under ${MAX_RESPONSE_CHARS} characters.` });
  }
  if (prompt.length > MAX_PROMPT_CHARS) {
    return res.status(413).json({ error: 'prompt_too_long' });
  }

  const wordCount = responseText.trim().split(/\s+/).length;
  const normalisedTaskType = taskType === 'W1' || taskType === 'email' ? 'W1' : 'W2';

  // ── 1. Best-effort RAG context ────────────────────────────────────────────
  let queryEmbedding = null;
  let exemplars = [];
  let weaknessProfile = null;
  const ragMeta = { embedded: false, exemplarsRetrieved: 0, weaknessSamples: 0 };

  try {
    queryEmbedding = await embed(responseText);
    ragMeta.embedded = true;
  } catch (err) {
    console.warn('[score-writing] embed failed:', err.message);
  }

  if (queryEmbedding) {
    [exemplars, weaknessProfile] = await Promise.all([
      retrieveExemplars({
        embedding: queryEmbedding,
        section:   'writing',
        taskType:  normalisedTaskType,
        k: 3,
      }),
      retrieveWeaknessProfile({ userId, section: 'writing', window: 10 }),
    ]);
    ragMeta.exemplarsRetrieved = exemplars.length;
    ragMeta.weaknessSamples    = weaknessProfile?.sample_count || 0;
  }

  const anchorBlock   = buildWritingAnchorBlock(normalisedTaskType);
  const exemplarBlock = buildExemplarBlock(exemplars);
  const weaknessBlock = buildWeaknessBlock(weaknessProfile);

  // ── 2. Build prompt ───────────────────────────────────────────────────────
  const systemPrompt = `You are a certified CELPIP Writing examiner with 10+ years of experience. You evaluate responses using the official CELPIP-General scoring scale (3–12). You are rigorous and conservative — when in doubt, score lower rather than higher.

SCORING DIMENSIONS (each scored 3–12):
1. **Task Fulfillment** — Does the response fully address the prompt? Is purpose, audience, and tone appropriate? Is length within 150–200 words?
2. **Coherence & Organization** — Clear intro/body/closing, logical flow, smooth transitions, paragraph purpose.
3. **Vocabulary Range** — Precision, variety, natural collocations, register match.
4. **Readability & Grammar** — Tense/article/agreement accuracy, sentence variety, spelling, punctuation.

CLB BAND DESCRIPTORS:
- 10–12: Advanced — near-native fluency, sophisticated vocabulary, complex structures, minimal/no errors.
- 8–9:  Upper-Intermediate — clear and effective, good range, occasional minor errors.
- 6–7:  Intermediate — adequate communication, noticeable errors that don't impede understanding.
- 4–5:  Lower — limited range, frequent errors, meaning sometimes unclear.
- 3:    Developing — very limited, significant difficulty communicating.

TASK TYPE: ${normalisedTaskType === 'W1' ? 'Email Writing (formal/semi-formal/informal based on context)' : 'Survey Response (expressing and supporting an opinion)'}

LENGTH RULES (strict):
- Under 50 words: Task Fulfillment cannot exceed 4.
- 50–99 words: Task Fulfillment cannot exceed 6.
- 100–139 words: Task Fulfillment cannot exceed 7.
- 140+ words: full range available based on quality.

SCORING METHOD:
- Anchor your scores to the calibration anchors below. Match the response to whichever anchor it most resembles.
- Be conservative: a response only earns CLB 9+ when its weakest dimension matches the CLB 9 anchor.
- Each suggestion must reference a specific phrase or sentence in the student's response (quote it).
- Feedback should be 2–3 sentences, concrete, and reference the actual text.

${anchorBlock}${weaknessBlock ? '\n\n' + weaknessBlock : ''}${exemplarBlock ? '\n\n' + exemplarBlock : ''}`;

  const userMessage = `WRITING PROMPT:
${prompt}

SCORING CRITERIA TO EVALUATE:
${(criteria || ['Task Fulfillment', 'Coherence', 'Vocabulary', 'Grammar']).join(', ')}

STUDENT'S RESPONSE (${wordCount} words):
${responseText}

Score this response against the calibration anchors. Return scores as integers 3–12 for each of: taskFulfillment, coherence, vocabulary, readability. Provide 2–3 sentences of feedback and 3–4 specific suggestions, each quoting a fragment from the student's response.`;

  // ── 3. Dual-pass scoring ──────────────────────────────────────────────────
  try {
    const result = await runDualPassScoring({
      apiKey,
      systemPrompt,
      userMessage,
      dimensions: DIMENSIONS,
      wordCount,
      responseText,
      section: 'writing',
    });

    const { scores, rawOverall, overall, feedback, suggestions, meta } = result;
    const clbBand = overall;

    // ── 4. Persist (best-effort) ────────────────────────────────────────────
    if (queryEmbedding && userId) {
      await persistScoredEssay({
        userId,
        section:      'writing',
        taskType:     normalisedTaskType,
        topic:        null,
        promptText:   prompt,
        responseText,
        wordCount,
        embedding:    queryEmbedding,
        overallScore: rawOverall,
        dimScores:    scores,
        feedback,
        suggestions,
      });
    }

    return res.status(200).json({
      overall,
      rawOverall,
      clbBand,
      scores,
      feedback,
      suggestions,
      rag: ragMeta,
      scoring: meta,
    });
  } catch (err) {
    console.error('Score writing error:', err);
    return res.status(500).json({ error: 'Failed to score response', detail: err?.message });
  }
}
