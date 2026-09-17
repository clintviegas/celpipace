/* global process */
// /api/_lib/billing.js
// Single source of truth for translating Stripe objects into our profile shape.
//
// This logic previously existed twice — in api/stripe-webhook.js and in
// api/admin.js (sync-subscription) — with the two copies already drifting: the
// admin copy took a `fallbackPlan` the webhook copy lacked, and the two profile
// lookups tried their keys in different orders. That is drift risk on the code
// that decides who has paid, so it now lives here and both callers import it.
//
// Plan resolution order: Stripe price id → subscription metadata → explicit
// fallback → the generic 'premium' bucket.

const PLAN_BY_PRICE = {
  [process.env.STRIPE_PRICE_WEEKLY    || '']: 'weekly',
  [process.env.STRIPE_PRICE_MONTHLY   || '']: 'monthly',
  [process.env.STRIPE_PRICE_ANNUAL    || '']: 'annual',
  [process.env.STRIPE_PRICE_QUARTERLY || '']: 'annual',
}

// Historical rename: the quarterly SKU became the annual one.
const PLAN_ALIASES = { quarterly: 'annual' }

export function normalizePlanSlug(plan) {
  const cleanPlan = String(plan || '').trim().toLowerCase()
  if (cleanPlan === 'weekly' || cleanPlan === 'monthly' || cleanPlan === 'annual') return cleanPlan
  return PLAN_ALIASES[cleanPlan] || ''
}

export function stripeTimeToIso(seconds) {
  return seconds ? new Date(seconds * 1000).toISOString() : null
}

/**
 * Dig the subscription id out of an invoice. Stripe has moved this field
 * around across API versions, so check all three known locations.
 */
export function invoiceSubscriptionId(invoice) {
  const direct = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id
  if (direct) return direct

  const parentSubscription = invoice.parent?.subscription_details?.subscription
  if (typeof parentSubscription === 'string') return parentSubscription

  const lineSubscription = invoice.lines?.data
    ?.map((line) => line.parent?.subscription_item_details?.subscription)
    .find(Boolean)
  return typeof lineSubscription === 'string' ? lineSubscription : null
}

/**
 * Map a Stripe subscription onto the profile columns we own.
 *
 * @param {object} sub            Stripe subscription object
 * @param {string} [fallbackPlan] used when neither price id nor metadata resolves
 */
export function subscriptionToProfilePatch(sub, fallbackPlan) {
  const item    = sub.items?.data?.[0]
  const priceId = item?.price?.id
  const plan    = PLAN_BY_PRICE[priceId]
              || normalizePlanSlug(sub.metadata?.plan)
              || normalizePlanSlug(fallbackPlan)
              || 'premium'

  // Stripe's subscription status set is closed and documented, so map all of it
  // explicitly rather than defaulting the tail to 'active'.
  //
  // The previous if/else chain ended in `else status = 'active'`, which meant
  // incomplete_expired — checkout started, payment never completed, Stripe gave
  // up after ~23h — resolved to active and GRANTED PREMIUM. Same for `paused`.
  //
  // Unknown statuses now fail closed. The trade-off is deliberate: if Stripe
  // ever introduces a new active-like status, failing closed briefly revokes
  // access (loud, and every affected profile emits a reconciler.repair event
  // straight to Sentry) whereas failing open silently hands out the product.
  const STATUS_MAP = {
    active:             'active',
    trialing:           'trialing',
    past_due:           'past_due',
    canceled:           'canceled',
    unpaid:             'expired',
    incomplete:         'incomplete',
    incomplete_expired: 'expired',
    paused:             'expired',
  }
  const status = STATUS_MAP[sub.status] || 'expired'

  // While cancel_at_period_end is set, Stripe keeps status 'active' until the
  // period actually ends and only then sends customer.subscription.deleted.
  const periodStart = stripeTimeToIso(sub.current_period_start || item?.current_period_start)
  const periodEnd   = stripeTimeToIso(sub.current_period_end   || item?.current_period_end)

  // Access survives past_due — dunning should not lock a paying customer out.
  const stillPremium = status === 'active' || status === 'trialing' || status === 'past_due'

  return {
    is_premium:             stillPremium,
    subscription_status:    status,
    current_plan:           stillPremium ? plan : 'free',
    stripe_subscription_id: sub.id,
    cancel_at_period_end:   !!sub.cancel_at_period_end,
    current_period_start:   periodStart,
    current_period_end:     periodEnd,
    premium_expires_at:     periodEnd,
    premium_source:         `stripe:${plan}`,
  }
}

/**
 * Resolve a profile from whatever identifiers we happen to hold.
 *
 * Order is most-specific first: our own user id, then the subscription (a
 * customer may hold several), then the customer, then email as a last resort.
 *
 * @returns {Promise<object|null>}
 */
export async function findProfile(supabase, { userId, subscriptionId, customerId, email } = {}) {
  const lookups = [
    userId         && ['id', userId],
    subscriptionId && ['stripe_subscription_id', subscriptionId],
    customerId     && ['stripe_customer_id', customerId],
    email          && ['email', email],
  ].filter(Boolean)

  for (const [column, value] of lookups) {
    const { data } = await supabase.from('profiles').select('*').eq(column, value).maybeSingle()
    if (data) return data
  }
  return null
}

export { PLAN_BY_PRICE, PLAN_ALIASES }
