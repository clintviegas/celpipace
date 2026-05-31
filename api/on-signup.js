/* global process */
// /api/on-signup.js
// Called once per new user to:
//   1. Persist first-touch attribution (UTM, referrer, landing page) sent
//      by the client from localStorage.
//   2. Persist signup geolocation (country/city/region) from Vercel headers,
//      with an IP geo fallback + a SHA-256-hashed IP for dedup/fraud.
//   3. Add the contact to Brevo + send the welcome email.
//
// Idempotency: gated by profiles.loops_synced_at — only fires once per user.
//
// POST /api/on-signup
//   Authorization: Bearer <supabase access_token>
//   Body (optional): { attribution: { utm_source, utm_medium, ... } }

import { createHash } from 'crypto'
import { requireUser } from './_lib/auth.js'
import { upsertBrevoContact, unsubscribeBrevoContact, addToBrevoList } from './_lib/brevo.js'
import { sendEmail, renderSignupWelcome } from './_lib/email.js'

const DEFAULT_TERMS_VERSION = '2026-05-07'

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

function isPublicIp(ip) {
  if (!ip || typeof ip !== 'string') return false
  const value = ip.trim()
  if (!value || value === '::1' || value === '127.0.0.1') return false
  if (/^(10|127)\./.test(value)) return false
  if (/^192\.168\./.test(value)) return false
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(value)) return false
  return !value.startsWith('fc') && !value.startsWith('fd') && !value.startsWith('fe80:')
}

