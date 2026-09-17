// First-touch attribution capture.
// Stores UTM params + referrer + landing page in localStorage on first visit,
// then never overwrites. Read by AuthContext at signup → sent to /api/on-signup
// → persisted on profiles row so we always know where each user came from.

const STORAGE_KEY = 'celpipace_attribution_v1'
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
const INTERNAL_HOSTS = new Set(['celpipace.ca', 'www.celpipace.ca', 'localhost', '127.0.0.1'])

function trim(s, max = 240) {
  return String(s || '').replace(/\s+/g, ' ').trim().slice(0, max) || null
}

function getReferrerHost(referrer) {
  if (!referrer) return null
  try { return new URL(referrer).hostname.toLowerCase() } catch { return null }
}

function readStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function writeStored(payload) {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)) } catch { /* quota */ }
}

// Run on every page load. Only writes on first visit (never overwrites first-touch).
// Exception: if a NEW UTM source appears later, we record it as a "last_touch" alongside first.
export function captureAttribution() {
  if (typeof window === 'undefined') return null
  const url = new URL(window.location.href)
  const params = url.searchParams
  const referrer = document.referrer || ''
  const refHost  = getReferrerHost(referrer)
  const isExternalReferrer = refHost && !INTERNAL_HOSTS.has(refHost)

  const incoming = {}
  for (const k of UTM_KEYS) {
    const v = params.get(k)
    if (v) incoming[k] = trim(v, 120)
  }

  const stored = readStored()

  // First touch — write everything we know now.
  if (!stored) {
    const payload = {
      ...incoming,
      landing_page: trim(url.pathname + url.search, 500),
      referrer: isExternalReferrer ? trim(referrer, 500) : null,
      first_touch_at: new Date().toISOString(),
    }
    writeStored(payload)
    return payload
  }

  // Subsequent visit with NEW utm params — record as last touch but keep first.
  if (Object.keys(incoming).length && incoming.utm_source !== stored.utm_source) {
    const updated = {
      ...stored,
      last_utm_source:   incoming.utm_source   || stored.last_utm_source   || null,
      last_utm_medium:   incoming.utm_medium   || stored.last_utm_medium   || null,
      last_utm_campaign: incoming.utm_campaign || stored.last_utm_campaign || null,
      last_touch_at: new Date().toISOString(),
    }
    writeStored(updated)
    return updated
  }

  return stored
}

export function getStoredAttribution() {
  if (typeof window === 'undefined') return null
  return readStored()
}

export function clearAttribution() {
  if (typeof window === 'undefined') return
  try { window.localStorage.removeItem(STORAGE_KEY) } catch { /* noop */ }
}
