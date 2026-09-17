// Shared MRR / plan helpers for the admin dashboard.

// CAD, matching the live plan prices in src/data/paymentPlans.js. Subscribers
// on legacy USD Stripe Prices (anyone who checked out before the 2026-09
// CAD switch) are still counted at these CAD figures — since the CAD prices
// are the same digits as the old USD ones (a real cut, not an FX conversion),
// this slightly *understates* a grandfathered customer's true MRR. Acceptable
// at current subscriber volume.
export const PLAN_MRR_CAD = {
  weekly: 12.99 * 52 / 12,
  monthly: 24.99,
  annual: 49.99 / 12,
}

export function isPaidPremiumSource(source) {
  const normalized = String(source || '').trim().toLowerCase()
  return normalized === 'paid' || normalized === 'stripe' || normalized.startsWith('stripe:')
}

export function resolveBillingPlan(row) {
  const currentPlan = String(row?.current_plan || '').trim().toLowerCase()
  if (['weekly', 'monthly', 'annual'].includes(currentPlan)) return currentPlan
  const premiumSource = String(row?.premium_source || '').trim().toLowerCase()
  if (premiumSource.startsWith('stripe:')) {
    const plan = premiumSource.split(':')[1]
    if (['weekly', 'monthly', 'annual'].includes(plan)) return plan
  }
  return 'monthly'
}

export function monthlyMrrForRow(row, { includeCanceling = false } = {}) {
  if (!row?.is_premium || !isPaidPremiumSource(row.premium_source)) return 0
  if (row.cancel_at_period_end && !includeCanceling) return 0
  return PLAN_MRR_CAD[resolveBillingPlan(row)] ?? 24.99
}

export function computeMrrSummary(rows) {
  const paid = (rows || []).filter(r => r.is_premium && isPaidPremiumSource(r.premium_source))
  const activeMrr = paid.filter(r => !r.cancel_at_period_end).reduce((sum, r) => sum + monthlyMrrForRow(r), 0)
  const atRiskMrr = paid.filter(r => r.cancel_at_period_end).reduce((sum, r) => sum + monthlyMrrForRow(r, { includeCanceling: true }), 0)
  return { activeMrr, atRiskMrr, paidCount: paid.length }
}

export function countActiveUsers(rows, days) {
  const since = Date.now() - days * 864e5
  return (rows || []).filter(r => r.last_seen_at && new Date(r.last_seen_at).getTime() >= since).length
}
