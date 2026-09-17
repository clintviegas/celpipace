/* global process */
// /api/_lib/refunds.js
// Single implementation of "refund this payment and end the subscription".
//
// This used to live inline in api/admin.js (action=refund) and was only
// reachable by an admin clicking a button. It now backs three callers:
//
//   • admin.js            — the manual button, unchanged behaviour
//   • cancel-subscription — self-serve auto-refund when the policy below says
//                           the customer is inside their money-back window
//   • job-worker.js       — charge.refunded uses markPaymentRefunded() so a
//                           refund issued from the Stripe dashboard still
//                           flips the payment row here
//
// Money rules that are deliberately the same everywhere:
//   – Refund the charge minus Stripe's non-refundable processing fee.
//   – Cancel the Stripe subscription *immediately* (not at period end), so
//     Stripe and our columns agree and the reconciler has nothing to "fix".
//   – Revoke premium now.

const PLAN_KEYS = ['weekly', 'monthly', 'annual', 'premium']

function envInt(name, fallback) {
  const raw = process.env[name]
  if (raw == null || raw === '') return fallback
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) && n >= 0 ? n : fallback
}

/**
 * Money-back window per plan, in days measured from the most recent
 * successful payment. 0 disables auto-refund for that plan (the request
 * still lands in the manual review queue as before).
 *
 * Defaults are deliberately shorter for shorter plans — a 7-day window on a
 * 7-day plan is "use the whole thing, then get it free".
 *
 * Override with AUTO_REFUND_DAYS_WEEKLY / _MONTHLY / _ANNUAL / _PREMIUM.
 */
export const AUTO_REFUND_DAYS = {
  weekly:  envInt('AUTO_REFUND_DAYS_WEEKLY',  2),
  monthly: envInt('AUTO_REFUND_DAYS_MONTHLY', 7),
  annual:  envInt('AUTO_REFUND_DAYS_ANNUAL',  14),
  premium: envInt('AUTO_REFUND_DAYS_PREMIUM', 7), // generic bucket
}

/** How many auto-refunds one customer can ever receive. Manual refunds are unbounded. */
export const AUTO_REFUND_MAX_PER_CUSTOMER = envInt('AUTO_REFUND_MAX_PER_CUSTOMER', 1)

function idOf(v) {
  return typeof v === 'string' ? v : v?.id || null
}

/**
 * Turn whatever identifier we have into a payment_intent / charge pair.
 *
 * Subscription renewals only leave the invoice id (in_…) on the payment row,
 * and subscription-mode Checkout Sessions have no payment_intent of their own
 * — it lives on the first invoice — so both need a hop through Stripe.
 */
export async function resolveChargeRef(stripe, { paymentIntentId, chargeId, sessionId } = {}) {
  let pi = paymentIntentId || null
  let ch = chargeId || null
  const ref = String(sessionId || '').trim()

  if (!pi && !ch && ref) {
    if (ref.startsWith('in_')) {
      const invoice = await stripe.invoices.retrieve(ref)
      pi = idOf(invoice.payment_intent)
      if (!pi) ch = idOf(invoice.charge)
    } else if (ref.startsWith('cs_')) {
      const checkout = await stripe.checkout.sessions.retrieve(ref, { expand: ['invoice'] })
      pi = idOf(checkout.payment_intent)
      if (!pi && checkout.invoice) {
        const inv = typeof checkout.invoice === 'object' ? checkout.invoice : await stripe.invoices.retrieve(checkout.invoice)
        pi = idOf(inv.payment_intent)
        if (!pi) ch = idOf(inv.charge)
      }
    } else if (ref.startsWith('pi_')) {
      pi = ref
    } else if (ref.startsWith('ch_')) {
      ch = ref
    }
  }
  return { paymentIntentId: pi, chargeId: ch }
}

/**
 * Flip our payments row(s) to 'refunded'. Matches on every identifier we
 * might hold, because the row was written by whichever webhook saw the
 * payment first and that decides which ids it carries.
 */
