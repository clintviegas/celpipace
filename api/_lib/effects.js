// /api/_lib/effects.js
// Per-side-effect idempotency.
//
// WHY EVENT-LEVEL IDEMPOTENCY IS NOT ENOUGH
// -----------------------------------------
// A billing handler does several things: patch the profile, upsert a payment,
// send a welcome email, sync the CRM, log the timeline row. If it dies at step
// 4, an event-level "have I seen evt_123?" guard leaves only two options on
// retry — skip the whole event (losing steps 4-5) or redo it (sending a second
// welcome email). Neither is correct.
//
// So we record each effect individually. `event_effects` has a primary key of
// (event_id, effect); the worker inserts the key BEFORE running the effect, and
// a unique violation means a previous attempt already completed it. Retries
// therefore resume exactly where they stopped.
//
// The insert-then-run ordering is deliberate. The alternative — run, then
// record — would resend on a crash between the two. Recording first means a
// crash in that window loses the effect instead, which for emails and CRM
// syncs is the safer failure: a missing welcome email is recoverable, a
// duplicate charge notification is not. Effects that must not be lost should
// be made retry-safe on their own terms (upserts keyed on a Stripe id) rather
// than relying on this ledger.

/**
 * Run `fn` at most once per (eventId, name), across all retries and workers.
 *
 * @param {object}   supabase  service-role client
 * @param {string}   eventId   e.g. 'evt_1Txt...' — stable across retries
 * @param {string}   name      effect label, e.g. 'email:welcome'
 * @param {Function} fn        the side effect; its return value is stored
 * @returns {Promise<{ skipped: boolean, result?: any }>}
 */
export async function runEffect(supabase, eventId, name, fn) {
  const { data, error } = await supabase
    .from('event_effects')
    .insert({ event_id: eventId, effect: name })
    .select('effect')
    .maybeSingle()

  // 23505 = unique violation: a previous attempt already ran this effect.
  if (error) {
    if (error.code === '23505') return { skipped: true }
    throw new Error(`effect_ledger_write_failed:${name}:${error.message}`)
  }
  if (!data) return { skipped: true }

  const result = await fn()

  // Best-effort enrichment. The claim above is what guarantees exactly-once;
  // failing to attach the result must not cause the effect to run again.
  if (result !== undefined) {
    await supabase
      .from('event_effects')
      .update({ result: sanitize(result) })
      .eq('event_id', eventId)
      .eq('effect', name)
  }

  return { skipped: false, result }
}

/** Keep the ledger small and JSON-safe — it is an audit trail, not a cache. */
function sanitize(value) {
  try {
    const json = JSON.parse(JSON.stringify(value))
    if (json === null || typeof json !== 'object') return { value: json }
    const str = JSON.stringify(json)
    return str.length > 4000 ? { truncated: true, preview: str.slice(0, 4000) } : json
  } catch {
    return { unserializable: true }
  }
}

/** Which effects have already run for this event (for tests and the admin UI). */
export async function listEffects(supabase, eventId) {
  const { data } = await supabase
    .from('event_effects')
    .select('effect, created_at')
    .eq('event_id', eventId)
    .order('created_at')
  return data || []
}
