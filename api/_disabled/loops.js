/* global process */
// /api/_lib/loops.js
// Loops contact + event sync. Loops drives all lifecycle email automation
// (signup drip, upgrade nudges, win-back) — Resend stays for transactional.
//
// Env required:
//   LOOPS_API_KEY  — Loops API key (Dashboard → Settings → API)
//
// All functions degrade gracefully — missing key or Loops outage never blocks
// the user-facing flow.

const LOOPS_BASE = 'https://app.loops.so/api/v1'

function getKey() {
  return process.env.LOOPS_API_KEY
}

async function loopsFetch(path, { method = 'POST', body } = {}) {
  const key = getKey()
  if (!key) throw new Error('loops_not_configured')
  const res = await fetch(`${LOOPS_BASE}${path}`, {
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
 * Create or update a Loops contact. All custom properties (plan, userGroup,
 * userId) are sent as top-level keys alongside the standard ones.
 *
 * @param {object} args
 * @param {string} args.email
 * @param {string} [args.firstName]
 * @param {string} [args.lastName]
 * @param {boolean} [args.subscribed]  — marketing opt-in state
 * @param {string}  [args.userGroup]   — 'free' | 'premium'
 * @param {string}  [args.plan]        — current_plan value
 * @param {string}  [args.userId]      — Supabase user id
 */
export async function upsertLoopsContact({ email, firstName, lastName, subscribed, userGroup, plan, userId }) {
  const key = getKey()
  if (!key || !email) return { ok: false, error: 'loops_not_configured' }

  const body = { email }
  if (firstName !== undefined) body.firstName = firstName || ''
  if (lastName  !== undefined) body.lastName  = lastName  || ''
  if (subscribed !== undefined) body.subscribed = subscribed
  if (userGroup  !== undefined) body.userGroup  = userGroup
  if (plan       !== undefined) body.plan       = plan
  if (userId     !== undefined) body.userId     = userId

  try {
    // Attempt create — Loops returns 200 for both new and existing contacts
    // when using the /create endpoint with updateIfDuplicate flag.
    await loopsFetch('/contacts/create', { method: 'POST', body: { ...body, updateIfDuplicate: true } })
    return { ok: true }
  } catch (err) {
    // Fall back to update if create doesn't support updateIfDuplicate on this plan
    if (/duplicate|already|exists|409/i.test(err.message)) {
      try {
        await loopsFetch('/contacts/update', { method: 'PUT', body })
        return { ok: true }
      } catch (updateErr) {
        console.warn('[loops] contact update failed:', updateErr.message)
        return { ok: false, error: updateErr.message }
      }
    }
    console.warn('[loops] contact upsert failed:', err.message)
    return { ok: false, error: err.message }
  }
}

/**
 * Fire a Loops event to trigger automations.
 *
 * @param {object} args
 * @param {string} args.email
 * @param {string} args.eventName        — name configured in Loops Dashboard
 * @param {string} [args.userId]         — Supabase user id (optional)
 * @param {object} [args.eventProperties] — extra data attached to the event
 */
export async function sendLoopsEvent({ email, eventName, userId, eventProperties } = {}) {
  const key = getKey()
  if (!key || !email || !eventName) return { ok: false, error: 'loops_not_configured' }
  try {
    await loopsFetch('/events/send', {
      method: 'POST',
      body: {
        email,
        eventName,
        ...(userId ? { userId } : {}),
        ...(eventProperties || {}),
      },
    })
    return { ok: true }
  } catch (err) {
    console.warn('[loops] event failed:', eventName, err.message)
    return { ok: false, error: err.message }
  }
}