export async function markPaymentRefunded(supabase, { paymentIntentId, chargeId, invoiceId, sessionId } = {}) {
  const ors = []
  if (paymentIntentId) ors.push(`stripe_payment_intent_id.eq.${paymentIntentId}`)
  if (invoiceId)       ors.push(`stripe_session_id.eq.${invoiceId}`)
  if (sessionId)       ors.push(`stripe_session_id.eq.${sessionId}`)
  if (chargeId)        ors.push(`stripe_payment_intent_id.eq.${chargeId}`) // legacy rows that stored ch_
  if (!ors.length) return { matched: 0 }

  const { data, error } = await supabase
    .from('payments')
    .update({ status: 'refunded' })
    .or(ors.join(','))
    .select('id')
  if (error) {
    console.error('[refunds] markPaymentRefunded failed:', error.message)
    return { matched: 0, error: error.message }
  }
  return { matched: data?.length || 0 }
}

export class RefundError extends Error {
  constructor(message, { status = 400, code = 'refund_failed' } = {}) {
    super(message)
    this.status = status
    this.code = code
  }
}

/**
 * Refund a payment (net of Stripe's fee), cancel its subscription immediately,
 * revoke premium, and mark the payment row.
 *
 * @param {object} p
 * @param {import('stripe').Stripe} p.stripe
 * @param {object}  p.supabase          service-role client
 * @param {string} [p.paymentIntentId]
 * @param {string} [p.chargeId]
 * @param {string} [p.sessionId]        cs_… / in_… / pi_… / ch_… — resolved for you
 * @param {string} [p.subscriptionId]   fallback when the charge has no invoice
 * @param {string} [p.reason]           Stripe refund reason enum
 * @param {string}  p.issuedBy          who/what triggered it, for the audit trail
 * @param {string}  p.source            'admin_panel' | 'self_serve_auto'
 * @throws {RefundError}
 */
