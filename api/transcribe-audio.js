/* global process, Buffer */
// /api/transcribe-audio.js
// Whisper transcription with fluency metric extraction.
//
// The CELPIP speaking flow previously used the browser's SpeechRecognition
// (Web Speech API), which works only on Chromium and gives text without any
// timing or confidence signal. For accurate band scoring, we need:
//   - Verbatim transcript (including fillers)
//   - Word-level timestamps (fluency: WPM, pause distribution)
//   - Whisper segment-level avg_logprob (clarity proxy)
//
// Client contract:
//   POST /api/transcribe-audio
//   Authorization: Bearer <supabase_access_token>
//   Body: { audioBase64: string, mimeType: string, durationSec?: number }
//
// Returns:
//   {
//     text: string,
//     metrics: {
//       durationSec, wordCount, wpm,
//       fillerCount, fillerRate, fillerWords: [{word,count}],
//       pauseCount, longPauseCount, avgPauseSec, maxPauseSec,
//       pauseRatio, confidence
//     }
//   }
//
// Audio body is base64-encoded JSON. Avoids needing a multipart parser on
// Vercel's serverless runtime. At ~96kbps a 90-second CELPIP response is
// well under the 4.5MB Vercel body limit even after base64 inflation.

import { requireUser } from './_lib/auth.js'
import { checkRateLimit } from './_lib/rateLimit.js'

const WHISPER_URL = 'https://api.openai.com/v1/audio/transcriptions'
const WHISPER_MODEL = process.env.WHISPER_MODEL || 'whisper-1'
const MAX_AUDIO_BYTES = 8 * 1024 * 1024  // 8 MB decoded — generous, Whisper itself caps at 25 MB

// Common English filler words / hesitation markers. We split on word boundaries.
const FILLERS = ['um', 'uh', 'er', 'erm', 'ah', 'hmm', 'mhm', 'like', 'so', 'well', 'yeah', 'kinda', 'sorta']
const FILLER_PHRASES = ['you know', 'i mean', 'sort of', 'kind of']

const LONG_PAUSE_SEC = 1.0
const PAUSE_THRESHOLD_SEC = 0.4  // ignore micro-pauses below this

function getBody(req) {
  if (!req.body) return {}
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body) } catch { return {} }
  }
  return req.body
}

function extToMime(mime) {
  // Whisper accepts: mp3, mp4, mpeg, mpga, m4a, wav, webm, ogg, flac.
  const m = String(mime || '').toLowerCase()
  if (m.includes('webm')) return { ext: 'webm', clean: 'audio/webm' }
  if (m.includes('mp4') || m.includes('m4a')) return { ext: 'm4a', clean: 'audio/mp4' }
  if (m.includes('ogg')) return { ext: 'ogg', clean: 'audio/ogg' }
  if (m.includes('wav')) return { ext: 'wav', clean: 'audio/wav' }
  if (m.includes('mpeg') || m.includes('mp3')) return { ext: 'mp3', clean: 'audio/mpeg' }
  return { ext: 'webm', clean: 'audio/webm' }
}

