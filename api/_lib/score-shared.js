/* global process */
// /api/_lib/score-shared.js
// Shared scoring infrastructure for writing + speaking.
//
// What this gives the scorers:
//   1. Structured Outputs schema (json_schema mode) so the model fills
//      exact fields — eliminates manual JSON parsing failures.
//   2. Dual-pass self-consistency: run the model twice in parallel at
//      slightly different temperatures, average the per-dimension scores,
//      and surface a confidence signal when the passes disagree.
//   3. Hard validation rules so a hallucinated CLB-12 on a 30-word essay
//      gets clamped before reaching the user.
//
// Cost note: dual-pass roughly doubles the OpenAI bill but at ~$0.005 per
// score (gpt-4o), this is still under a cent per submission.

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'
const SCORING_MODEL = process.env.SCORING_MODEL || 'gpt-4o-2024-08-06'

function buildSchema(dimensions) {
  // OpenAI Structured Outputs requires strict schema: no minimum/maximum,
  // no minItems/maxItems. Range + count enforcement happens after parse.
  const dimProperties = {}
  for (const dim of dimensions) {
    dimProperties[dim] = { type: 'integer', description: `${dim} score, integer 3 through 12` }
  }
  return {
    name: 'celpip_score',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        scores: {
          type: 'object',
          properties: dimProperties,
          required: dimensions,
          additionalProperties: false,
        },
        feedback: { type: 'string' },
        suggestions: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: ['scores', 'feedback', 'suggestions'],
      additionalProperties: false,
    },
  }
}

async function callOpenAI({ apiKey, systemPrompt, userMessage, schema, temperature }) {
  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: SCORING_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature,
      max_tokens: 900,
      response_format: { type: 'json_schema', json_schema: schema },
    }),
  })
  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`OpenAI ${res.status}: ${errBody}`)
  }
  const data = await res.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('empty_completion')
  return JSON.parse(content)
}

const clamp = v => Math.max(3, Math.min(12, Math.round(Number(v) || 5)))

/**
 * Lightweight structure detection. Used by the writing hard-rules to detect
 * when a response is a single undifferentiated wall of text vs has clear
 * intro/body/closing paragraphs. We treat blank-line separators and
 * explicit transition markers as evidence of structure.
 */
function hasMultiParagraphStructure(text) {
  if (!text) return false
  const blocks = String(text)
    .split(/\n\s*\n/)
    .map(b => b.trim())
    .filter(Boolean)
  if (blocks.length >= 2) return true
  // Single-block fallback: look for at least two distinct discourse markers,
  // which is a weak but useful signal in short emails that don't paragraph break.
  const markers = /\b(first(ly)?|second(ly)?|in addition|moreover|however|on the other hand|in conclusion|to conclude|finally|overall|in summary|therefore|as a result)\b/gi
  const matches = String(text).match(markers)
  return (matches?.length || 0) >= 2
}

/**
 * Apply hard rule-based clamps on top of the model's score. Catches the
 * "model gave a 12 to a 40-word essay" hallucination class.
 *
 * @param {object} args
 * @param {object} args.scores         — per-dimension { dim: int }
 * @param {string[]} args.dimensions   — list of dimension keys
 * @param {number} args.wordCount
 * @param {string} [args.responseText] — original text, used for structure detection
 * @param {object} [args.fluencyMetrics] — speaking only: wpm, fillerRate, etc.
 * @param {'writing'|'speaking'} args.section
 */
function applyHardRules({ scores, dimensions, wordCount, responseText, fluencyMetrics, section }) {
  let taskCap = 12
  if (section === 'writing') {
    if (wordCount < 50) taskCap = 4
    else if (wordCount < 100) taskCap = 6
    else if (wordCount < 140) taskCap = 7
  } else {
    // Speaking transcripts run longer than written prose.
    if (wordCount < 30) taskCap = 4
    else if (wordCount < 60) taskCap = 6
    else if (wordCount < 90) taskCap = 7
  }
  const flags = []
  const out = { ...scores }
  if (taskCap < 12 && out.taskFulfillment > taskCap) {
    flags.push(`length_cap_applied:${taskCap}`)
    out.taskFulfillment = taskCap
  }

  // Structure cap: a response that's clearly a single block of prose with no
  // discernible body/conclusion can't claim CLB 8+ coherence. Writing only —
  // spoken responses don't have paragraph breaks and structure is detected
  // by the model directly.
  if (section === 'writing' && responseText && !hasMultiParagraphStructure(responseText) && wordCount >= 100) {
    if (out.coherence > 7) {
      flags.push('structure_cap_applied')
      out.coherence = 7
    }
  }

  // Speaking-only: extreme disfluency from audio metrics caps listenability.
  // Triggers only when we have real audio signal (not a fallback transcript).
  if (section === 'speaking' && fluencyMetrics && typeof fluencyMetrics.wpm === 'number') {
    const { wpm, fillerRate, longPauseCount } = fluencyMetrics
    // Very slow + many fillers + repeated long pauses = halting delivery.
    if (wpm > 0 && wpm < 60 && (fillerRate ?? 0) > 0.08) {
      if (out.listenability > 7) {
        flags.push('disfluency_cap_listenability')
        out.listenability = 7
      }
    }
    if ((longPauseCount ?? 0) >= 5 && wordCount < 150) {
      if (out.listenability > 7) {
        flags.push('long_pause_cap_listenability')
        out.listenability = 7
      }
    }
  }

  // Don't let any single dimension exceed taskFulfillment by more than 2 —
  // discourages "11 vocabulary on a tiny essay" outliers.
  for (const d of dimensions) {
    if (d === 'taskFulfillment') continue
    if (out[d] > out.taskFulfillment + 2) {
      flags.push(`${d}_aligned_to_task`)
      out[d] = out.taskFulfillment + 2
    }
  }
  return { scores: out, flags }
}

