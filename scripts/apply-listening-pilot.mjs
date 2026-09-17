/**
 * Merge pilot trap enrichments into src/data/listeningData.js
 * Run: node scripts/apply-listening-pilot.mjs
 */
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT = join(ROOT, 'src', 'data', 'listeningData.js')
const PILOT = join(ROOT, 'src', 'data', 'listening', 'pilot-set1-traps.json')

const pilot = JSON.parse(readFileSync(PILOT, 'utf8'))
const { LISTENING_DATA } = await import(pathToFileURL(OUT).href)

let merged = 0

for (const [partId, spec] of Object.entries(pilot)) {
  const part = LISTENING_DATA[partId]
  if (!part) {
    console.warn(`Part ${partId} not found — skipping`)
    continue
  }
  const set = part.sets.find((s) => s.setNumber === spec.setNumber)
  if (!set) {
    console.warn(`${partId} set ${spec.setNumber} not found — skipping`)
    continue
  }

  for (const patch of spec.questions) {
    const q = set.questions.find((item) => item.num === patch.num)
    if (!q) {
      console.warn(`${partId} Q${patch.num} not found — skipping`)
      continue
    }
    q.options = patch.options
    q.answer = patch.answer
    q.explanation = patch.explanation
    if (patch.primary_trap) q.primary_trap = patch.primary_trap
    merged++
  }
}

const header = `// Auto-generated from listening practice data; answer option order has been balanced across A-D.
// Pilot set 1 (L1–L6) includes trap distractors + explanations — see docs/LISTENING_TRAP_PLAYBOOK.md
// Apply pilot: node scripts/apply-listening-pilot.mjs

`

writeFileSync(OUT, `${header}export const LISTENING_DATA = ${JSON.stringify(LISTENING_DATA, null, 2)}\n`, 'utf8')
console.log(`Merged ${merged} questions into ${OUT}`)
