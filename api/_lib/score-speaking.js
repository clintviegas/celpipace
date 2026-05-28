/* global process */
// /api/score-speaking.js
// CELPIP Speaking scoring — RAG-augmented, anchored, dual-pass.
// Mirrors score-writing.js. See that file for the high-level pipeline notes.

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
import { buildSpeakingAnchorBlock } from './score-anchors.js';
import { runDualPassScoring } from './score-shared.js';

const MAX_RESPONSE_CHARS = 6000;  // transcripts run longer than written prose
const MAX_PROMPT_CHARS   = 2000;
const MAX_TOPIC_CHARS    = 200;

const DIMENSIONS = ['taskFulfillment', 'coherence', 'vocabulary', 'listenability'];

// Trust-but-bound: drop anything outside plausible ranges so a manipulated
// client payload can't unfairly inflate or tank the score.
function sanitizeFluencyMetrics(raw) {
  if (!raw || typeof raw !== 'object') return null
  const num = (v, min, max) => {
    const n = Number(v)
    if (!Number.isFinite(n)) return null
    return Math.max(min, Math.min(max, n))
  }
  const out = {
    durationSec: num(raw.durationSec, 0, 600),
    wordCount: num(raw.wordCount, 0, 5000),
    wpm: num(raw.wpm, 0, 400),
    fillerCount: num(raw.fillerCount, 0, 500),
    fillerRate: num(raw.fillerRate, 0, 1),
    pauseCount: num(raw.pauseCount, 0, 500),
    longPauseCount: num(raw.longPauseCount, 0, 100),
    avgPauseSec: num(raw.avgPauseSec, 0, 60),
    maxPauseSec: num(raw.maxPauseSec, 0, 60),
    pauseRatio: num(raw.pauseRatio, 0, 1),
    confidence: num(raw.confidence, 0, 1),
  }
  if (Array.isArray(raw.fillerWords)) {
    out.fillerWords = raw.fillerWords
      .filter(f => f && typeof f.word === 'string' && Number.isFinite(Number(f.count)))
      .slice(0, 10)
      .map(f => ({ word: String(f.word).slice(0, 24), count: Math.max(0, Math.min(500, Number(f.count))) }))
  }
  // If none of the structural fields are usable, treat the whole thing as missing.
  if (out.wpm == null && out.fillerCount == null && out.pauseCount == null) return null
  return out
}

