/**
 * Append L5 and L6 data to src/data/listeningData.js
 * in the exact same format as L1-L4.
 * Run: node scripts/append-l5l6.mjs
 */
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const SRC = '/Users/clintviegas/Desktop/Celpipace/listening 2'
const OUT = join(import.meta.dirname, '..', 'src', 'data', 'listeningData.js')

const FILES = [
  { file: 'L5_discussion.json', icon: '🗣️', timeMins: 8 },
  { file: 'L6_viewpoints.json', icon: '⚖️', timeMins: 8 },
]

const LETTER_TO_IDX = { A: 0, B: 1, C: 2, D: 3 }

function escapeJS(s) {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
}

// Read the existing file
let existing = readFileSync(OUT, 'utf8')

// Remove the trailing `}\n` so we can append
existing = existing.replace(/\}\s*$/, '')

let appendBlock = ''

for (const { file, icon, timeMins } of FILES) {
  const raw = readFileSync(join(SRC, file), 'utf8')
  const data = JSON.parse(raw)
  const partId = data.part
  const partLabel = data.title
  const desc = data.description
  const qCount = data.question_count

  appendBlock += `  ${partId}: {\n`
  appendBlock += `    partId: '${partId}',\n`
  appendBlock += `    partLabel: '${escapeJS(partLabel)}',\n`
  appendBlock += `    description: '${escapeJS(desc)}',\n`
  appendBlock += `    icon: '${icon}',\n`
  appendBlock += `    timeLimitMinutes: ${timeMins},\n`
  appendBlock += `    questionCount: ${qCount},\n`
  appendBlock += `    sets: [\n`

  for (const set of data.sets) {
    appendBlock += `      {\n`
    appendBlock += `        setNumber: ${set.set_number},\n`
    appendBlock += `        difficulty: '${set.difficulty}',\n`
    appendBlock += `        title: '${escapeJS(set.title)}',\n`
    appendBlock += `        context: '${escapeJS(set.context)}',\n`

    // speakers
    appendBlock += `        speakers: [\n`
    for (const sp of set.speakers) {
      const rolePart = sp.role ? `, role: '${escapeJS(sp.role)}'` : ''
      appendBlock += `          { id: '${sp.id}', name: '${escapeJS(sp.name)}'${rolePart}, voice: '${sp.voice}' },\n`
    }
    appendBlock += `        ],\n`

    // transcript
    appendBlock += `        transcript: [\n`
    for (const t of set.transcript) {
      appendBlock += `          { speaker: '${t.speaker}', text: '${escapeJS(t.text)}' },\n`
    }
    appendBlock += `        ],\n`

    // questions
    appendBlock += `        questions: [\n`
    for (const q of set.questions) {
      const opts = Object.values(q.options)
      const ansIdx = LETTER_TO_IDX[q.correct_answer]
      appendBlock += `          {\n`
      appendBlock += `            num: ${q.question_number},\n`
      appendBlock += `            text: '${escapeJS(q.question_text)}',\n`
      appendBlock += `            skill: '${q.skill_type}',\n`
      appendBlock += `            options: [${opts.map(o => `'${escapeJS(o)}'`).join(', ')}],\n`
      appendBlock += `            answer: ${ansIdx},\n`
      appendBlock += `          },\n`
    }
    appendBlock += `        ],\n`

    appendBlock += `      },\n`
  }

  appendBlock += `    ],\n`
  appendBlock += `  },\n`
}

appendBlock += `}\n`

writeFileSync(OUT, existing + appendBlock, 'utf8')
console.log(`Appended L5 & L6 to ${OUT}`)

// Count lines
const finalLines = readFileSync(OUT, 'utf8').split('\n').length
console.log(`Total lines: ${finalLines}`)
