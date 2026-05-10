/* global process */
// /api/score-writing.js
// CELPIP Writing scoring — RAG-augmented.
//
// Pipeline:
//   1. Embed the response.
//   2. Retrieve top-3 exemplars (same task_type) and the user's weakness profile.
//   3. Inject both into the system prompt — exemplars as calibration, weakness
//      profile as personalised feedback steering.
//   4. Call the chat model.
//   5. Persist the submission + embedding + scores back to essay_embeddings,
//      so future submissions benefit from a richer history.
//
// All RAG steps are best-effort. If embedding or retrieval fails, the function
// degrades cleanly to the original rubric-only behaviour — the user always
// gets a score back.

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

const MAX_RESPONSE_CHARS = 4000;  // ~600 words — well above CELPIP 250-word ceiling
const MAX_PROMPT_CHARS   = 2000;

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

  const exemplarBlock = buildExemplarBlock(exemplars);
  const weaknessBlock = buildWeaknessBlock(weaknessProfile);

  // ── 2. Build prompt ───────────────────────────────────────────────────────
  const systemPrompt = `You are a certified CELPIP Writing examiner with 10+ years of experience. You evaluate responses using the official CELPIP-General scoring scale (3–12).

SCORING CRITERIA (score each 3–12):
1. **Task Fulfillment** (Content & Task Completion)
   - Does the response fully address the prompt and all required points?
   - Is the purpose, audience, and tone appropriate?
   - Is the response within the recommended 150–200 word range?

2. **Coherence & Organization** (Text Structure)
   - Is there a clear introduction, body, and closing?
   - Are ideas logically organized with smooth transitions?
   - Does each paragraph serve a clear purpose?

3. **Vocabulary Range** (Lexical Resource)
   - Is word choice precise and varied?
   - Are collocations and idioms used naturally?
   - Is vocabulary appropriate for the context and audience?

4. **Readability & Grammar** (Linguistic Control)
   - Is grammar accurate (tenses, articles, prepositions, subject-verb agreement)?
   - Is sentence structure varied (simple, compound, complex)?
   - Are spelling and punctuation correct?

SCORING GUIDELINES:
- 10–12: Advanced — near-native fluency, sophisticated vocabulary, complex structures with minimal errors
- 8–9: Upper-Intermediate — clear and effective, good range, occasional minor errors
- 6–7: Intermediate — adequate communication, noticeable errors that don't impede understanding
- 4–5: Lower — limited range, frequent errors, meaning sometimes unclear
- 3: Developing — very limited, significant difficulty communicating

TASK TYPE: ${normalisedTaskType === 'W1' ? 'Email Writing (formal/semi-formal/informal based on context)' : 'Survey Response (expressing and supporting an opinion)'}

IMPORTANT:
- Be fair but rigorous — match real CELPIP scoring standards
- Shorter responses (<140 words) should receive lower Task Fulfillment scores
- Provide specific, actionable feedback referencing the actual text
- Each suggestion must reference a specific part of the response that can be improved${weaknessBlock ? '\n\n' + weaknessBlock : ''}${exemplarBlock ? '\n\n' + exemplarBlock : ''}

Respond with ONLY valid JSON in this exact format:
{
  "overall": <number 3.0-12.0 with one decimal>,
  "scores": {
    "taskFulfillment": <number 3-12>,
    "coherence": <number 3-12>,
    "vocabulary": <number 3-12>,
    "readability": <number 3-12>
  },
  "feedback": "<2-3 sentences of specific feedback about this response>",
  "suggestions": [
    "<specific suggestion 1 referencing the actual text>",
    "<specific suggestion 2>",
    "<specific suggestion 3>",
    "<specific suggestion 4>"
  ]
}`;

  const userMessage = `WRITING PROMPT:
${prompt}

SCORING CRITERIA TO EVALUATE:
${(criteria || ['Task Fulfillment', 'Coherence', 'Vocabulary', 'Grammar']).join(', ')}

STUDENT'S RESPONSE (${wordCount} words):
${responseText}

Score this response. Return ONLY the JSON object.`;

  // ── 3. Call the chat model ────────────────────────────────────────────────
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userMessage  },
        ],
        temperature: 0.3,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('OpenAI error:', response.status, errBody);
      return res.status(502).json({ error: 'Scoring service error', detail: errBody });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return res.status(502).json({ error: 'Empty scoring response' });

    const jsonStr = content.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(jsonStr);

    const clamp = v => Math.max(3, Math.min(12, Math.round(Number(v) || 5)));
    const scores = {
      taskFulfillment: clamp(result.scores?.taskFulfillment),
      coherence:       clamp(result.scores?.coherence),
      vocabulary:      clamp(result.scores?.vocabulary),
      readability:     clamp(result.scores?.readability),
    };
    const rawOverall = +((scores.taskFulfillment + scores.coherence + scores.vocabulary + scores.readability) / 4).toFixed(1);
    const overall = Math.max(3, Math.min(12, Math.round(rawOverall)));
    const clbBand = overall;
    const suggestions = Array.isArray(result.suggestions) ? result.suggestions.slice(0, 4) : [];
    const feedback = result.feedback || 'No feedback available.';

    // ── 4. Persist (best-effort, non-blocking on response) ──────────────────
    if (queryEmbedding && userId) {
      // Fire-and-await briefly so logs are coherent, but failures don't break the response.
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
    });
  } catch (err) {
    console.error('Score writing error:', err);
    return res.status(500).json({ error: 'Failed to score response' });
  }
}