function buildFluencyBlock(m) {
  if (!m) return ''
  const lines = []
  lines.push('AUDIO FLUENCY METRICS (from Whisper transcription):')
  if (m.durationSec != null) lines.push(`- Spoken duration: ${m.durationSec.toFixed(1)}s`)
  if (m.wpm != null) lines.push(`- Words per minute: ${m.wpm} (CLB 9+ typically 110–160 WPM; under 80 suggests halting delivery)`)
  if (m.fillerCount != null) {
    const rate = m.fillerRate != null ? ` (${(m.fillerRate * 100).toFixed(1)}% of all words)` : ''
    lines.push(`- Filler words used: ${m.fillerCount}${rate}`)
    if (m.fillerWords?.length) {
      lines.push(`  Top fillers: ${m.fillerWords.map(f => `"${f.word}" ×${f.count}`).join(', ')}`)
    }
  }
  if (m.pauseCount != null) {
    lines.push(`- Pauses ≥ 0.4s: ${m.pauseCount} (long pauses ≥ 1.0s: ${m.longPauseCount ?? 0}, avg ${m.avgPauseSec ?? 0}s, max ${m.maxPauseSec ?? 0}s)`)
  }
  if (m.pauseRatio != null) lines.push(`- Time spent silent: ${(m.pauseRatio * 100).toFixed(0)}%`)
  if (m.confidence != null) lines.push(`- Transcription clarity confidence: ${(m.confidence * 100).toFixed(0)}% (low values suggest unclear pronunciation)`)
  lines.push('')
  lines.push('Use these signals when scoring Listenability and Coherence. A transcript that reads well but came from a halting delivery (low WPM, many long pauses, high filler rate) should not score top bands on Listenability. Conversely, smooth, well-paced delivery should be rewarded even if the transcript looks plain.')
  return lines.join('\n')
}

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

  const rl = await checkRateLimit({ supabase: auth.supabase, scope: 'score-speaking', key: userId, limit: 30, windowSec: 3600 });
  if (!rl.ok) return res.status(429).json({ error: 'too_many_requests', message: rl.message });

  // Free tier: 1 AI evaluation per section, lifetime
  const { data: profile } = await auth.supabase
    .from('profiles')
    .select('is_premium, premium_expires_at, subscription_status')
    .eq('id', userId)
    .single();
  const isPremium = !!(profile?.is_premium &&
    (profile?.subscription_status || 'active') !== 'expired' &&
    (!profile?.premium_expires_at || new Date(profile.premium_expires_at) > new Date()));
  if (!isPremium) {
    const { count } = await auth.supabase
      .from('essay_embeddings')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('section', 'speaking')
      .eq('source', 'submission');
    if ((count ?? 0) >= 1) {
      return res.status(403).json({
        error: 'free_limit_reached',
        section: 'speaking',
        message: 'You\'ve used your 1 free AI speaking evaluation. Upgrade to Premium for unlimited scoring.',
      });
    }
  }

  const { responseText, prompt, taskType, topic, fluencyMetrics: rawMetrics } = req.body || {};
  const fluencyMetrics = sanitizeFluencyMetrics(rawMetrics);

  if (!responseText || !prompt) {
    return res.status(400).json({ error: 'Missing responseText or prompt' });
  }
  if (typeof responseText !== 'string' || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'responseText and prompt must be strings' });
  }
  if (responseText.length > MAX_RESPONSE_CHARS) {
    return res.status(413).json({ error: 'response_too_long', message: `Transcript must be under ${MAX_RESPONSE_CHARS} characters.` });
  }
  if (prompt.length > MAX_PROMPT_CHARS) {
    return res.status(413).json({ error: 'prompt_too_long' });
  }
  if (topic && (typeof topic !== 'string' || topic.length > MAX_TOPIC_CHARS)) {
    return res.status(400).json({ error: 'invalid_topic' });
  }

  const wordCount = responseText.trim().split(/\s+/).length;
  // Normalise speaking task type to S1..S8 if a number is passed. Falls back to raw value.
  const normalisedTaskType = (() => {
    if (!taskType) return 'S?';
    const n = Number(taskType);
    if (Number.isFinite(n) && n >= 1 && n <= 8) return `S${n}`;
    return String(taskType);
  })();

  // ── 1. Best-effort RAG context ────────────────────────────────────────────
  let queryEmbedding = null;
  let exemplars = [];
  let weaknessProfile = null;
  const ragMeta = { embedded: false, exemplarsRetrieved: 0, weaknessSamples: 0 };

  try {
    queryEmbedding = await embed(responseText);
    ragMeta.embedded = true;
  } catch (err) {
    console.warn('[score-speaking] embed failed:', err.message);
  }

  if (queryEmbedding) {
    [exemplars, weaknessProfile] = await Promise.all([
      retrieveExemplars({
        embedding: queryEmbedding,
        section:   'speaking',
        taskType:  normalisedTaskType,
        k: 3,
      }),
      retrieveWeaknessProfile({ userId, section: 'speaking', window: 10 }),
    ]);
    ragMeta.exemplarsRetrieved = exemplars.length;
    ragMeta.weaknessSamples    = weaknessProfile?.sample_count || 0;
  }

  const anchorBlock   = buildSpeakingAnchorBlock();
  const exemplarBlock = buildExemplarBlock(exemplars);
  const weaknessBlock = buildWeaknessBlock(weaknessProfile);
  const fluencyBlock  = buildFluencyBlock(fluencyMetrics);

  // ── 2. Build prompt ───────────────────────────────────────────────────────
  const systemPrompt = `You are a certified CELPIP Speaking examiner with 10+ years of experience. You evaluate spoken response transcripts using the official CELPIP-General scoring scale (3–12). You are rigorous and conservative — when in doubt, score lower rather than higher.

The student has completed a speaking task and submitted a transcript of what they said. Evaluate the transcript as if it were a spoken response, taking into account fillers, self-corrections, and natural spoken cadence.

SCORING DIMENSIONS (each scored 3–12):
1. **Task Fulfillment** — Does the response fully address the prompt and all required points? Relevant throughout? Sufficient detail and elaboration?
2. **Coherence & Organization** — Clear intro/body/conclusion, logical flow, natural transitions for spoken English.
3. **Vocabulary Range** — Precision, variety, natural collocations for spoken English, register match.
4. **Listenability** — Reads as natural spoken English (not stiff/written), appropriate pacing, controlled use of fillers and self-corrections.

CLB BAND DESCRIPTORS:
- 10–12: Advanced — near-native fluency, sophisticated vocabulary, full coverage of all prompt points.
- 8–9:  Upper-Intermediate — clear and effective, good range, minor gaps in coverage.
- 6–7:  Intermediate — adequate communication, noticeable gaps, limited elaboration.
- 4–5:  Lower — limited range, frequent issues, incomplete task coverage.
- 3:    Developing — very limited, significant difficulty communicating ideas.

SPEAKING TASK TYPE: ${normalisedTaskType}${topic ? `
SCENE/TOPIC: ${topic}
For "Describing a Scene" tasks, score Task Fulfillment based on coverage of the specific scene elements (people, actions, spatial details, atmosphere). For "Making Predictions" tasks, score based on the logic and specificity of predictions about what will happen next in this scene.` : ''}

LENGTH RULES (strict — speaking tasks run 60–90 seconds):
- Under 30 words: Task Fulfillment cannot exceed 4.
- 30–59 words: Task Fulfillment cannot exceed 6.
- 60–89 words: Task Fulfillment cannot exceed 7.
- 90+ words: full range available based on quality.

SCORING METHOD:
- Anchor your scores to the calibration anchors below. Match the transcript to whichever anchor it most resembles in fluency, organization, vocabulary, and task coverage.
- Be conservative: a transcript only earns CLB 9+ when its weakest dimension matches the CLB 9 anchor.
- Each suggestion must reference a specific phrase or sentence from the student's transcript (quote it).
- Feedback should be 2–3 sentences, concrete, and reference the actual transcript.

${anchorBlock}${fluencyBlock ? '\n\n' + fluencyBlock : ''}${weaknessBlock ? '\n\n' + weaknessBlock : ''}${exemplarBlock ? '\n\n' + exemplarBlock : ''}`;

  const userMessage = `SPEAKING PROMPT:
${prompt}

TASK TYPE: ${normalisedTaskType}${topic ? `\nSCENE TOPIC: ${topic}` : ''}

STUDENT'S SPOKEN RESPONSE TRANSCRIPT (${wordCount} words):
${responseText}

Score this transcript against the calibration anchors. Return scores as integers 3–12 for each of: taskFulfillment, coherence, vocabulary, listenability. Provide 2–3 sentences of feedback and 3–4 specific suggestions, each quoting a fragment from the student's transcript.`;

  // ── 3. Dual-pass scoring ──────────────────────────────────────────────────
  try {
    const result = await runDualPassScoring({
      apiKey,
      systemPrompt,
      userMessage,
      dimensions: DIMENSIONS,
      wordCount,
      responseText,
      fluencyMetrics,
      section: 'speaking',
    });

    const { scores, rawOverall, overall, feedback, suggestions, meta } = result;
    const clbBand = overall;

    // ── 4. Persist (best-effort) ────────────────────────────────────────────
    if (queryEmbedding && userId) {
      await persistScoredEssay({
        userId,
        section:      'speaking',
        taskType:     normalisedTaskType,
        topic:        topic || null,
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
      fluency: fluencyMetrics || null,
    });
  } catch (err) {
    console.error('Score speaking error:', err);
    return res.status(500).json({ error: 'Failed to score response', detail: err?.message });
  }
}
