/* global process */
// /api/_lib/audience.js
// Resend Audience sync — keeps a hosted contact list in sync with our
// `profiles.marketing_consent` flag. We use Resend's Contacts API (not its
// Broadcasts UI yet — that's layered on later) so:
//   • unsubscribe links Resend renders auto-flip the contact's status
//   • broadcasts you compose later automatically respect those unsubscribes
//
// Env required:
//   RESEND_API_KEY          — secret API key
//   RESEND_AUDIENCE_ID      — uuid of the Audience created in Resend dashboard
//
// All functions degrade gracefully — if Resend is down or env vars are missing,
// they log a warning and return. We never let audience-sync errors block the
// user-facing flow (consent toggle, signup, etc).

const BASE = 'https://api.resend.com'

function getEnv() {
  const key = process.env.RESEND_API_KEY
  const audienceId = process.env.RESEND_AUDIENCE_ID
  return { key, audienceId }
}

async function resendFetch(path, { method = 'GET', body } = {}) {
  const { key } = getEnv()
  if (!key) throw new Error('resend_not_configured')
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let json = null
  try { json = text ? JSON.parse(text) : null } catch { /* leave null */ }
  if (!res.ok) {
    const msg = json?.message || json?.error || text || `HTTP ${res.status}`
    throw new Error(msg)
  }
  return json
}

/**
 * Add or update a contact in the Resend Audience. Returns the Resend contact
 * id so we can store it on the profile for future updates / removals.
 */
export async function upsertAudienceContact({ email, firstName, lastName, unsubscribed = false }) {
  const { key, audienceId } = getEnv()
  if (!key || !audienceId || !email) return { ok: false, error: 'audience_not_configured' }
  try {
    const created = await resendFetch(`/audiences/${audienceId}/contacts`, {
      method: 'POST',
      body: {
        email,
        first_name: firstName || undefined,
        last_name:  lastName  || undefined,
        unsubscribed,
      },
    })
    return { ok: true, contactId: created?.id || null }
  } catch (err) {
    // Resend returns 409 on duplicate — fall through to PATCH by email
    if (/already exists|409/i.test(err.message)) {
      try {
        await resendFetch(`/audiences/${audienceId}/contacts/${encodeURIComponent(email)}`, {
          method: 'PATCH',
          body: {
            first_name: firstName || undefined,
            last_name:  lastName  || undefined,
            unsubscribed,
          },
        })
        return { ok: true, contactId: null }
      } catch (patchErr) {
        console.warn('[audience] patch failed:', patchErr.message)
        return { ok: false, error: patchErr.message }
      }
    }
    console.warn('[audience] upsert failed:', err.message)
    return { ok: false, error: err.message }
  }
}

/**
 * Mark a contact unsubscribed in Resend. Idempotent.
 */
export async function unsubscribeAudienceContact({ email }) {
  const { key, audienceId } = getEnv()
  if (!key || !audienceId || !email) return { ok: false, error: 'audience_not_configured' }
  try {
    await resendFetch(`/audiences/${audienceId}/contacts/${encodeURIComponent(email)}`, {
      method: 'PATCH',
      body: { unsubscribed: true },
    })
    return { ok: true }
  } catch (err) {
    console.warn('[audience] unsubscribe failed:', err.message)
    return { ok: false, error: err.message }
  }
}
