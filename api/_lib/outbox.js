/* global process */
// /api/_lib/outbox.js
// Transactional outbox for email and CRM work.
//
// Handlers enqueue a row; the worker drains it on the next tick. This buys
// three things the old inline sends did not have:
//
//   1. Retries. A Brevo blip used to lose the email permanently — the failure
//      was written to email_log and never looked at again.
//   2. Survivability. Vercel suspends the container as soon as the response is
//      sent, so the fire-and-forget Brevo calls in the old webhook were being
//      killed routinely and invisibly.
//   3. Latency isolation. Webhook response time no longer includes an email
//      round-trip.
//
// dedupe_key is the natural key of the work ('welcome:<user_id>',
// 'receipt:<invoice_id>'). Enqueueing the same key twice is a no-op, so this
// is safe to call from a handler that may itself be retried.

import { sendEmail, renderWelcome, renderReceipt, renderCancelFinal, renderPastDue, renderRefundProcessed } from './email.js'
import { upsertBrevoContact, addToBrevoList, removeFromBrevoList } from './brevo.js'
import { captureError } from './observability.js'

const MAX_ATTEMPTS = 5

function backoffSeconds(attempts) {
  const base = 60 * Math.pow(2, Math.max(0, attempts - 1))
  return Math.min(base + Math.floor(Math.random() * 30), 3600)
}

/**
 * Queue a unit of work. Idempotent on dedupeKey.
 * @returns {Promise<{ queued: boolean, deduped?: boolean }>}
 */
export async function enqueueJob(supabase, { kind, payload, dedupeKey, runAt }) {
  const { error } = await supabase.from('job_queue').insert({
    kind,
    payload:     payload || {},
    dedupe_key:  dedupeKey || null,
    next_run_at: runAt || new Date().toISOString(),
  })

  if (error) {
    if (error.code === '23505') return { queued: false, deduped: true }
    throw new Error(`enqueue_failed:${kind}:${error.message}`)
  }
  return { queued: true }
}

// ── Job kinds ───────────────────────────────────────────────────────────────

const EMAIL_TEMPLATES = {
  welcome:          (p) => renderWelcome({ name: p.name, plan: p.plan }),
  cancel_final:     (p) => renderCancelFinal({ name: p.name }),
  past_due:         (p) => renderPastDue({
                            name: p.name, amountCents: p.amountCents,
                            currency: p.currency, hostedInvoiceUrl: p.hostedInvoiceUrl }),
  receipt:          (p) => renderReceipt({
                            name: p.name, plan: p.plan, amountCents: p.amountCents,
                            currency: p.currency, invoiceNumber: p.invoiceNumber,
                            invoicePdfUrl: p.invoicePdfUrl, hostedInvoiceUrl: p.hostedInvoiceUrl,
                            periodEnd: p.periodEnd }),
  refund_processed: (p) => renderRefundProcessed({
                            name: p.name, amountCents: p.amountCents, currency: p.currency,
                            isPartial: p.isPartial, grossCents: p.grossCents, feeCents: p.feeCents }),
}

async function runEmailJob(supabase, payload) {
  const render = EMAIL_TEMPLATES[payload.template]
  if (!render) throw new Error(`unknown_email_template:${payload.template}`)

  const { subject, html } = render(payload)
  const result = await sendEmail({
    supabase,
    userId:   payload.userId,
    toEmail:  payload.toEmail,
    kind:     payload.template,
    subject,
    html,
    pdfUrl:   payload.invoicePdfUrl || null,
    metadata: payload.metadata || {},
  })
  // Surface the failure so the job retries rather than silently succeeding.
  if (!result.ok) throw new Error(`send_failed: ${result.error}`)
  return { logId: result.logId, providerId: result.providerId }
}

async function runBrevoPremium(_supabase, payload) {
  const { email, fullName } = payload
  const [firstName, ...rest] = String(fullName || '').trim().split(/\s+/)
  const premiumListId = process.env.BREVO_LIST_PREMIUM ? Number(process.env.BREVO_LIST_PREMIUM) : null
  const freeListId    = process.env.BREVO_LIST_FREE    ? Number(process.env.BREVO_LIST_FREE)    : null

  await upsertBrevoContact({ email, firstName, lastName: rest.join(' ') })
  if (premiumListId) await addToBrevoList({ email, listId: premiumListId })
  if (freeListId)    await removeFromBrevoList({ email, listId: freeListId })
  return { email, premiumListId, freeListId }
}

async function runBrevoCancelled(_supabase, payload) {
  const { email } = payload
  const cancelledListId = process.env.BREVO_LIST_CANCELLED ? Number(process.env.BREVO_LIST_CANCELLED) : null
  const freeListId      = process.env.BREVO_LIST_FREE      ? Number(process.env.BREVO_LIST_FREE)      : null

  if (cancelledListId) await addToBrevoList({ email, listId: cancelledListId })
  if (freeListId)      await addToBrevoList({ email, listId: freeListId })
  return { email, cancelledListId, freeListId }
}

const RUNNERS = {
  email:           runEmailJob,
  brevo_premium:   runBrevoPremium,
  brevo_cancelled: runBrevoCancelled,
}

// ── Drain ───────────────────────────────────────────────────────────────────

/**
 * Claim and run a batch of queued jobs. Called by the worker each tick.
 * Never throws for an individual job failure — that job is retried or buried.
 */
export async function drainOutbox(supabase, { limit = 10, leaseSeconds = 120 } = {}) {
  const { data: jobs, error } = await supabase.rpc('claim_jobs', {
    p_limit: limit,
    p_lease_seconds: leaseSeconds,
  })
  if (error) throw new Error(`claim_jobs_failed: ${error.message}`)

  const summary = { claimed: (jobs || []).length, done: 0, retried: 0, dead: 0 }

  for (const job of jobs || []) {
    const runner = RUNNERS[job.kind]
    try {
      if (!runner) throw new Error(`unknown_job_kind:${job.kind}`)
      await runner(supabase, job.payload || {})

      await supabase.from('job_queue').update({
        status: 'done',
        completed_at: new Date().toISOString(),
        last_error: null,
        lease_until: null,
      }).eq('id', job.id)
      summary.done++
    } catch (err) {
      const dead = (job.attempts || 1) >= MAX_ATTEMPTS
      await supabase.from('job_queue').update({
        status: dead ? 'dead' : 'pending',
        last_error: String(err?.message || err).slice(0, 1000),
        lease_until: null,
        next_run_at: dead
          ? job.next_run_at
          : new Date(Date.now() + backoffSeconds(job.attempts || 1) * 1000).toISOString(),
      }).eq('id', job.id)

      captureError(err, {
        job: 'outbox',
        kind: job.kind,
        dedupe_key: job.dedupe_key,
        attempts: job.attempts,
        dead,
      }, dead ? 'error' : 'warning')

      if (dead) summary.dead++; else summary.retried++
    }
  }

  return summary
}

export { MAX_ATTEMPTS }
