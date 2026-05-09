/* global process */
// Disabled endpoint source preserved from /api/study-recommendations.js.
// Vercel Hobby allows 12 Serverless Functions; keep this outside the top-level
// api route list until the project moves to Pro or another endpoint is merged.

import { retrieveWeaknessProfile } from '../_lib/rag.js';
import { requireUser } from '../_lib/auth.js';
import { checkRateLimit } from '../_lib/rateLimit.js';

const RECOMMENDER_SYSTEM = `You are a CELPIP study coach. Given a learner's recent score profile, produce 3 concrete next-step recommendations.

Rules:
- Each recommendation must reference a specific weakness from the profile (use the dimension name and the avg score).
- Each must include a concrete action the learner can take this week (a task type to drill, a pattern to study, a target).
- No generic advice. No motivational fluff. Be specific.

Return ONLY valid JSON:
{
  "summary": "<one sentence describing the overall picture>",
  "recommendations": [
    { "focus": "<dimension>", "why": "<one-line rationale tied to the numbers>", "action": "<specific next step>" },
    ...
  ]
}`;

async function generatePlan(profile, section) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  if (!profile || !profile.sample_count) return null;

  const userMessage = `SECTION: ${section}
SAMPLE SIZE: ${profile.sample_count}
AVG OVERALL: ${profile.avg_overall ?? 'n/a'}
WEAKEST DIMENSION: ${profile.weakest || 'n/a'}
STRONGEST DIMENSION: ${profile.strongest || 'n/a'}
PER-DIMENSION:
${Object.entries(profile.dimensions || {}).map(([k, v]) =>
  `- ${k}: avg ${v.avg} (range ${v.min}-${v.max} over ${v.count} attempts)`
).join('\n')}

Produce the JSON plan.`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: RECOMMENDER_SYSTEM },
          { role: 'user',   content: userMessage      },
        ],
        temperature: 0.3,
        max_tokens: 400,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    const jsonStr = content.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.warn('[study-recommendations] plan gen failed:', err.message);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await requireUser(req);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
  const userId = auth.user.id;

  const rl = await checkRateLimit({ supabase: auth.supabase, scope: 'study-rec', key: userId, limit: 60, windowSec: 3600 });
  if (!rl.ok) return res.status(429).json({ error: 'too_many_requests', message: rl.message });

  const rawSection = req.query?.section || req.body?.section || null;
  const section = rawSection && ['writing', 'speaking'].includes(String(rawSection)) ? String(rawSection) : null;
  if (rawSection && !section) return res.status(400).json({ error: 'invalid_section' });

  const sections = section ? [section] : ['writing', 'speaking'];
  const out = {};

  for (const sec of sections) {
    const profile = await retrieveWeaknessProfile({ userId, section: sec, window: 10 });
    const plan    = profile?.sample_count >= 2 ? await generatePlan(profile, sec) : null;
    out[sec] = { profile, plan };
  }

  return res.status(200).json({ userId, sections: out });
}