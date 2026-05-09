/* global process */
// /api/on-signup.js
// Called once per new user to sync them into Loops and fire the 'signup' event.
// The frontend calls this from AuthContext when it detects a fresh profile
// (created_at within the last 2 minutes). We guard idempotency with
// profiles.loops_synced_at — if already set we return 200 and skip.
//
// POST (Bearer token required — no body needed)
//   200 { synced: true }   — first sync, Loops updated
//   200 { synced: false }  — already synced, no-op
//   401                    — missing / invalid session

import { requireUser } from './_lib/auth.js'
import { upsertLoopsContact, sendLoopsEvent } from './_lib/loops.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const auth = await requireUser(req)
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

  const userId = auth.user.id

  // Load full profile to check loops_synced_at and get name/consent
  const { data: profile, error: profErr } = await auth.supabase
    .from('profiles')
    .select('id, email, full_name, marketing_consent, loops_synced_at')
    .eq('id', userId)
    .maybeSingle()

  if (profErr || !profile) {
    return res.status(500).json({ error: profErr?.message || 'profile_not_found' })
  }

  // Idempotency guard
  if (profile.loops_synced_at) {
    return res.status(200).json({ synced: false })
  }

  const email = profile.email || auth.user.email
  if (!email) return res.status(200).json({ synced: false, reason: 'no_email' })

  const fullName = profile.full_name || auth.user.user_metadata?.full_name || ''
  const [firstName, ...lastParts] = String(fullName).trim().split(/\s+/)
  const lastName = lastParts.join(' ')
  const subscribed = !!profile.marketing_consent

  // Best-effort — never fail the response if Loops is down
  await upsertLoopsContact({ email, firstName, lastName, subscribed, userGroup: 'free', plan: 'free', userId })
  await sendLoopsEvent({ email, eventName: 'signup', userId, eventProperties: { plan: 'free' } })

  // Mark synced so we never fire twice
  await auth.supabase
    .from('profiles')
    .update({ loops_synced_at: new Date().toISOString() })
    .eq('id', userId)
    .catch(() => {})

  return res.status(200).json({ synced: true })
}
