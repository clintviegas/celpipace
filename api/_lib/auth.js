/* global process */
// /api/_lib/auth.js
// Bearer-token auth for serverless API routes.
//
// Usage:
//   import { requireUser } from './_lib/auth.js'
//   const auth = await requireUser(req)
//   if (!auth.ok) return res.status(auth.status).json({ error: auth.error })
//   const userId = auth.user.id
//
// Returns { ok, user, supabase } on success, or { ok:false, status, error } on failure.
// The returned `supabase` client is the service-role client (so callers can use
// it for rate-limit logging or DB writes that bypass RLS); never return it to
// the browser.

import { createClient } from '@supabase/supabase-js'

let _client = null
function getServiceClient() {
  if (_client) return _client
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase service-role env vars missing')
  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return _client
}

function getBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization || ''
  const match = String(header).match(/^Bearer\s+(.+)$/i)
  return match?.[1] || ''
}

export async function requireUser(req) {
  let supabase
  try {
    supabase = getServiceClient()
  } catch {
    return { ok: false, status: 500, error: 'Server not configured' }
  }
  const token = getBearerToken(req)
  if (!token) return { ok: false, status: 401, error: 'Missing authorization' }
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user) return { ok: false, status: 401, error: 'Invalid session' }
  return { ok: true, user: data.user, supabase }
}

export function getClientIp(req) {
  const fwd = (req.headers['x-forwarded-for'] || '').toString().split(',')[0]?.trim()
  return fwd || req.socket?.remoteAddress || 'unknown'
}

export function getServiceSupabase() {
  return getServiceClient()
}
