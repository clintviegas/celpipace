/* global process */
// /api/_lib/embeddings.js
// Thin wrapper around OpenAI's text-embedding-3-small (1536 dims).
//
// Why text-embedding-3-small?
//   - Cheap ($0.02/1M tokens) — fits the per-essay scoring budget.
//   - 1536 dims matches the pgvector column type without truncation.
//   - Quality is sufficient for short-form (150–250 word) essay similarity.
//
// All callers should:
//   1. Trim and normalise whitespace BEFORE calling embed() — empty inputs
//      throw, since pgvector cannot store NULL embeddings.
//   2. Treat embed() failures as soft — scoring should still succeed without
//      retrieval (see graceful fallback in score-writing.js / score-speaking.js).

const EMBED_URL = 'https://api.openai.com/v1/embeddings';
const MODEL = 'text-embedding-3-small';

export async function embed(text) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY missing');

  const input = String(text || '').trim();
  if (!input) throw new Error('embed() called with empty input');

  const res = await fetch(EMBED_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: MODEL, input }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`embed() failed: ${res.status} ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const vec = data?.data?.[0]?.embedding;
  if (!Array.isArray(vec) || vec.length !== 1536) {
    throw new Error(`embed() returned malformed vector (len=${vec?.length})`);
  }
  return vec;
}

// Batch helper for the seed script. OpenAI accepts up to 2048 inputs per call.
export async function embedBatch(texts) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY missing');

  const inputs = texts.map(t => String(t || '').trim()).filter(Boolean);
  if (inputs.length === 0) return [];

  const res = await fetch(EMBED_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: MODEL, input: inputs }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`embedBatch() failed: ${res.status} ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.data.map(d => d.embedding);
}
