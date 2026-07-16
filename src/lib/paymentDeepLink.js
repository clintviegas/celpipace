import { daysUntil } from './studyPlan'
import { WEEKLY_PROMO, WELCOME_COUPON_CODE } from '../data/paymentPlans'

/**
 * Build checkout URL for upgrade CTAs — monthly by default, weekly + CELPIP50
 * when exam date is within 60 days.
 */
export function buildUpgradePaymentUrl(profile, { reason } = {}) {
  const examDate = profile?.exam_date || null
  const daysLeft = examDate ? daysUntil(examDate) : null
  const urgency = daysLeft != null && daysLeft >= 0 && daysLeft <= 60

  if (urgency && WEEKLY_PROMO.active) {
    return `/payment?plan=weekly&coupon=${WEEKLY_PROMO.code}`
  }

  const params = new URLSearchParams({ plan: 'monthly' })
  if (reason === 'ai_limit' || reason === 'coach_limit') {
    params.set('coupon', WELCOME_COUPON_CODE)
  }
  return `/payment?${params.toString()}`
}
