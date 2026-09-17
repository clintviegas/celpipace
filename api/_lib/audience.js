/* global process */
// /api/_lib/audience.js
// Marketing audience sync backed by Brevo. This thin compatibility layer keeps
// callers independent from provider-specific details while Brevo contacts and
// lists drive lifecycle automations.

import {
  addToBrevoList,
  removeFromBrevoList,
  unsubscribeBrevoContact,
  upsertBrevoContact,
} from './brevo.js'

function mainListId() {
  const raw = process.env.BREVO_LIST_ID
  if (!raw) return null
  const value = Number(raw)
  return Number.isFinite(value) && value > 0 ? value : null
}

/**
 * Add or update a contact in the marketing audience.
 */
export async function upsertAudienceContact({ email, firstName, lastName, unsubscribed = false }) {
  if (!email) return { ok: false, error: 'audience_not_configured' }

  const listId = mainListId()
  const result = await upsertBrevoContact({
    email,
    firstName,
    lastName,
    emailBlacklisted: unsubscribed,
    listIds: !unsubscribed && listId ? [listId] : [],
  })

  return result.ok ? { ok: true, contactId: null } : result
}

/**
 * Mark a contact unsubscribed in Brevo. Idempotent.
 */
export async function unsubscribeAudienceContact({ email }) {
  if (!email) return { ok: false, error: 'audience_not_configured' }

  const unsubscribed = await unsubscribeBrevoContact({ email })
  const listId = mainListId()
  if (listId) await removeFromBrevoList({ email, listId })

  return unsubscribed
}

export async function subscribeAudienceContact({ email, firstName, lastName }) {
  const result = await upsertAudienceContact({ email, firstName, lastName, unsubscribed: false })
  const listId = mainListId()
  if (result.ok && listId) await addToBrevoList({ email, listId })
  return result
}
