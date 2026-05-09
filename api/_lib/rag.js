/* global process */
// /api/_lib/rag.js
// Retrieval helpers for the AI scoring pipelines.
//
// Pipeline (per submission):
//   1. embed(responseText)
//   2. retrieveExemplars(...)         — top-K high-scoring essays for the same task type
//   3. retrieveWeaknessProfile(...)   — user's recent per-dimension averages
//   4. buildRagContext(...)           — formats both into a prompt-injectable string
//   5. (caller scores via OpenAI)
//   6. persistScoredEssay(...)        — writes the submission + embedding + scores back
//
// All four retrieval functions are best-effort: any error is caught and an
// empty fallback is returned so the scoring path never breaks because of RAG.

import { createClient } from '@supabase/supabase-js';

let _client = null;
function getServiceClient() {
  if (_client) return _client;
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase service-role env vars missing (VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)');
  }
  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

// ── Retrieval ───────────────────────────────────────────────────────────────

export async function retrieveExemplars({ embedding, section, taskType, k = 3, minScore = 9.0 }) {
  try {
    const sb = getServiceClient();
    const { data, error } = await sb.rpc('match_essay_exemplars', {
      query_embedding: embedding,
      p_section:       section,
      p_task_type:     taskType,
      p_match_count:   k,
      p_min_score:     minScore,
    });
    if (error) {
      console.warn('[rag] retrieveExemplars error:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('[rag] retrieveExemplars threw:', err.message);
    return [];
  }
}

export async function retrieveWeaknessProfile({ userId, section, window = 10 }) {
  if (!userId) return null;
  try {
    const sb = getServiceClient();
    const { data, error } = await sb.rpc('get_user_weakness_profile', {
      p_user_id: userId,
      p_section: section,
      p_window:  window,
    });
    if (error) {
      console.warn('[rag] retrieveWeaknessProfile error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('[rag] retrieveWeaknessProfile threw:', err.message);
    return null;
  }
}

// ── Prompt-injection formatting ─────────────────────────────────────────────
// Keep these blocks compact — every token costs money and dilutes the rubric.

export function buildExemplarBlock(exemplars) {
  if (!exemplars || exemplars.length === 0) return '';
  const lines = exemplars.map((ex, i) => {
    const score = ex.overall_score != null ? `score ${Number(ex.overall_score).toFixed(1)}/12` : 'high-scoring';
    const sim   = ex.similarity != null ? `sim ${Number(ex.similarity).toFixed(2)}` : '';
    // Cap exemplar text so we don't blow the context window. 300 words ≈ 400 tokens.
    const trimmed = String(ex.response_text || '').split(/\s+/).slice(0, 300).join(' ');
    return `### Exemplar ${i + 1} (${score}${sim ? ', ' + sim : ''})\n${trimmed}`;
  });
  return [
    'REFERENCE EXEMPLARS — high-scoring responses to similar prompts. Use as a calibration anchor for what a strong response looks like; do NOT penalise the student for stylistic differences.',
    ...lines,
  ].join('\n\n');
}

export function buildWeaknessBlock(profile) {
  if (!profile || !profile.sample_count || profile.sample_count < 2) return '';

  const dims = profile.dimensions || {};
  const dimEntries = Object.entries(dims)
    .map(([k, v]) => ({ name: k, avg: Number(v?.avg ?? 0), count: v?.count ?? 0 }))
    .filter(d => d.count >= 2)
    .sort((a, b) => a.avg - b.avg);

  if (dimEntries.length === 0) return '';

  const weak = dimEntries.filter(d => d.avg < 8).slice(0, 2);
  if (weak.length === 0) return '';

  const summary = weak
    .map(d => `${d.name} (avg ${d.avg.toFixed(1)} over ${d.count} recent submissions)`)
    .join('; ');

  return [
    `LEARNER PROFILE — this student has historically scored lower on: ${summary}.`,
    'Where the current response shows progress on these areas, acknowledge it explicitly. Where the same patterns recur, name them concretely so the student can recognise the trend.',
  ].join(' ');
}

// ── Persistence ─────────────────────────────────────────────────────────────

export async function persistScoredEssay({
  userId, section, taskType, topic, promptText,
  responseText, wordCount, embedding,
  overallScore, dimScores, feedback, suggestions,
}) {
  if (!userId) return null;             // Anonymous attempts are not persisted (yet).
  try {
    const sb = getServiceClient();
    const { data, error } = await sb
      .from('essay_embeddings')
      .insert({
        user_id:       userId,
        is_exemplar:   false,
        source:        'submission',
        section,
        task_type:     taskType,
        topic:         topic || null,
        prompt_text:   promptText || null,
        response_text: responseText,
        word_count:    wordCount,
        overall_score: overallScore,
        dim_scores:    dimScores,
        feedback,
        suggestions,
        embedding,
      })
      .select('id')
      .single();
    if (error) {
      console.warn('[rag] persistScoredEssay error:', error.message);
      return null;
    }
    return data?.id || null;
  } catch (err) {
    console.warn('[rag] persistScoredEssay threw:', err.message);
    return null;
  }
}
