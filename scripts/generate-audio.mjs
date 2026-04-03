/**
 * generate-audio.mjs
 *
 * Generates TTS audio for all CELPIP Listening practice sets using OpenAI TTS.
 * Creates one MP3 per transcript line so different voices can be used per speaker.
 *
 * Output structure:
 *   public/audio/L1/set-01/line-00.mp3
 *   public/audio/L1/set-01/line-01.mp3
 *   ...
 *   public/audio/L6/set-20/line-00.mp3
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... node scripts/generate-audio.mjs
 *   OPENAI_API_KEY=sk-... node scripts/generate-audio.mjs --part L1
 *   OPENAI_API_KEY=sk-... node scripts/generate-audio.mjs --part L1 --set 1
 *   OPENAI_API_KEY=sk-... node scripts/generate-audio.mjs --dry-run
 *
 * Voices used:
 *   female speakers → nova  (warm, natural Canadian-English female)
 *   male speakers   → onyx  (clear, authoritative male)
 *
 * Cost estimate: ~$4 total for all 700 lines at tts-1-hd pricing.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { LISTENING_DATA } from '../src/data/listeningData.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT      = path.resolve(__dirname, '..')
const OUT_DIR   = path.join(ROOT, 'public', 'audio')

/* ── Load .env file ────────────────────────────────────────── */
const envPath = path.join(ROOT, '.env')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const [key, ...rest] = line.split('=')
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
  }
}

/* ── CLI flags ─────────────────────────────────────────────── */
const args    = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const PART    = args.includes('--part') ? args[args.indexOf('--part') + 1] : null
const SET_NUM = args.includes('--set')  ? parseInt(args[args.indexOf('--set')  + 1]) : null

/* ── Config ────────────────────────────────────────────────── */
const API_KEY = process.env.OPENAI_API_KEY
const MODEL   = 'tts-1-hd'          // higher quality; use 'tts-1' to halve cost
const DELAY_MS = 500                 // ms between API calls
const MAX_RETRIES = 4                // retry up to 4 times on rate limit
const RETRY_BASE_MS = 21000         // 21s base wait on rate limit (3 RPM limit)
const VOICE_MAP = {
  female: ['nova', 'shimmer', 'fable'],  // pool of female-sounding voices
  male:   ['onyx', 'echo', 'alloy'],      // pool of male-sounding voices
}
const DEFAULT_VOICE = 'alloy'

/* ── Helpers ───────────────────────────────────────────────── */
const pad = (n, len = 2) => String(n).padStart(len, '0')

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Build a speakerId→voice map for a set's speakers.
 * If multiple speakers share the same gender (e.g. two females in L5),
 * each gets a unique voice from the pool.
 */
function buildVoiceMap(speakers) {
  const counters = { female: 0, male: 0 }
  const map = {}
  for (const sp of speakers) {
    const pool = VOICE_MAP[sp.voice] || [DEFAULT_VOICE]
    map[sp.id] = pool[counters[sp.voice] % pool.length] || DEFAULT_VOICE
    counters[sp.voice] = (counters[sp.voice] || 0) + 1
  }
  return map
}

function getVoice(speakerId, voiceMap) {
  return voiceMap[speakerId] || DEFAULT_VOICE
}

async function generateTTS(text, voice, outPath) {
  if (DRY_RUN) {
    console.log(`  [dry-run] Would generate: ${path.relative(ROOT, outPath)} (voice: ${voice})`)
    return
  }

  if (fs.existsSync(outPath)) {
    console.log(`  skip  ${path.relative(ROOT, outPath)} (already exists)`)
    return
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        model:           MODEL,
        input:           text,
        voice:           voice,
        response_format: 'mp3',
      }),
    })

    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer())
      fs.mkdirSync(path.dirname(outPath), { recursive: true })
      fs.writeFileSync(outPath, buffer)
      console.log(`  saved ${path.relative(ROOT, outPath)}`)
      return
    }

    const err = await res.json().catch(() => ({}))
    const isRateLimit = res.status === 429

    if (isRateLimit && attempt < MAX_RETRIES) {
      const waitMs = RETRY_BASE_MS * (attempt + 1)
      console.log(`  rate limit — waiting ${waitMs / 1000}s before retry ${attempt + 1}/${MAX_RETRIES}...`)
      await sleep(waitMs)
      continue
    }

    throw new Error(`OpenAI API error ${res.status}: ${JSON.stringify(err)}`)
  }
}

/* ── Main ──────────────────────────────────────────────────── */
async function main() {
  if (!DRY_RUN && !API_KEY) {
    console.error('Error: OPENAI_API_KEY environment variable is not set.')
    console.error('Usage: OPENAI_API_KEY=sk-... node scripts/generate-audio.mjs')
    process.exit(1)
  }

  const parts = PART ? [PART] : ['L1', 'L2', 'L3', 'L4', 'L5', 'L6']

  // Count total lines to generate
  let totalLines = 0
  let existingLines = 0
  for (const partId of parts) {
    const sets = LISTENING_DATA[partId] || []
    for (const set of sets) {
      if (SET_NUM && set.setNumber !== SET_NUM) continue
      for (let i = 0; i < set.transcript.length; i++) {
        totalLines++
        const outPath = path.join(OUT_DIR, partId, `set-${pad(set.setNumber)}`, `line-${pad(i)}.mp3`)
        if (fs.existsSync(outPath)) existingLines++
      }
    }
  }

  const toGenerate = totalLines - existingLines
  console.log(`\n OpenAI TTS Audio Generator`)
  console.log(` Model:     ${MODEL}`)
  console.log(` Parts:     ${parts.join(', ')}`)
  console.log(` Total lines: ${totalLines}`)
  console.log(` Already done: ${existingLines}`)
  console.log(` To generate: ${toGenerate}`)
  if (DRY_RUN) console.log(` Mode: DRY RUN (no API calls)\n`)
  else         console.log(` Estimated time: ~${Math.round(toGenerate * DELAY_MS / 1000 / 60)} min\n`)

  if (!DRY_RUN && toGenerate === 0) {
    console.log('All files already exist. Nothing to generate.')
    return
  }

  let generated = 0
  let failed    = 0

  for (const partId of parts) {
    const sets = LISTENING_DATA[partId] || []
    console.log(`\n── ${partId} (${sets.length} sets) ──────────────────────`)

    for (const set of sets) {
      if (SET_NUM && set.setNumber !== SET_NUM) continue

      const setDir = path.join(OUT_DIR, partId, `set-${pad(set.setNumber)}`)
      const voiceMap = buildVoiceMap(set.speakers || [])
      console.log(`\n  Set ${set.setNumber}: ${set.title}`)

      for (let i = 0; i < set.transcript.length; i++) {
        const line  = set.transcript[i]
        const voice = getVoice(line.speaker, voiceMap)
        const outPath = path.join(setDir, `line-${pad(i)}.mp3`)

        try {
          await generateTTS(line.text, voice, outPath)
          generated++
        } catch (err) {
          console.error(`  ERROR line ${i}: ${err.message}`)
          failed++
        }

        if (!DRY_RUN) {
          await sleep(DELAY_MS)
        }
      }
    }
  }

  console.log(`\n Done! Generated: ${generated}, Skipped: ${existingLines}, Failed: ${failed}`)
  if (failed > 0) {
    console.log(` Re-run the script to retry failed files.`)
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
