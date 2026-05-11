// /api/auth-consent.js
// Records explicit terms acceptance captured before Google OAuth and, when the
// user opted in, subscribes them to marketing emails via Brevo.

import { requireUser } from './_lib/auth.js'
import { upsertBrevoContact, unsubscribeBrevoContact, addToBrevoList } from './_lib/brevo.js'

const DEFAULT_TERMS_VERSION = '2026-05-07'

function clean(value, max = 80) {
  return String(value || '').trim().slice(0, max)
}

function splitName(fullName) {
  const [firstName, ...lastParts] = String(fullName || '').trim().split(/\s+/)
  return { firstName: firstName || '', lastName: lastParts.join(' ') }
}

async function syncBrevoConsent({ email, firstName, lastName, consent }) {
  if (!email) return
  if (consent) {
    const listId = process.env.BREVO_LIST_ID ? Number(process.env.BREVO_LIST_ID) : null
    await upsertBrevoContact({ email, firstName, lastName, emailBlacklisted: false })
    if (listId) await addToBrevoList({ email, listId })
  } else {
    await unsubscribeBrevoContact({ email })
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const auth = await requireUser(req)
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

  if (Object.hasOwn(req.body || {}, 'consent')) {
    const consent = req.body?.consent === true
    const userId = auth.user.id
    const email = auth.user.email
    const { firstName, lastName } = splitName(auth.user.user_metadata?.full_name)
    const nowIso = new Date().toISOString()
    const patch = consent
      ? { marketing_consent: true, marketing_consent_at: nowIso, marketing_unsubscribed_at: null }
      : { marketing_consent: false, marketing_unsubscribed_at: nowIso }

    const { error: updateErr } = await auth.supabase
      .from('profiles')
      .update(patch)
      .eq('id', userId)

    if (updateErr) {
      console.error('[auth-consent] marketing update failed:', updateErr.message)
      return res.status(500).json({ error: updateErr.message })
    }

    syncBrevoConsent({ email, firstName, lastName, consent })
      .catch(err => console.warn('[auth-consent] brevo consent sync failed:', err.message))

    return res.status(200).json({ consent })
  }

  if (req.body?.termsAccepted !== true) {
    return res.status(400).json({ error: 'terms_required', message: 'Terms acceptance is required.' })
  }

  const userId = auth.user.id
  const email = auth.user.email
  const { firstName, lastName } = splitName(auth.user.user_metadata?.full_name)
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

  if (marketingConsent && email) {
    syncBrevoConsent({ email, firstName, lastName, consent: true })
      .catch(err => console.warn('[auth-consent] brevo consent sync failed:', err.message))
  }

  return res.status(200).json({
    termsAcceptedAt: profile?.terms_accepted_at || nowIso,
    termsVersion: profile?.terms_version || termsVersion,
    marketingConsent: !!profile?.marketing_consent,
    marketingConsentAt: profile?.marketing_consent_at || null,
  })
}