async function lookupGeoByIp(ip) {
  if (!isPublicIp(ip)) return null
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 2500)
  try {
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, { signal: controller.signal })
    if (!res.ok) return null
    const data = await res.json()
    return {
      countryCode: trim(data.country_code, 2),
      country: trim(data.country_name, 120),
      region: trim(data.region, 120),
      city: trim(data.city, 120),
      timezone: trim(data.timezone, 120),
    }
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
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

  const body = getBody(req)
  const userId = auth.user.id
  const email = auth.user.email
  const { firstName, lastName } = splitName(auth.user.user_metadata?.full_name)

  if (Object.hasOwn(body || {}, 'consent')) {
    const consent = body?.consent === true
    const nowIso = new Date().toISOString()
    const patch = consent
      ? { marketing_consent: true, marketing_consent_at: nowIso, marketing_unsubscribed_at: null }
      : { marketing_consent: false, marketing_unsubscribed_at: nowIso }

    const { error: updateErr } = await auth.supabase
      .from('profiles')
      .update(patch)
      .eq('id', userId)

    if (updateErr) {
      console.error('[on-signup] marketing consent update failed:', updateErr.message)
      return res.status(500).json({ error: updateErr.message })
    }

    syncBrevoConsent({ email, firstName, lastName, consent })
      .catch(err => console.warn('[on-signup] brevo consent sync failed:', err.message))

    return res.status(200).json({ consent })
  }

  if (body?.termsAccepted === true) {
    const termsVersion = clean(body?.termsVersion || DEFAULT_TERMS_VERSION)
    const marketingConsent = body?.marketingConsent === true
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
      console.error('[on-signup] profile consent update failed:', updateErr.message)
      return res.status(500).json({ error: updateErr.message })
    }

    if (marketingConsent && email) {
      syncBrevoConsent({ email, firstName, lastName, consent: true })
        .catch(err => console.warn('[on-signup] brevo consent sync failed:', err.message))
    }

    return res.status(200).json({
      termsAcceptedAt: profile?.terms_accepted_at || nowIso,
      termsVersion: profile?.terms_version || termsVersion,
      marketingConsent: !!profile?.marketing_consent,
      marketingConsentAt: profile?.marketing_consent_at || null,
    })
  }

  // Set / clear the learner's exam date (drives the countdown sequence).
  // Body: { examDate: 'YYYY-MM-DD' | null }
  if (Object.hasOwn(body || {}, 'examDate')) {
    let examDate = null
    if (body.examDate) {
      const d = new Date(body.examDate)
      if (Number.isNaN(d.getTime())) return res.status(400).json({ error: 'invalid_exam_date' })
      examDate = d.toISOString().slice(0, 10)
      // Guard against obviously-wrong dates: today .. +18 months.
      const today = new Date().toISOString().slice(0, 10)
      const maxDate = new Date(Date.now() + 18 * 30 * 86400_000).toISOString().slice(0, 10)
      if (examDate < today || examDate > maxDate) {
        return res.status(400).json({ error: 'exam_date_out_of_range' })
      }
    }
    const { error: examErr } = await auth.supabase
      .from('profiles')
      .update({ exam_date: examDate })
      .eq('id', userId)
    if (examErr) {
      console.error('[on-signup] exam date update failed:', examErr.message)
      return res.status(500).json({ error: examErr.message })
    }
    return res.status(200).json({ examDate })
  }

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
  const clientIp    = getClientIp(req)
  const headerGeo = {
    countryCode: decodeHeader(req.headers['x-vercel-ip-country']),
    region:      decodeHeader(req.headers['x-vercel-ip-country-region']),
    city:        decodeHeader(req.headers['x-vercel-ip-city']),
    timezone:    decodeHeader(req.headers['x-vercel-ip-timezone']),
  }
  const fallbackGeo = headerGeo.countryCode ? null : await lookupGeoByIp(clientIp)
  const geo = fallbackGeo ? { ...headerGeo, ...fallbackGeo } : headerGeo
  const userAgent   = trim(req.headers['user-agent'], 500)
  const ipHash      = hashIp(clientIp)

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
    if (geo.countryCode) enrichment.country_code = geo.countryCode
    if (geo.country)     enrichment.country      = geo.country
    if (geo.city)        enrichment.city         = geo.city
    if (geo.region)      enrichment.region       = geo.region
    if (geo.timezone)    enrichment.timezone     = geo.timezone
  }
  if (ipHash)    enrichment.signup_ip_hash    = ipHash
  if (userAgent) enrichment.signup_user_agent = userAgent

  let enrichmentError = null
  if (Object.keys(enrichment).length) {
    const { error: updateErr } = await auth.supabase
      .from('profiles')
      .update(enrichment)
      .eq('id', userId)
    if (updateErr) {
      enrichmentError = updateErr.message
      console.warn('[on-signup] enrichment update failed:', updateErr.message)
    }
  }

  if (alreadySynced) {
    if (enrichmentError) return res.status(500).json({ error: enrichmentError, enriched: Object.keys(enrichment) })
    return res.status(200).json({ synced: false, enriched: Object.keys(enrichment) })
  }

  const profileEmail = profile.email || auth.user.email
  if (!profileEmail) return res.status(200).json({ synced: false, reason: 'no_email' })

  const fullName = profile.full_name || auth.user.user_metadata?.full_name || ''
  const signupName = splitName(fullName)
  const subscribed = !!profile.marketing_consent

  const listId     = process.env.BREVO_LIST_ID   ? Number(process.env.BREVO_LIST_ID)   : null
  const freeListId = process.env.BREVO_LIST_FREE ? Number(process.env.BREVO_LIST_FREE) : null

  // Add to Brevo — triggers the "contact added to list" automation scenario
  await upsertBrevoContact({
    email: profileEmail,
    firstName: signupName.firstName,
    lastName: signupName.lastName,
    emailBlacklisted: !subscribed,
    listIds: [listId, freeListId].filter(Boolean),
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
      toEmail: profileEmail,
      kind: 'signup_welcome',
      subject,
      html,
    })
  } catch (err) {
    console.error('[on-signup] welcome email failed:', err)
  }

  return res.status(enrichmentError ? 207 : 200).json({
    synced: true,
    enriched: Object.keys(enrichment),
    ...(enrichmentError ? { enrichmentError } : {}),
  })
}
