#!/usr/bin/env node
// scripts/seed-exemplars.mjs
//
// One-shot script that:
//   1. Parses src/pages/PracticeSetPage.jsx for question objects with a
//      `modelAnswer` field.
//   2. Embeds each model answer via OpenAI text-embedding-3-small.
//   3. Upserts them into public.essay_embeddings as is_exemplar = TRUE rows.
//
// These curated answers seed the retrieval index so the FIRST user submission
// already benefits from RAG context, instead of waiting for organic data.
//
// Idempotent: each row is keyed on (section, task_type, source_key) — re-runs
// update embeddings/text in place rather than duplicating.
//
// Usage:
//   node scripts/seed-exemplars.mjs              # full seed
//   node scripts/seed-exemplars.mjs --dry        # parse only, no API calls
//   node scripts/seed-exemplars.mjs --limit 5    # limit for cost-controlled smoke test
//
// Requires (loaded from .env):
//   OPENAI_API_KEY
//   VITE_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

// Load .env into process.env without adding a dotenv dep.
async function loadDotenv() {
  const envPath = path.resolve(process.cwd(), '.env');
  try {
    const txt = await fs.readFile(envPath, 'utf8');
    for (const line of txt.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const [, k, vRaw] = m;
      if (process.env[k]) continue;
      const v = vRaw.replace(/^['"]|['"]$/g, '');
      process.env[k] = v;
    }
  } catch { /* no .env present — rely on shell env */ }
}

const ROOT = path.resolve(fileURLToPath(import.meta.url), '..', '..');
const SOURCE = path.join(ROOT, 'src', 'pages', 'PracticeSetPage.jsx');

// ── Argv ────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const isDry = args.includes('--dry');
const limitFlag = args.indexOf('--limit');
const LIMIT = limitFlag >= 0 ? Number(args[limitFlag + 1]) : Infinity;

// ── Parser ──────────────────────────────────────────────────────────────────
//
// We look for object literals that contain a `modelAnswer:` key. For each, we
// extract:
//   - id        (e.g. 'w1_3', 's2_5')
//   - num       (numeric)
//   - section   ('W1','W2','S1'..'S8')
//   - prompt    (template-literal contents)
//   - modelAnswer (template-literal contents)
//
// The trick: model answers are template literals (backticks) that contain
// newlines and apostrophes but no ${...} interpolation. We greedy-match up to
// the closing backtick that's followed by `,\n  }`-style boundaries.

function extractField(block, key, isTemplate = false) {
  if (isTemplate) {
    const re = new RegExp(`${key}\\s*:\\s*\`([\\s\\S]*?)\`\\s*,`, 'm');
    const m = block.match(re);
    return m ? m[1] : null;
  }
  const reStr = new RegExp(`${key}\\s*:\\s*['"]([^'"\\n]*)['"]`);
  const reNum = new RegExp(`${key}\\s*:\\s*(\\d+)`);
  return block.match(reStr)?.[1] || block.match(reNum)?.[1] || null;
}

function findExemplarBlocks(source) {
  // Find every modelAnswer occurrence, then walk backwards to the enclosing
  // `{` that opens the question object, and forward to the matching `}`.
  const out = [];
  const indices = [];
  let i = 0;
  while ((i = source.indexOf('modelAnswer:', i)) !== -1) {
    indices.push(i);
    i += 'modelAnswer:'.length;
  }

  for (const idx of indices) {
    // Walk back to find the opening '{' of the enclosing object.
    let depth = 0;
    let start = -1;
    for (let p = idx; p >= 0; p--) {
      const c = source[p];
      if (c === '}') depth++;
      else if (c === '{') {
        if (depth === 0) { start = p; break; }
        depth--;
      }
    }
    if (start < 0) continue;

    // Walk forward to find the matching '}'.
    depth = 0;
    let end = -1;
    let inBacktick = false;
    let inSingle = false;
    let inDouble = false;
    for (let p = start; p < source.length; p++) {
      const c = source[p];
      const prev = source[p - 1];
      if (!inSingle && !inDouble && c === '`' && prev !== '\\') inBacktick = !inBacktick;
      else if (!inBacktick && !inDouble && c === "'" && prev !== '\\') inSingle = !inSingle;
      else if (!inBacktick && !inSingle && c === '"' && prev !== '\\') inDouble = !inDouble;
      else if (!inBacktick && !inSingle && !inDouble) {
        if (c === '{') depth++;
        else if (c === '}') {
          depth--;
          if (depth === 0) { end = p; break; }
        }
      }
    }
    if (end < 0) continue;

    const block = source.slice(start, end + 1);

    const id      = extractField(block, 'id');
    const num     = Number(extractField(block, 'num')) || null;
    const section = extractField(block, 'section');
    const topic   = extractField(block, 'topic') || extractField(block, 'topicName');
    const prompt  = extractField(block, 'prompt', true);
    const ma      = extractField(block, 'modelAnswer', true);

    if (!id || !section || !ma) continue;

    out.push({
      sourceKey: id,
      section: section.startsWith('W') ? 'writing' : 'speaking',
      taskType: section,
      num,
      topic,
      promptText: prompt || null,
      responseText: ma.trim(),
    });
  }
  return out;
}

// ── Embedding (1536 dims) ───────────────────────────────────────────────────
async function embedBatch(texts, apiKey) {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: texts }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`embedBatch failed: ${res.status} ${body.slice(0, 300)}`);
  }
  const json = await res.json();
  return json.data.map(d => d.embedding);
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  await loadDotenv();
  const supaUrl = process.env.VITE_SUPABASE_URL;
  const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const oaiKey  = process.env.OPENAI_API_KEY;

  if (!supaUrl || !supaKey) throw new Error('VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing');
  if (!oaiKey && !isDry)    throw new Error('OPENAI_API_KEY missing (or pass --dry)');

  console.log(`[seed] reading ${path.relative(ROOT, SOURCE)}`);
  const src = await fs.readFile(SOURCE, 'utf8');
  const all = findExemplarBlocks(src);
  console.log(`[seed] parsed ${all.length} exemplars`);

  const items = all.slice(0, LIMIT);
  if (items.length < all.length) console.log(`[seed] limited to first ${items.length}`);
  if (items.length === 0) {
    console.log('[seed] nothing to do');
    return;
  }

  // Print a per-task-type summary so the user can sanity-check coverage.
  const byTask = items.reduce((m, x) => { m[x.taskType] = (m[x.taskType] || 0) + 1; return m; }, {});
  console.log('[seed] coverage:', byTask);

  if (isDry) {
    console.log('[seed] --dry: skipping embedding + upsert');
    console.log('[seed] sample row:', { ...items[0], responseText: items[0].responseText.slice(0, 120) + '…' });
    return;
  }

  const sb = createClient(supaUrl, supaKey, { auth: { persistSession: false } });

  // Embed in batches of 50 to stay well under the OpenAI per-request limit.
  const BATCH = 50;
  for (let i = 0; i < items.length; i += BATCH) {
    const slice = items.slice(i, i + BATCH);
    console.log(`[seed] embedding ${i + 1}–${i + slice.length} of ${items.length}`);
    const vecs = await embedBatch(slice.map(s => s.responseText), oaiKey);

    // Upsert by (section, task_type, source.key=id-as-topic-prefix). We don't
    // have a unique constraint, so we delete-then-insert per source_key to be
    // safe and idempotent on re-runs.
    const sourceKeys = slice.map(s => s.sourceKey);
    const { error: delErr } = await sb
      .from('essay_embeddings')
      .delete()
      .eq('is_exemplar', true)
      .eq('source', 'exemplar')
      .in('topic', sourceKeys);
    if (delErr) console.warn('[seed] cleanup delete warning:', delErr.message);

    const rows = slice.map((s, j) => ({
      user_id:       null,
      is_exemplar:   true,
      source:        'exemplar',
      section:       s.section,
      task_type:     s.taskType,
      // Stash the source id in topic so re-runs are idempotent. The user-facing
      // topic (e.g. speaking scene name) is rarely set on exemplar inserts.
      topic:         s.sourceKey,
      prompt_text:   s.promptText,
      response_text: s.responseText,
      word_count:    s.responseText.split(/\s+/).length,
      overall_score: 11.0,                 // model answers are aspirational — top of the scale
      dim_scores: {
        taskFulfillment: 11,
        coherence:       11,
        vocabulary:      11,
        readability:     11,
        listenability:   11,
      },
      feedback:    null,
      suggestions: null,
      embedding:   vecs[j],
    }));

    const { error: insErr } = await sb.from('essay_embeddings').insert(rows);
    if (insErr) {
      console.error('[seed] insert failed:', insErr.message);
      process.exit(1);
    }
  }

  console.log(`[seed] done — ${items.length} exemplars upserted`);
}

main().catch(err => {
  console.error('[seed] fatal:', err);
  process.exit(1);
});
