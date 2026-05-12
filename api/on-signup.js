/* global process */
// /api/on-signup.js
// Called once per new user to add them to Brevo and trigger the welcome drip.
// The frontend calls this from AuthContext when it detects a fresh profile
// (created_at within the last 2 minutes). Guarded by profiles.loops_synced_at
// so it only ever fires once per user.
//
// POST (Bearer token required — no body needed)
//   200 { synced: true }   — first sync, Brevo updated
//   200 { synced: false }  — already synced, no-op
//   401                    — missing / invalid session

import { requireUser } from './_lib/auth.js'
import { upsertBrevoContact } from './_lib/brevo.js'
import { sendEmail, renderSignupWelcome } from './_lib/email.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const auth = await requireUser(req)
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

  const userId = auth.user.id

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

  const listId = process.env.BREVO_LIST_ID ? Number(process.env.BREVO_LIST_ID) : null

  // Add to Brevo — triggers the "contact added to list" automation scenario
  await upsertBrevoContact({
    email,
    firstName,
    lastName,
    emailBlacklisted: !subscribed,
    listIds: listId ? [listId] : [],
  })

  // Mark synced so we never fire twice
  await auth.supabase
    .from('profiles')
    .update({ loops_synced_at: new Date().toISOString() })
    .eq('id', userId)
    .catch(() => {})

  const { subject, html } = renderSignupWelcome({ name: firstName })
  try {
    await sendEmail({
      supabase: auth.supabase,
      userId,
      toEmail: email,
      kind: 'signup_welcome',
      subject,
      html,
    })
  } catch (err) {
    console.error('[on-signup] welcome email failed:', err)
  }

  return res.status(200).json({ synced: true })
}
