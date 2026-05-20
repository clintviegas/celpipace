/* global process */
// /api/on-signup.js
// Called once per new user to:
//   1. Persist first-touch attribution (UTM, referrer, landing page) sent
//      by the client from localStorage.
//   2. Persist signup geolocation (country/city/region) using Vercel's free
//      injected request headers + a SHA-256-hashed IP for dedup/fraud.
//   3. Add the contact to Brevo + send the welcome email.
//
// Idempotency: gated by profiles.loops_synced_at — only fires once per user.
//
// POST /api/on-signup
//   Authorization: Bearer <supabase access_token>
//   Body (optional): { attribution: { utm_source, utm_medium, ... } }

import { createHash } from 'crypto'
import { requireUser } from './_lib/auth.js'
import { upsertBrevoContact } from './_lib/brevo.js'
import { sendEmail, renderSignupWelcome } from './_lib/email.js'

function getBody(req) {
  if (!req.body) return {}
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body) } catch { return {} }
  }
  return req.body
}

function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for']
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim()
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || null
}

function hashIp(ip) {
  if (!ip) return null
  const salt = process.env.IP_HASH_SALT || process.env.UNSUBSCRIBE_SECRET || 'celpipace-default-salt'
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32)
}

function decodeHeader(value) {
  if (!value || typeof value !== 'string') return null
  try { return decodeURIComponent(value) } catch { return value }
}

function trim(s, max = 240) {
  return s ? String(s).replace(/\s+/g, ' ').trim().slice(0, max) || null : null
}

// Whitelist + length-cap attribution fields the client sends.
function sanitizeAttribution(raw) {
  if (!raw || typeof raw !== 'object') return {}
  const out = {}
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'landing_page', 'referrer']
  for (const k of keys) {
    const v = trim(raw[k], k === 'landing_page' || k === 'referrer' ? 500 : 120)
    if (v) out[k] = v
  }
  if (raw.first_touch_at) {
    const d = new Date(raw.first_touch_at)
    if (!Number.isNaN(d.getTime())) out.first_touch_at = d.toISOString()
  }
  return out
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const auth = await requireUser(req)
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

  const userId = auth.user.id
  const body = getBody(req)
  const attribution = sanitizeAttribution(body.attribution)

  const { data: profile, error: profErr } = await auth.supabase
    .from('profiles')
    .select('id, email, full_name, marketing_consent, loops_synced_at, country_code, utm_source')
    .eq('id', userId)
    .maybeSingle()

  if (profErr || !profile) {
    return res.status(500).json({ error: profErr?.message || 'profile_not_found' })
  }

  // Idempotency guard — only the Brevo sync + welcome email are gated.
  // Attribution/geo can still be backfilled the first time we see a real payload.
  const alreadySynced = !!profile.loops_synced_at

  // --- Attribution + geo backfill ---
  // Vercel injects these headers on every prod request (Edge Network).
  const countryCode = decodeHeader(req.headers['x-vercel-ip-country'])
  const region      = decodeHeader(req.headers['x-vercel-ip-country-region'])
  const city        = decodeHeader(req.headers['x-vercel-ip-city'])
  const timezone    = decodeHeader(req.headers['x-vercel-ip-timezone'])
  const userAgent   = trim(req.headers['user-agent'], 500)
  const ipHash      = hashIp(getClientIp(req))

  const enrichment = {}
  // Only set attribution columns if currently empty (first-touch wins forever).
  if (!profile.utm_source) {
    if (attribution.utm_source)   enrichment.utm_source   = attribution.utm_source
    if (attribution.utm_medium)   enrichment.utm_medium   = attribution.utm_medium
    if (attribution.utm_campaign) enrichment.utm_campaign = attribution.utm_campaign
    if (attribution.utm_content)  enrichment.utm_content  = attribution.utm_content
    if (attribution.utm_term)     enrichment.utm_term     = attribution.utm_term
  }
  if (attribution.landing_page)   enrichment.landing_page   = attribution.landing_page
  if (attribution.referrer)       enrichment.referrer       = attribution.referrer
  if (attribution.first_touch_at) enrichment.first_touch_at = attribution.first_touch_at

  // Geo from Vercel headers takes precedence; backfill only when missing.
  if (!profile.country_code) {
    if (countryCode) enrichment.country_code = countryCode
    if (city)        enrichment.city         = city
    if (region)      enrichment.region       = region
    if (timezone)    enrichment.timezone     = timezone
  }
  if (ipHash)    enrichment.signup_ip_hash    = ipHash
  if (userAgent) enrichment.signup_user_agent = userAgent

  if (Object.keys(enrichment).length) {
    await auth.supabase
      .from('profiles')
      .update(enrichment)
      .eq('id', userId)
      .catch((err) => console.warn('[on-signup] enrichment update failed:', err?.message || err))
  }

  if (alreadySynced) {
    return res.status(200).json({ synced: false, enriched: Object.keys(enrichment) })
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

  return res.status(200).json({ synced: true, enriched: Object.keys(enrichment) })
}
