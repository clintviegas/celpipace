// /api/_lib/db.js
// Safe execution wrapper for Supabase PostgREST query builders.
//
// WHY THIS EXISTS
// ---------------
// A PostgREST query builder is a *thenable*, not a Promise. It implements
// `then()` so `await` works, but it has no `catch()`:
//
//   const b = supabase.from('t').update({...}).eq('id', 1)
//   typeof b.then   // 'function'
//   typeof b.catch  // 'undefined'   ← !
//
// So the natural-looking `await supabase.from(...).update(...).eq(...).catch(() => {})`
// does not swallow errors — it throws `TypeError: ... .catch is not a function`
// on the spot, before the query is ever sent. That pattern shipped to production
// in 19 places and silently killed the Stripe checkout handler and every
// lifecycle-email job at their first write-back.
//
// Use this instead. It never throws, so it is safe for best-effort writes where
// the caller genuinely does not want a failure to abort the surrounding flow:
//
//   await tryDb(
//     supabase.from('checkout_intents').update({ converted_at: now }).eq('id', id),
//     'checkout_intents.converted'
//   )
//
// For writes that MUST succeed, don't use this — await the builder directly and
// handle `error` so the failure propagates to the caller's retry logic.
//
// scripts/check-db-catch.mjs enforces that the bad pattern never comes back.

/**
 * Await a PostgREST builder without ever throwing.
 *
 * @param {PromiseLike<{ data: any, error: any }>} builder - a Supabase query builder
 * @param {string} label - short identifier for logs, e.g. 'marketing_sends.log_id'
 * @returns {Promise<{ data: any, error: any }>} always resolves
 */
export async function tryDb(builder, label) {
  try {
    const { data, error } = await builder
    if (error) console.error(`[db] ${label} failed:`, error.message)
    return { data: data ?? null, error: error ?? null }
  } catch (err) {
    // Network blip, malformed builder, or a thrown PostgREST client error.
    console.error(`[db] ${label} threw:`, err?.message || String(err))
    return { data: null, error: err }
  }
}
