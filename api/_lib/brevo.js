/* global process */
// /api/_lib/brevo.js
// Brevo (formerly Sendinblue) contact sync for lifecycle email automation.
// Uses the Contacts API — adding a contact to a list triggers the matching
// Brevo automation scenario.
//
// Env required:
//   BREVO_API_KEY        — API key from Brevo → Settings → API Keys
//   BREVO_LIST_ID        — ID of your main "CELPIPACE Users" list (signup trigger)
//   BREVO_LIST_PREMIUM   — ID of your "Premium" list (subscribed trigger)
//   BREVO_LIST_CANCELLED — ID of your "Cancelled" list (win-back trigger)
//   EMAIL_FROM           — verified sender, e.g. 'CELPIPACE <hello@celpipace.ca>'
//
// All functions degrade gracefully — missing key never blocks user-facing flow.

const BASE = 'https://api.brevo.com/v3'

function getKey() {
  return process.env.BREVO_API_KEY
}

async function brevoFetch(path, { method = 'GET', body } = {}) {
  const key = getKey()
  if (!key) throw new Error('brevo_not_configured')
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'api-key': key,
      'Content-Type': 'application/json',
      Accept: 'application/json',
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
 * Create or update a contact, optionally adding them to a list.
 * Adding to a list triggers any Brevo automation scenario watching that list.
 *
 * @param {object} args
 * @param {string}   args.email
 * @param {string}   [args.firstName]
 * @param {string}   [args.lastName]
 * @param {boolean}  [args.emailBlacklisted] — true = unsubscribed from marketing
 * @param {number[]} [args.listIds]          — Brevo list IDs to add contact to
 */
export async function upsertBrevoContact({ email, firstName, lastName, emailBlacklisted, listIds }) {
  const key = getKey()
  if (!key || !email) return { ok: false, error: 'brevo_not_configured' }
  try {
    await brevoFetch('/contacts', {
      method: 'POST',
      body: {
        email,
        updateEnabled: true,
        ...(emailBlacklisted !== undefined ? { emailBlacklisted } : {}),
        attributes: {
          ...(firstName ? { FIRSTNAME: firstName } : {}),
          ...(lastName  ? { LASTNAME:  lastName  } : {}),
        },
        ...(listIds?.length ? { listIds } : {}),
      },
    })
    return { ok: true }
  } catch (err) {
    console.warn('[brevo] upsert failed:', err.message)
    return { ok: false, error: err.message }
  }
}

/**
 * Add a contact to a specific Brevo list (triggers list-based automations).
 */
export async function addToBrevoList({ email, listId }) {
  const key = getKey()
  if (!key || !email || !listId) return { ok: false, error: 'brevo_not_configured' }
  try {
    await brevoFetch(`/contacts/lists/${listId}/contacts/add`, {
      method: 'POST',
      body: { emails: [email] },
    })
    return { ok: true }
  } catch (err) {
    // "Contact already in list" is not an error for us
    if (/already/i.test(err.message)) return { ok: true }
    console.warn('[brevo] addToList failed:', err.message)
    return { ok: false, error: err.message }
  }
}

/**
 * Unsubscribe a contact from all marketing emails.
 */
export async function unsubscribeBrevoContact({ email }) {
  const key = getKey()
  if (!key || !email) return { ok: false, error: 'brevo_not_configured' }
  try {
    await brevoFetch('/contacts', {
      method: 'POST',
      body: { email, updateEnabled: true, emailBlacklisted: true },
    })
    return { ok: true }
  } catch (err) {
    console.warn('[brevo] unsubscribe failed:', err.message)
    return { ok: false, error: err.message }
  }
}

/**
 * Send a transactional email via Brevo SMTP API.
 * Replaces Resend — uses the same BREVO_API_KEY already in env.
 *
 * @param {object} args
 * @param {string}   args.toEmail
 * @param {string}   args.toName
 * @param {string}   args.subject
 * @param {string}   args.html
 * @param {string}   [args.text]
 * @returns {Promise<{ ok: boolean, messageId?: string, error?: string }>}
 */
export async function sendBrevoEmail({ toEmail, toName, subject, html, text }) {
  const key = getKey()
  if (!key) {
    console.warn('[brevo] BREVO_API_KEY missing — skipping transactional email to', toEmail)
    return { ok: false, error: 'brevo_not_configured' }
  }

  const fromRaw = process.env.EMAIL_FROM || 'CELPIPACE <hello@celpipace.ca>'
  // Parse "Name <email>" → { name, email }
  const match = fromRaw.match(/^(.+?)\s*<(.+?)>$/)
  const sender = match
    ? { name: match[1].trim(), email: match[2].trim() }
    : { email: fromRaw.trim() }

  try {
    const data = await brevoFetch('/smtp/email', {
      method: 'POST',
      body: {
        sender,
        to: [{ email: toEmail, ...(toName ? { name: toName } : {}) }],
        subject,
        htmlContent: html,
        ...(text ? { textContent: text } : {}),
      },
    })
    return { ok: true, messageId: data?.messageId }
  } catch (err) {
    console.error('[brevo] transactional send failed:', err.message)
    return { ok: false, error: err.message }
  }
}
