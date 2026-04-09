/**
 * Convert L1-L4 JSON files into src/data/listeningData.js
 * Run: node scripts/convert-listening.mjs
 */
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const SRC = '/Users/clintviegas/Desktop/Celpipace/listening'
const OUT = join(import.meta.dirname, '..', 'src', 'data', 'listeningData.js')

const FILES = [
  'L1_problem_solving.json',
  'L2_daily_conversation.json',
  'L3_information.json',
  'L4_news_item.json',
]

const ICONS = { L1: '\uD83D\uDD0D', L2: '\uD83D\uDDE3\uFE0F', L3: '\uD83D\uDCCB', L4: '\uD83D\uDCF0' }
const TIME_MINS = { L1: 8, L2: 5, L3: 8, L4: 5 }

const LETTER_TO_IDX = { A: 0, B: 1, C: 2, D: 3 }

function escapeJS(s) {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
}

let js = `// Auto-generated from L1-L4 JSON files — do not edit manually
// Run: node scripts/convert-listening.mjs

export const LISTENING_DATA = {\n`

for (const file of FILES) {
  const raw = readFileSync(join(SRC, file), 'utf8')
  const data = JSON.parse(raw)
  const partId = data.part          // "L1"
  const partLabel = data.title      // "Problem Solving"
  const desc = data.description
  const qCount = data.question_count
  const icon = ICONS[partId] || '\uD83C\uDFA7'
  const timeMins = TIME_MINS[partId] || 8

  js += `  ${partId}: {\n`
  js += `    partId: '${partId}',\n`
  js += `    partLabel: '${escapeJS(partLabel)}',\n`
  js += `    description: '${escapeJS(desc)}',\n`
  js += `    icon: '${icon}',\n`
  js += `    timeLimitMinutes: ${timeMins},\n`
  js += `    questionCount: ${qCount},\n`
  js += `    sets: [\n`

  for (const set of data.sets) {
    js += `      {\n`
    js += `        setNumber: ${set.set_number},\n`
    js += `        difficulty: '${set.difficulty}',\n`
    js += `        title: '${escapeJS(set.title)}',\n`
    js += `        context: '${escapeJS(set.context)}',\n`

    // speakers
    js += `        speakers: [\n`
    for (const sp of set.speakers) {
      js += `          { id: '${sp.id}', name: '${escapeJS(sp.name)}', role: '${escapeJS(sp.role)}', voice: '${sp.voice}' },\n`
    }
    js += `        ],\n`

    // transcript
    js += `        transcript: [\n`
    for (const t of set.transcript) {
      js += `          { speaker: '${t.speaker}', text: '${escapeJS(t.text)}' },\n`
    }
    js += `        ],\n`

    // questions
    js += `        questions: [\n`
    for (const q of set.questions) {
      const opts = Object.values(q.options)
      const ansIdx = LETTER_TO_IDX[q.correct_answer]
      js += `          {\n`
      js += `            num: ${q.question_number},\n`
      js += `            text: '${escapeJS(q.question_text)}',\n`
      js += `            skill: '${q.skill_type}',\n`
      js += `            options: [${opts.map(o => `'${escapeJS(o)}'`).join(', ')}],\n`
      js += `            answer: ${ansIdx},\n`
      js += `          },\n`
    }
    js += `        ],\n`

    js += `      },\n`
  }

  js += `    ],\n`
  js += `  },\n`
}

js += `}\n`

writeFileSync(OUT, js, 'utf8')
console.log(`Wrote ${OUT}`)
console.log(`Size: ${(js.length / 1024).toFixed(1)} KB`)
