/* global process */
// /api/_lib/mailchimp.js
// Mailchimp Marketing API v3 helper.
// Handles contact upsert and tag management for lifecycle automations.
//
// Env required:
//   MAILCHIMP_API_KEY     — format: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-us21
//   MAILCHIMP_AUDIENCE_ID — Audience ID from Mailchimp → Audience → Settings → Audience name and defaults
//
// All functions degrade gracefully — missing key never blocks user-facing flow.

import crypto from 'crypto'

function getEnv() {
  const apiKey = process.env.MAILCHIMP_API_KEY || ''
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID || ''
  // Datacenter is the suffix after the last dash: e.g. "us21"
  const dc = apiKey.split('-').pop() || 'us1'
  const base = `https://${dc}.api.mailchimp.com/3.0`
  return { apiKey, audienceId, base }
}

function subscriberHash(email) {
  return crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex')
}

async function mcFetch(path, { method = 'GET', body } = {}) {
  const { apiKey, base } = getEnv()
  if (!apiKey) throw new Error('mailchimp_not_configured')
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let json = null
  try { json = text ? JSON.parse(text) : null } catch { /* leave null */ }
  // 404 on PATCH/PUT just means contact doesn't exist yet — handled by caller
  if (!res.ok && res.status !== 404) {
    const msg = json?.detail || json?.title || text || `HTTP ${res.status}`
    throw new Error(msg)
  }
  return { status: res.status, json }
}

/**
 * Add or update a contact in the Mailchimp audience.
 * Sets SUBSCRIBED status only if subscribed=true (marketing consent given).
 * Otherwise sets status to TRANSACTIONAL so we can still tag them.
 */
export async function upsertMailchimpContact({ email, firstName, lastName, subscribed, tags }) {
  const { apiKey, audienceId } = getEnv()
  if (!apiKey || !audienceId || !email) return { ok: false, error: 'mailchimp_not_configured' }

  try {
    const hash = subscriberHash(email)
    await mcFetch(`/lists/${audienceId}/members/${hash}`, {
      method: 'PUT',
      body: {
        email_address: email,
        status_if_new: subscribed ? 'subscribed' : 'transactional',
        status: subscribed ? 'subscribed' : 'transactional',
        merge_fields: {
          ...(firstName ? { FNAME: firstName } : {}),
          ...(lastName  ? { LNAME: lastName  } : {}),
        },
        ...(tags ? { tags: tags.map(t => ({ name: t, status: 'active' })) } : {}),
      },
    })
    return { ok: true }
  } catch (err) {
    console.warn('[mailchimp] upsert failed:', err.message)
    return { ok: false, error: err.message }
  }
}

/**
 * Add or remove tags on a contact. Used to trigger tag-based automations.
 * @param {string} email
 * @param {string[]} addTags    — tags to activate
 * @param {string[]} removeTags — tags to deactivate
 */
export async function updateMailchimpTags({ email, addTags = [], removeTags = [] }) {
  const { apiKey, audienceId } = getEnv()
  if (!apiKey || !audienceId || !email) return { ok: false, error: 'mailchimp_not_configured' }

  try {
    const hash = subscriberHash(email)
    const tags = [
      ...addTags.map(name => ({ name, status: 'active' })),
      ...removeTags.map(name => ({ name, status: 'inactive' })),
    ]
    if (!tags.length) return { ok: true }
    await mcFetch(`/lists/${audienceId}/members/${hash}/tags`, {
      method: 'POST',
      body: { tags },
    })
    return { ok: true }
  } catch (err) {
    console.warn('[mailchimp] tag update failed:', err.message)
    return { ok: false, error: err.message }
  }
}

/**
 * Unsubscribe a contact from marketing (keeps them in the audience as transactional).
 */
export async function unsubscribeMailchimpContact({ email }) {
  const { apiKey, audienceId } = getEnv()
  if (!apiKey || !audienceId || !email) return { ok: false, error: 'mailchimp_not_configured' }

  try {
    const hash = subscriberHash(email)
    await mcFetch(`/lists/${audienceId}/members/${hash}`, {
      method: 'PATCH',
      body: { status: 'unsubscribed' },
    })
    return { ok: true }
  } catch (err) {
    console.warn('[mailchimp] unsubscribe failed:', err.message)
    return { ok: false, error: err.message }
  }
}
