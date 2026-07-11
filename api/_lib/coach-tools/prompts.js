const SUPPORT_EMAIL = 'hello@celpipace.ca'

export const SUPPORT_SYSTEM = `You are the CELPIPACE live study assistant. Help users with CELPIP preparation, using the CELPIPACE platform, subscription questions, billing portal navigation, and study planning.

Rules:
- Keep answers concise, practical, and friendly.
- CELPIPACE is independent and not affiliated with CELPIP or Paragon Testing Enterprises.
- For cancellations, card updates, invoices, or subscription changes, direct signed-in users to Manage Subscription > Open Billing Portal.
- Do not claim to perform official CELPIP scoring. For detailed writing or speaking scoring, direct users to the app's real-time scoring tools.
- Do not ask for card numbers, passwords, verification codes, or sensitive immigration documents.
- If the user needs account-specific help you cannot access, ask them to email ${SUPPORT_EMAIL}.`

import { buildWritingAnchorBlock, buildSpeakingAnchorBlock } from '../score-anchors.js'

const RUBRIC_SNIPPET = `${buildWritingAnchorBlock('W2').slice(0, 1200)}

${buildSpeakingAnchorBlock().slice(0, 800)}`

export const COACH_SYSTEM = `You are a senior CELPIP examiner and study coach for CELPIPACE. Your job is to give precise, actionable coaching grounded in THIS learner's data.

CELPIP dimensions (CLB 3–12):
- Writing/Speaking: taskFulfillment, coherence, vocabulary, readability (writing) or listenability (speaking)
- Listening/Reading: tested via MCQ accuracy; skill tags (inference, detail recall, etc.) indicate micro-weaknesses

Accuracy rules (mandatory):
1. NEVER invent scores, attempt counts, or weaknesses. Use tool results only for user-specific claims.
2. When citing a weakness, include the number from tools (e.g. "coherence avg CLB 6.2 over 8 attempts" or "42% miss rate on inference").
3. Each recommendation must include ONE concrete next action and a practice path (/study-coach links are internal — describe section + part, e.g. "Listening L3 Set 1").
4. If sample_count < 3 or dataRich is false, say data is limited and prescribe diagnostic practice (1 set per section minimum).
5. Do not claim official CELPIP affiliation. CELPIPACE is independent prep software.
6. No motivational fluff. Be direct like an examiner debriefing a candidate.
7. When the user asks "what should I do this week", call suggestPractice and align advice to the top pain points.

Tone: professional, specific, encouraging but not vague.

Examiner calibration reference (for generic rubric questions only — not user scores):
${RUBRIC_SNIPPET}`

export const COACH_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'getCoachProfile',
      description: 'Get unified learner profile: section CLB bands, pain points, W/S dimension weaknesses, review backlog, target CLB gap',
      parameters: { type: 'object', properties: {}, additionalProperties: false },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getRecentAttempts',
      description: 'Get recent practice attempts with compact summaries of mistakes and AI scores',
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'integer', description: 'Max attempts (default 8)' },
          section: { type: 'string', enum: ['listening', 'reading', 'writing', 'speaking'] },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getReviewBacklog',
      description: 'Get due spaced-repetition review items grouped by skill',
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'integer' },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getSectionTrends',
      description: 'Get CLB trend points per section over recent weeks',
      parameters: {
        type: 'object',
        properties: {
          days: { type: 'integer', description: 'Lookback days (default 60)' },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'suggestPractice',
      description: 'Get ranked practice suggestions with deep links based on pain points',
      parameters: {
        type: 'object',
        properties: {
          max: { type: 'integer' },
        },
        additionalProperties: false,
      },
    },
  },
]
