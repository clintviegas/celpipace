// /api/marketing-consent.js
// Toggle the signed-in user's marketing-email consent. Source of truth lives
// on profiles.marketing_consent + marketing_consent_at; we mirror to Resend
// Audience so any broadcasts you send later automatically respect the same
// opt-in state.
//
// POST { consent: true | false }
//   200 { consent, syncedToResend }

import { requireUser } from './_lib/auth.js'
import { upsertAudienceContact, unsubscribeAudienceContact } from './_lib/audience.js'
import { upsertLoopsContact } from './_lib/loops.js'

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
    ? { marketing_consent: true,  marketing_consent_at: nowIso, marketing_unsubscribed_at: null }
    : { marketing_consent: false, marketing_unsubscribed_at: nowIso }

  const { error: updateErr } = await auth.supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)
  if (updateErr) {
    console.error('[marketing-consent] update failed:', updateErr.message)
    return res.status(500).json({ error: updateErr.message })
  }

  // Best-effort Resend sync. Failure here doesn't undo the DB consent — we'd
  // rather honour the user's choice locally even if Resend is down.
  let syncedToResend = false
  try {
    if (consent) {
      const result = await upsertAudienceContact({ email, firstName, lastName, unsubscribed: false })
      syncedToResend = !!result.ok
      if (result.ok && result.contactId) {
        await auth.supabase.from('profiles').update({ resend_contact_id: result.contactId }).eq('id', userId)
      }
    } else {
      const result = await unsubscribeAudienceContact({ email })
      syncedToResend = !!result.ok
    }
  } catch (err) {
    console.warn('[marketing-consent] resend sync failed:', err.message)
  }

  // Best-effort Loops sync — keep subscribed flag in lockstep with consent
  upsertLoopsContact({ email, firstName, lastName, subscribed: consent }).catch((err) => {
    console.warn('[marketing-consent] loops sync failed:', err.message)
  })

  return res.status(200).json({ consent, syncedToResend })
}
