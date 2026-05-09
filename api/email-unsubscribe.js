/* global process */
// /api/email-unsubscribe.js
// One-click unsubscribe handler for marketing emails. Linked from every drip
// and broadcast email via a signed HMAC token (see buildUnsubscribeToken in
// _lib/email.js). No login required — the token IS the auth.
//
// GET /api/email-unsubscribe?token=<signed>
//   200 HTML — confirms unsubscribe, no JSON for end users.

import { createClient } from '@supabase/supabase-js'
import { verifyUnsubscribeToken } from './_lib/email.js'
import { unsubscribeAudienceContact } from './_lib/audience.js'

function htmlPage({ title, body }) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${title}</title>
<meta name="robots" content="noindex">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Arial,sans-serif;background:#f7f8fa;color:#0f172a;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}
.card{max-width:480px;background:#fff;border-radius:18px;padding:36px;box-shadow:0 4px 24px rgba(15,23,42,0.06)}
h1{margin:0 0 12px;font-size:22px}
p{margin:8px 0;line-height:1.55;color:#334155;font-size:15px}
a{color:#0ea5e9}
.kicker{font-size:12px;letter-spacing:.16em;color:#94a3b8;margin-bottom:8px}</style>
</head><body><div class="card"><div class="kicker">CELPIPACE</div>${body}</div></body></html>`
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).send('Method not allowed')

  const token = String(req.query?.token || '')
  const verified = verifyUnsubscribeToken(token)
  if (!verified) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.status(400).send(htmlPage({
      title: 'Invalid unsubscribe link',
      body: `<h1>Link expired or invalid</h1>
        <p>This unsubscribe link couldn't be verified. You can manage your email preferences from your account.</p>
        <p><a href="${(process.env.PUBLIC_SITE_URL || '/').replace(/\/$/, '')}/subscription">Open email preferences</a></p>`,
    }))
  }

  const supaUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const svcKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supaUrl || !svcKey) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.status(500).send(htmlPage({
      title: 'Unsubscribe error',
      body: `<h1>Something went wrong</h1><p>Please try again or email <a href="mailto:hello@celpipace.ca">hello@celpipace.ca</a> and we'll remove you manually.</p>`,
    }))
  }

  const supabase = createClient(supaUrl, svcKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const nowIso = new Date().toISOString()
  const { data: profile, error: updErr } = await supabase
    .from('profiles')
    .update({
      marketing_consent: false,
      marketing_unsubscribed_at: nowIso,
    })
    .eq('id', verified.userId)
    .select('email')
    .single()

  if (updErr) {
    console.error('[email-unsubscribe] update failed:', updErr.message)
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.status(500).send(htmlPage({
      title: 'Unsubscribe error',
      body: `<h1>Something went wrong</h1><p>Please email <a href="mailto:hello@celpipace.ca">hello@celpipace.ca</a> and we'll remove you manually.</p>`,
    }))
  }

  if (profile?.email) {
    await unsubscribeAudienceContact({ email: profile.email }).catch(() => {})
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  return res.status(200).send(htmlPage({
    title: 'Unsubscribed',
    body: `<h1>You're unsubscribed</h1>
      <p>We've stopped sending marketing emails to your account. Transactional messages (receipts, password resets, account notifications) will still be delivered as needed.</p>
      <p><a href="${(process.env.PUBLIC_SITE_URL || '/').replace(/\/$/, '')}/subscription">Manage email preferences</a></p>`,
  }))
}
