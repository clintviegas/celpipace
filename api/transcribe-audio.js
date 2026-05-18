// /api/transcribe-audio.js
// Vercel → Fly.io proxy for the celpip-audio Go service.
// Forwards the multipart audio upload, attaches the shared-secret header,
// and returns the metrics JSON. Keeps AUDIO_SHARED_SECRET out of the browser.
//
// Required env vars (set in Vercel):
//   AUDIO_SERVICE_URL      e.g. https://celpip-audio.fly.dev
//   AUDIO_SHARED_SECRET    must match the value set on Fly secrets

import { createClient } from '@supabase/supabase-js'

export const config = {
  api: { bodyParser: false }, // we stream the raw multipart body
}

function getBearerToken(req) {
  const header = req.headers.authorization || ''
  const m = String(header).match(/^Bearer\s+(.+)$/i)
  return m?.[1] || ''
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const serviceUrl = process.env.AUDIO_SERVICE_URL
  const secret     = process.env.AUDIO_SHARED_SECRET
  if (!serviceUrl || !secret) {
    return res.status(500).json({ error: 'Audio service not configured' })
  }

  // Require signed-in user. Optional: enforce premium tier here as well.
  const supaUrl    = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabase = createClient(supaUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const token = getBearerToken(req)
  if (!token) return res.status(401).json({ error: 'Missing auth token' })
  const { data: authData, error: authErr } = await supabase.auth.getUser(token)
  if (authErr || !authData?.user) return res.status(401).json({ error: 'Invalid session' })

  // Stream the raw request body straight through to Fly.
  try {
    const upstream = await fetch(`${serviceUrl}/transcribe`, {
      method: 'POST',
      headers: {
        'Content-Type': req.headers['content-type'] || 'multipart/form-data',
        'X-CELPIP-Audio-Key': secret,
      },
      body: req,
      duplex: 'half',
    })
    const text = await upstream.text()
    res.status(upstream.status)
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json')
    return res.send(text)
  } catch (err) {
    console.error('[transcribe-audio] proxy error:', err?.message || err)
    return res.status(502).json({ error: 'Upstream audio service unreachable' })
  }
}