function countFillers(words) {
  const lowerWords = words.map(w => String(w.word || '').toLowerCase().replace(/[^a-z']/g, ''))
  const text = lowerWords.join(' ')
  const counts = {}
  let total = 0
  for (const filler of FILLERS) {
    const re = new RegExp(`\\b${filler}\\b`, 'g')
    const matches = text.match(re)
    if (matches) {
      counts[filler] = matches.length
      total += matches.length
    }
  }
  for (const phrase of FILLER_PHRASES) {
    const re = new RegExp(`\\b${phrase}\\b`, 'g')
    const matches = text.match(re)
    if (matches) {
      counts[phrase] = matches.length
      total += matches.length
    }
  }
  const top = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => ({ word, count }))
  return { total, top }
}

function computeMetrics({ text, words, segments, durationSec }) {
  const cleanText = String(text || '').trim()
  const wordCount = cleanText ? cleanText.split(/\s+/).length : 0

  const safeDuration = Number.isFinite(durationSec) && durationSec > 0 ? durationSec : null
  const wpm = safeDuration ? Math.round((wordCount / safeDuration) * 60) : null

  // Filler analysis
  const fillerAnalysis = countFillers(Array.isArray(words) && words.length ? words : cleanText.split(/\s+/).map(w => ({ word: w })))
  const fillerCount = fillerAnalysis.total
  const fillerRate = wordCount ? +(fillerCount / wordCount).toFixed(3) : 0

  // Pause analysis — uses word-level timestamps from Whisper
  let pauseCount = 0
  let longPauseCount = 0
  let totalPauseSec = 0
  let maxPauseSec = 0
  if (Array.isArray(words) && words.length >= 2) {
    for (let i = 1; i < words.length; i++) {
      const prev = words[i - 1]
      const curr = words[i]
      if (typeof prev.end !== 'number' || typeof curr.start !== 'number') continue
      const gap = curr.start - prev.end
      if (gap >= PAUSE_THRESHOLD_SEC) {
        pauseCount += 1
        totalPauseSec += gap
        if (gap > maxPauseSec) maxPauseSec = gap
        if (gap >= LONG_PAUSE_SEC) longPauseCount += 1
      }
    }
  }
  const avgPauseSec = pauseCount ? +(totalPauseSec / pauseCount).toFixed(2) : 0
  const pauseRatio = safeDuration ? +(totalPauseSec / safeDuration).toFixed(2) : 0

  // Confidence — average of segment avg_logprob, mapped to 0-1.
  // Whisper avg_logprob ranges roughly from -1 (poor) to 0 (clear).
  let confidence = null
  if (Array.isArray(segments) && segments.length) {
    const lps = segments
      .map(s => Number(s.avg_logprob))
      .filter(Number.isFinite)
    if (lps.length) {
      const avgLp = lps.reduce((a, b) => a + b, 0) / lps.length
      confidence = Math.max(0, Math.min(1, +(1 + avgLp).toFixed(2)))
    }
  }

  return {
    durationSec: safeDuration,
    wordCount,
    wpm,
    fillerCount,
    fillerRate,
    fillerWords: fillerAnalysis.top,
    pauseCount,
    longPauseCount,
    avgPauseSec,
    maxPauseSec: +maxPauseSec.toFixed(2),
    pauseRatio,
    confidence,
  }
}

export const config = {
  api: {
    bodyParser: { sizeLimit: '12mb' },
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'Transcription service is not configured' })

  const auth = await requireUser(req)
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error })
  const userId = auth.user.id

  const rl = await checkRateLimit({ supabase: auth.supabase, scope: 'transcribe', key: userId, limit: 60, windowSec: 3600 })
  if (!rl.ok) return res.status(429).json({ error: 'too_many_requests', message: rl.message })

  const { audioBase64, mimeType, durationSec } = getBody(req)

  if (!audioBase64 || typeof audioBase64 !== 'string') {
    return res.status(400).json({ error: 'Missing audioBase64' })
  }

  let buffer
  try {
    buffer = Buffer.from(audioBase64, 'base64')
  } catch {
    return res.status(400).json({ error: 'Invalid base64 audio' })
  }
  if (!buffer.length) return res.status(400).json({ error: 'Empty audio' })
  if (buffer.length > MAX_AUDIO_BYTES) {
    return res.status(413).json({ error: 'audio_too_large', message: 'Audio file must be under 8 MB.' })
  }

  const { ext, clean: cleanMime } = extToMime(mimeType)
  const blob = new Blob([buffer], { type: cleanMime })

  // Build the multipart payload Whisper expects.
  const form = new FormData()
  form.append('file', blob, `recording.${ext}`)
  form.append('model', WHISPER_MODEL)
  form.append('language', 'en')
  form.append('response_format', 'verbose_json')
  // gpt-4o-transcribe doesn't support word timestamps yet; whisper-1 does.
  form.append('timestamp_granularities[]', 'word')
  form.append('timestamp_granularities[]', 'segment')

  let data
  try {
    const whisperRes = await fetch(WHISPER_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    })
    if (!whisperRes.ok) {
      const errBody = await whisperRes.text()
      console.error('[transcribe-audio] Whisper error:', whisperRes.status, errBody)
      return res.status(502).json({ error: 'transcription_failed', detail: errBody })
    }
    data = await whisperRes.json()
  } catch (err) {
    console.error('[transcribe-audio] Whisper exception:', err?.message || err)
    return res.status(502).json({ error: 'transcription_failed', detail: err?.message })
  }

  const text = String(data.text || '').trim()
  const words = Array.isArray(data.words) ? data.words : []
  const segments = Array.isArray(data.segments) ? data.segments : []

  // Whisper's own duration is the most reliable; client-provided duration is a fallback.
  const effectiveDuration =
    Number.isFinite(data.duration) && data.duration > 0
      ? data.duration
      : Number(durationSec) || null

  const metrics = computeMetrics({ text, words, segments, durationSec: effectiveDuration })

  return res.status(200).json({ text, metrics })
}
