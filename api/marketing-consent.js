// /api/marketing-consent.js
// Toggle the signed-in user's marketing-email consent. Source of truth lives
// on profiles.marketing_consent + marketing_consent_at; mirrored to Brevo so
// unsubscribes are respected in all automation scenarios.
//
// POST { consent: true | false }
//   200 { consent }

import { requireUser } from './_lib/auth.js'
import { upsertBrevoContact, unsubscribeBrevoContact, addToBrevoList } from './_lib/brevo.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const auth = await requireUser(req)
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

  const consent = req.body?.consent === true
  const userId = auth.user.id
  const email = auth.user.email
  const fullName = auth.user.user_metadata?.full_name || ''
  const [firstName, ...lastParts] = String(fullName).trim().split(/\s+/)
  const lastName = lastParts.join(' ')

  const nowIso = new Date().toISOString()
  const patch = consent
    ? { marketing_consent: true, marketing_consent_at: nowIso, marketing_unsubscribed_at: null }
    : { marketing_consent: false, marketing_unsubscribed_at: nowIso }

  const { error: updateErr } = await auth.supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)
  if (updateErr) {
    console.error('[marketing-consent] update failed:', updateErr.message)
    return res.status(500).json({ error: updateErr.message })
  }

  // Sync consent state to Brevo — adding to the main list triggers welcome drip
  try {
    if (consent) {
      const listId = process.env.BREVO_LIST_ID ? Number(process.env.BREVO_LIST_ID) : null
      await upsertBrevoContact({ email, firstName, lastName, emailBlacklisted: false })
      if (listId) await addToBrevoList({ email, listId })
    } else {
      await unsubscribeBrevoContact({ email })
    }
  } catch (err) {
    console.warn('[marketing-consent] brevo sync failed:', err.message)
  }

  return res.status(200).json({ consent })
}
