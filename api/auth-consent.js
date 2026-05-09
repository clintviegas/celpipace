// /api/auth-consent.js
// Records explicit terms acceptance captured before Google OAuth and, when the
// user opted in, subscribes them to marketing emails.

import { requireUser } from './_lib/auth.js'
import { upsertAudienceContact } from './_lib/audience.js'
import { upsertLoopsContact } from './_lib/loops.js'

const DEFAULT_TERMS_VERSION = '2026-05-07'

function clean(value, max = 80) {
  return String(value || '').trim().slice(0, max)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const auth = await requireUser(req)
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

  if (req.body?.termsAccepted !== true) {
    return res.status(400).json({ error: 'terms_required', message: 'Terms acceptance is required.' })
  }

  const userId = auth.user.id
  const email = auth.user.email
  const fullName = auth.user.user_metadata?.full_name || ''
  const [firstName, ...lastParts] = String(fullName).trim().split(/\s+/)
  const lastName = lastParts.join(' ')
  const termsVersion = clean(req.body?.termsVersion || DEFAULT_TERMS_VERSION)
  const marketingConsent = req.body?.marketingConsent === true
  const nowIso = new Date().toISOString()

  const patch = {
    terms_accepted_at: nowIso,
    terms_version: termsVersion,
  }

  if (marketingConsent) {
    patch.marketing_consent = true
    patch.marketing_consent_at = nowIso
    patch.marketing_unsubscribed_at = null
  }

  const { data: profile, error: updateErr } = await auth.supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select('terms_accepted_at, terms_version, marketing_consent, marketing_consent_at')
    .maybeSingle()

  if (updateErr) {
    console.error('[auth-consent] profile update failed:', updateErr.message)
    return res.status(500).json({ error: updateErr.message })
  }

  let syncedToResend = false
  if (marketingConsent && email) {
    try {
      const result = await upsertAudienceContact({ email, firstName, lastName, unsubscribed: false })
      syncedToResend = !!result.ok
      if (result.ok && result.contactId) {
        await auth.supabase.from('profiles').update({ resend_contact_id: result.contactId }).eq('id', userId)
      }
    } catch (err) {
      console.warn('[auth-consent] resend sync failed:', err.message)
    }

    upsertLoopsContact({ email, firstName, lastName, subscribed: true }).catch((err) => {
      console.warn('[auth-consent] loops sync failed:', err.message)
    })
  }

  return res.status(200).json({
    termsAcceptedAt: profile?.terms_accepted_at || nowIso,
    termsVersion: profile?.terms_version || termsVersion,
    marketingConsent: !!profile?.marketing_consent,
    marketingConsentAt: profile?.marketing_consent_at || null,
    syncedToResend,
  })
}