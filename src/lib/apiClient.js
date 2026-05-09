// /src/lib/apiClient.js
// Authed fetch wrapper for our /api/* routes.
// Attaches the current Supabase access token as a Bearer header so the server
// can identify the user instead of trusting `userId` from the body.

import { supabase } from './supabase'

export async function authedFetch(path, { method = 'POST', body, headers = {} } = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  return fetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

// Variant that allows guests (no token attached if not signed in). Used by the
// public chat widget where guests are expected.
export async function maybeAuthedFetch(path, opts = {}) {
  return authedFetch(path, opts)
}
