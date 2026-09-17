// /api/_lib/inbox.js
// Claim / settle helpers for the webhook_events inbox.
//
// The old handler read `processed` at the top of the request and wrote it ~400
// lines later, with no lock in between — two concurrent deliveries of the same
// event both passed the check. Claiming is now a single atomic UPDATE
// (claim_webhook_events, FOR UPDATE SKIP LOCKED) so a row can only ever be held
// by one worker at a time.

const MAX_ATTEMPTS = 6

/**
 * Exponential backoff with jitter: ~1m, 2m, 4m, 8m, 16m, 32m.
 * Jitter stops a batch that failed together from retrying in lockstep.
 */
export function backoffSeconds(attempts) {
  const base = 60 * Math.pow(2, Math.max(0, attempts - 1))
  const jitter = Math.floor(Math.random() * 30)
  return Math.min(base + jitter, 3600)
}

/**
 * Atomically claim up to `limit` events. Also reclaims rows whose lease has
 * expired, i.e. a worker that was killed mid-run (Vercel timeout) — without
 * that arm those events would sit in 'processing' forever.
 *
 * Keep `limit` small: on Vercel Hobby the function has a short wall clock, and
 * pg_cron ticks every minute, so throughput comes from frequency not batch size.
 */
export async function claimEvents(supabase, { limit = 10, leaseSeconds = 120 } = {}) {
  const { data, error } = await supabase.rpc('claim_webhook_events', {
    p_limit: limit,
    p_lease_seconds: leaseSeconds,
  })
  if (error) throw new Error(`claim_failed: ${error.message}`)
  return data || []
}

/**
 * Mark an event fully processed. Keeps the legacy `processed` flag in sync.
 *
 * `note` lets a handler settle an event as done while still leaving a
 * breadcrumb — e.g. a profile-miss that isn't worth retrying but is worth a
 * human finding later. Defaults to null, clearing any earlier attempt's
 * error now that the event has actually succeeded.
 */
export async function markDone(supabase, stripeEventId, note = null) {
  const { error } = await supabase
    .from('webhook_events')
    .update({
      status: 'done',
      processed: true,
      processed_at: new Date().toISOString(),
      processing_error: note,
      lease_until: null,
    })
    .eq('stripe_event_id', stripeEventId)
  if (error) console.error('[inbox] markDone failed:', error.message)
}

/**
 * Record a failed attempt: schedule a retry, or bury the event once it has
 * burned through MAX_ATTEMPTS. Dead rows are what the health beacon alerts on —
 * they are the events a human needs to look at.
 */
export async function markFailed(supabase, event, err) {
  const attempts = event.attempts || 1
  const dead = attempts >= MAX_ATTEMPTS
  const message = String(err?.stack || err?.message || err).slice(0, 1000)

  const patch = dead
    ? { status: 'dead', processed: false, processing_error: message, lease_until: null }
    : {
        status: 'pending',
        processed: false,
        processing_error: message,
        lease_until: null,
        next_attempt_at: new Date(Date.now() + backoffSeconds(attempts) * 1000).toISOString(),
      }

  const { error } = await supabase
    .from('webhook_events')
    .update(patch)
    .eq('stripe_event_id', event.stripe_event_id)
  if (error) console.error('[inbox] markFailed failed:', error.message)

  return { dead, attempts }
}

/**
 * Insert a raw event into the inbox. Idempotent on stripe_event_id — a
 * redelivery of an event we already hold is a no-op, not a duplicate row.
 *
 * @returns {Promise<{ inserted: boolean }>}
 */
export async function enqueueEvent(supabase, { source = 'stripe', eventId, eventType, payload }) {
  const { error } = await supabase
    .from('webhook_events')
    .upsert(
      {
        source,
        stripe_event_id: eventId,
        event_type: eventType,
        payload,
        signature_valid: true,
        status: 'pending',
        processed: false,
        received_at: new Date().toISOString(),
      },
      { onConflict: 'stripe_event_id', ignoreDuplicates: true }
    )

  if (error) throw new Error(`inbox_insert_failed: ${error.message}`)
  return { inserted: true }
}

export { MAX_ATTEMPTS }