export async function issueRefund({
  stripe, supabase,
  paymentIntentId, chargeId, sessionId, subscriptionId,
  reason = 'requested_by_customer',
  issuedBy, source,
}) {
  let resolved
  try {
    resolved = await resolveChargeRef(stripe, { paymentIntentId, chargeId, sessionId })
  } catch (err) {
    throw new RefundError(`Could not resolve a charge to refund: ${err?.message || err}`)
  }
  let { paymentIntentId: pi, chargeId: ch } = resolved
  if (!pi && !ch) throw new RefundError('Need payment_intent_id or charge_id')

  // Load the charge + its balance transaction so we know the exact,
  // non-refundable Stripe fee. Stripe does not hand the original fee back on
  // a refund, so we deduct it ourselves to keep the platform whole.
  let charge = null
  if (ch) {
    charge = await stripe.charges.retrieve(ch, { expand: ['balance_transaction'] })
  } else {
    const intent = await stripe.paymentIntents.retrieve(pi, { expand: ['latest_charge.balance_transaction'] })
    charge = typeof intent.latest_charge === 'object' ? intent.latest_charge : null
    if (!charge && intent.latest_charge) {
      charge = await stripe.charges.retrieve(intent.latest_charge, { expand: ['balance_transaction'] })
    }
  }
  if (!charge) throw new RefundError('Could not load the charge to refund')
  if (!ch) ch = charge.id
  if (!pi) pi = idOf(charge.payment_intent)

  const bt              = typeof charge.balance_transaction === 'object' ? charge.balance_transaction : null
  const feeCents        = Math.max(0, bt?.fee || 0)
  const alreadyRefunded = charge.amount_refunded || 0
  const refundable      = Math.max(0, charge.amount - alreadyRefunded)
  const netCents        = Math.max(0, refundable - feeCents)

  if (alreadyRefunded > 0 && refundable === 0) {
    throw new RefundError('This charge has already been fully refunded.', { code: 'already_refunded' })
  }
  if (netCents <= 0) {
    throw new RefundError(
      `Nothing to refund after the $${(feeCents / 100).toFixed(2)} processing fee (refundable was $${(refundable / 100).toFixed(2)}).`,
      { code: 'nothing_after_fee' }
    )
  }

  const refund = await stripe.refunds.create({
    ...(pi ? { payment_intent: pi } : { charge: ch }),
    amount: netCents,
    reason,
    metadata: {
      issued_by:   issuedBy || 'unknown',
      source:      source || 'unknown',
      kind:        'cancellation_refund',
      gross_cents: String(charge.amount),
      fee_cents:   String(feeCents),
    },
  })

  // Cancel the subscription now. Refunding alone only moves money — the
  // subscription would keep renewing, and the reconciler would see Stripe
  // saying 'active' and hand premium back. Non-fatal: the money is already
  // returned and the reconciler's sticky-revocation guard covers a miss here.
  let subscriptionCancelled = null
  try {
    const invoiceId = idOf(charge.invoice)
    const subFromInvoice = invoiceId ? idOf((await stripe.invoices.retrieve(invoiceId)).subscription) : null
    const target = subFromInvoice || subscriptionId || null
    if (target) {
      const cancelled = await stripe.subscriptions.cancel(target)
      subscriptionCancelled = cancelled.id
    }
  } catch (cancelErr) {
    // Already-cancelled subscriptions 404 here, which is fine.
    console.error('[refunds] subscription cancel failed:', cancelErr?.message || cancelErr)
  }

  // Revoke premium + mark the payment refunded right away. A fee-deducted
  // refund is *partial* in Stripe's eyes (charge.refunded stays false), so the
  // webhook's full-refund check alone would not end access.
  const customerId = idOf(charge.customer)
  let profileId = null
  try {
    await markPaymentRefunded(supabase, { paymentIntentId: pi, chargeId: ch, invoiceId: idOf(charge.invoice), sessionId })

    let profile = null
    if (customerId) {
      const { data } = await supabase.from('profiles').select('id').eq('stripe_customer_id', customerId).maybeSingle()
      profile = data || null
    }
    if (!profile && charge.billing_details?.email) {
      const { data } = await supabase.from('profiles').select('id').eq('email', charge.billing_details.email).maybeSingle()
      profile = data || null
    }
    if (profile) {
      profileId = profile.id
      await supabase.from('profiles').update({
        is_premium:           false,
        subscription_status:  'refunded',
        current_plan:         'free',
        premium_source:       'refund',
        premium_expires_at:   new Date().toISOString(),
        cancel_at_period_end: true,
      }).eq('id', profile.id)
    }
  } catch (revokeErr) {
    console.error('[refunds] revoke error:', revokeErr?.message || revokeErr)
  }

  return {
    refundId:              refund.id,
    status:                refund.status,
    currency:              refund.currency,
    grossCents:            charge.amount,
    feeCents,
    netCents,
    chargeId:              ch,
    paymentIntentId:       pi,
    customerId,
    profileId,
    subscriptionCancelled,
  }
}

/**
 * Decide whether a self-serve cancellation qualifies for an automatic refund.
 * Pure policy — no money moves here.
 *
 * @returns {Promise<{eligible:boolean, reason:string, payment?:object, windowDays?:number, ageDays?:number}>}
 */
export async function evaluateAutoRefund({ supabase, userId, plan }) {
  const key = PLAN_KEYS.includes(plan) ? plan : 'premium'
  const windowDays = AUTO_REFUND_DAYS[key]
  if (!windowDays) return { eligible: false, reason: 'disabled_for_plan', windowDays: 0 }

  const { data: payment, error } = await supabase
    .from('payments')
    .select('id, amount_cents, currency, plan, status, stripe_session_id, stripe_payment_intent_id, stripe_customer_id, created_at')
    .eq('user_id', userId)
    .eq('status', 'paid')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) return { eligible: false, reason: `lookup_failed: ${error.message}`, windowDays }
  if (!payment) return { eligible: false, reason: 'no_paid_payment', windowDays }

  const ageDays = (Date.now() - new Date(payment.created_at).getTime()) / 864e5
  if (ageDays > windowDays) return { eligible: false, reason: 'outside_window', payment, windowDays, ageDays }

  const { count } = await supabase
    .from('subscription_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('event_type', 'refund.auto_issued')
  if ((count || 0) >= AUTO_REFUND_MAX_PER_CUSTOMER) {
    return { eligible: false, reason: 'limit_reached', payment, windowDays, ageDays }
  }

  return { eligible: true, reason: 'within_window', payment, windowDays, ageDays }
}
