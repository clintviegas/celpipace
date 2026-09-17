// /api/_lib/rateLimit.js
// Lightweight per-key rate limiter backed by Supabase. Use this for
// public-facing endpoints to throttle repeated invocation.
//
// We deliberately don't add Redis/Upstash for now — Supabase already exists,
// the volumes are small, and one extra round-trip is acceptable on these
// endpoints. Each call inserts a row in public.api_rate_log and counts how
// many rows the same key produced inside the window.
//
// Usage:
//   import { checkRateLimit } from './_lib/rateLimit.js'
//   const ok = await checkRateLimit({ supabase, scope: 'cancel', key: userId, limit: 5, windowSec: 600 })
//   if (!ok.ok) return res.status(429).json({ error: 'too_many_requests', message: ok.message })
//
// scope    — string namespace ('cancel', 'contact', 'checkout', ...)
// key      — user_id, email, or IP — anything that uniquely identifies the actor
// limit    — max calls allowed within the window
// windowSec— window length in seconds

export async function checkRateLimit({ supabase, scope, key, limit, windowSec }) {
  if (!supabase || !scope || !key) return { ok: true } // misconfigured — fail open
  const sinceIso = new Date(Date.now() - windowSec * 1000).toISOString()

  // Insert the current attempt first (idempotent table — see migration phase4_rate_log.sql)
  await supabase.from('api_rate_log').insert({ scope, key }).then(({ error }) => {
    if (error) console.warn('[rateLimit] insert failed (failing open):', error.message)
  })

  // Then count the recent attempts in the window
  const { count, error } = await supabase
    .from('api_rate_log')
    .select('id', { count: 'exact', head: true })
    .eq('scope', scope)
    .eq('key', String(key))
    .gte('created_at', sinceIso)

  if (error) {
    console.warn('[rateLimit] count failed (failing open):', error.message)
    return { ok: true }
  }

  if ((count || 0) > limit) {
    const retrySeconds = windowSec
    return {
      ok: false,
      message: `Too many requests. Try again in ${Math.ceil(retrySeconds / 60)} minute(s).`,
      retrySeconds,
    }
  }
  return { ok: true }
}
