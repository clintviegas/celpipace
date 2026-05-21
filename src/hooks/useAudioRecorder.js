// /src/hooks/useAudioRecorder.js
// Captures microphone audio with MediaRecorder, then uploads the recording
// to /api/transcribe-audio for Whisper transcription + fluency metric
// extraction. This replaces the browser SpeechRecognition path for any flow
// that needs accurate transcripts and per-word timing data.
//
// Returns a small surface area:
//   { state, error, start, stop, reset, lastResult, supported }
//
//   state       — 'idle' | 'recording' | 'transcribing' | 'done' | 'error'
//   error       — human-readable string if state === 'error'
//   start()     — begins recording (will prompt for mic permission if needed)
//   stop()      — stops recording and triggers transcription
//   reset()     — clears lastResult/error/state back to 'idle'
//   lastResult  — { text, metrics, blob, durationSec } once 'done'
//   supported   — true if MediaRecorder + getUserMedia are usable in this browser

import { useCallback, useEffect, useRef, useState } from 'react'
import { authedFetch } from '../lib/apiClient'

const TRANSCRIBE_PATH = '/api/transcribe-audio'

function pickMimeType() {
  if (typeof MediaRecorder === 'undefined') return null
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4;codecs=mp4a',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ]
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(c)) return c
  }
  return ''  // browser default
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result || ''
      const comma = result.indexOf(',')
      resolve(comma >= 0 ? result.slice(comma + 1) : result)
    }
    reader.onerror = () => reject(reader.error || new Error('read_failed'))
    reader.readAsDataURL(blob)
  })
}

export function useAudioRecorder() {
  const [state, setState] = useState('idle')   // idle | recording | transcribing | done | error
  const [error, setError] = useState(null)
  const [lastResult, setLastResult] = useState(null)

  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])
  const startedAtRef = useRef(0)
  const mimeRef = useRef('')

  const supported = typeof window !== 'undefined'
    && typeof navigator !== 'undefined'
    && !!navigator.mediaDevices?.getUserMedia
    && typeof MediaRecorder !== 'undefined'

  const cleanupStream = () => {
    try { streamRef.current?.getTracks().forEach(t => t.stop()) } catch { /* noop */ }
    streamRef.current = null
  }

  const reset = useCallback(() => {
    cleanupStream()
    mediaRecorderRef.current = null
    chunksRef.current = []
    startedAtRef.current = 0
    setError(null)
    setLastResult(null)
    setState('idle')
  }, [])

  // Stop tracks if the component unmounts mid-recording.
  useEffect(() => {
    return () => {
      try { mediaRecorderRef.current?.stop() } catch { /* noop */ }
      cleanupStream()
    }
  }, [])

  const start = useCallback(async () => {
    if (!supported) {
      setError('Your browser does not support audio recording. Please use a recent version of Chrome, Edge, or Safari.')
      setState('error')
      return false
    }
    setError(null)
    setLastResult(null)
    chunksRef.current = []
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mimeType = pickMimeType()
      mimeRef.current = mimeType || 'audio/webm'
      const rec = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)
      rec.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data) }
      rec.onerror = (e) => {
        console.error('[useAudioRecorder] recorder error:', e?.error || e)
        setError('Recording error. Please try again.')
        setState('error')
        cleanupStream()
      }
      mediaRecorderRef.current = rec
      startedAtRef.current = Date.now()
      rec.start(1000)  // emit chunks every 1s for smoother stopping
      setState('recording')
      return true
    } catch (err) {
      const msg = err?.name === 'NotAllowedError'
        ? 'Microphone permission was denied. Allow mic access in your browser settings and try again.'
        : 'Could not start the microphone. Please check your device.'
      setError(msg)
      setState('error')
      cleanupStream()
      return false
    }
  }, [supported])

  // Stop the recorder, upload the audio, return transcript + metrics.
  const stop = useCallback(async () => {
    const rec = mediaRecorderRef.current
    if (!rec) return null
    if (rec.state === 'inactive') return null

    const durationSec = (Date.now() - startedAtRef.current) / 1000

    const finalBlob = await new Promise((resolve) => {
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeRef.current || 'audio/webm' })
        resolve(blob)
      }
      try { rec.stop() } catch { resolve(new Blob(chunksRef.current, { type: mimeRef.current || 'audio/webm' })) }
    })
    cleanupStream()

    if (!finalBlob || finalBlob.size === 0) {
      setError('No audio was captured. Please try again.')
      setState('error')
      return null
    }

    setState('transcribing')

    try {
      const audioBase64 = await blobToBase64(finalBlob)
      const res = await authedFetch(TRANSCRIBE_PATH, {
        body: {
          audioBase64,
          mimeType: finalBlob.type || mimeRef.current,
          durationSec,
        },
      })
      if (res.status === 401) throw new Error('Please sign in to use AI transcription.')
      if (res.status === 413) throw new Error('The recording is too long. Please record a shorter response.')
      if (res.status === 429) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.message || 'Too many transcription requests — try again later.')
      }
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || 'Transcription failed')
      }
      const data = await res.json()
      const result = {
        text: data.text || '',
        metrics: data.metrics || null,
        blob: finalBlob,
        durationSec,
      }
      setLastResult(result)
      setState('done')
      return result
    } catch (err) {
      console.error('[useAudioRecorder] transcribe error:', err)
      setError(err?.message || 'Could not transcribe the recording.')
      setState('error')
      return null
    }
  }, [])

  return { state, error, start, stop, reset, lastResult, supported }
}