function avgPair(a, b) {
  // Round to nearest int — CELPIP bands are integer-valued for sub-dimensions.
  return Math.round((a + b) / 2)
}

/**
 * Run the dual-pass scoring pipeline.
 *
 * @param {object} args
 * @param {string}   args.apiKey
 * @param {string}   args.systemPrompt
 * @param {string}   args.userMessage
 * @param {string[]} args.dimensions   — ordered list of dimension keys, e.g. ['taskFulfillment','coherence','vocabulary','readability']
 * @param {number}   args.wordCount
 * @param {string}   [args.responseText]     — used for writing structure detection
 * @param {object}   [args.fluencyMetrics]   — used for speaking disfluency caps
 * @param {'writing'|'speaking'} args.section
 * @returns {Promise<{
 *   scores: object,
 *   rawOverall: number,
 *   overall: number,
 *   feedback: string,
 *   suggestions: string[],
 *   meta: { agreement: number, flags: string[], model: string }
 * }>}
 */
export async function runDualPassScoring({ apiKey, systemPrompt, userMessage, dimensions, wordCount, responseText, fluencyMetrics, section }) {
  const schema = buildSchema(dimensions)

  // Two parallel calls at different temperatures. The diversity makes the
  // average more representative than a single deterministic pass and
  // surfaces when the model is uncertain.
  const [pass1, pass2] = await Promise.all([
    callOpenAI({ apiKey, systemPrompt, userMessage, schema, temperature: 0.15 }),
    callOpenAI({ apiKey, systemPrompt, userMessage, schema, temperature: 0.4 }),
  ])

  const averaged = {}
  let totalDelta = 0
  for (const d of dimensions) {
    const a = clamp(pass1.scores?.[d])
    const b = clamp(pass2.scores?.[d])
    averaged[d] = avgPair(a, b)
    totalDelta += Math.abs(a - b)
  }
  // Agreement: 1.0 means identical, 0 means maximally divergent across all dims.
  const maxPossibleDelta = dimensions.length * 9 // 12-3
  const agreement = +(1 - totalDelta / maxPossibleDelta).toFixed(2)

  const { scores, flags } = applyHardRules({
    scores: averaged,
    dimensions,
    wordCount,
    responseText,
    fluencyMetrics,
    section,
  })

  const sum = dimensions.reduce((acc, d) => acc + scores[d], 0)
  const rawOverall = +(sum / dimensions.length).toFixed(1)
  const overall = Math.max(3, Math.min(12, Math.round(rawOverall)))

  // Prefer the higher-temperature pass's feedback if both are valid (richer
  // wording), but fall back to pass1 if pass2's text looks degenerate.
  const pickFeedback = (p) => (typeof p.feedback === 'string' && p.feedback.length > 30 ? p.feedback : null)
  const feedback = pickFeedback(pass2) || pickFeedback(pass1) || 'No feedback available.'

  // Merge & dedupe suggestions, keep at most 4.
  const seen = new Set()
  const suggestions = []
  for (const p of [pass1, pass2]) {
    for (const s of Array.isArray(p.suggestions) ? p.suggestions : []) {
      const trimmed = String(s).trim()
      const key = trimmed.toLowerCase()
      if (!trimmed || seen.has(key)) continue
      seen.add(key)
      suggestions.push(trimmed)
      if (suggestions.length === 4) break
    }
    if (suggestions.length === 4) break
  }

  return {
    scores,
    rawOverall,
    overall,
    feedback,
    suggestions,
    meta: { agreement, flags, model: SCORING_MODEL },
  }
}
