import { PRODUCT_STATS } from './constants'

export const WELCOME_COUPON_CODE = 'CELPIP25'
export const WELCOME_DISCOUNT = 0.25

export const BILLING_PLANS = [
  {
    id: 'weekly',
    label: 'Weekly',
    price: 12.99,
    perMo: null,
    period: '/week',
    cadence: 'Weekly billing',
    days: 7,
    badge: 'Short sprint',
    blurb: 'Best for last-minute focused prep',
  },
  {
    id: 'monthly',
    label: 'Monthly',
    price: 24.99,
    perMo: null,
    period: '/month',
    cadence: 'Monthly billing',
    days: 30,
    badge: 'Flexible month',
    blurb: 'A full study cycle with room to review',
  },
  {
    id: 'annual',
    label: 'Annual',
    price: 49.99,
    perMo: 4.17,
    period: '/year',
    cadence: 'Annual billing',
    days: 365,
    badge: 'Best value',
    blurb: 'A full year of prep, retakes, score tracking, and review',
    popular: true,
  },
]

export const PREMIUM_FEATURES = [
  'All 8 full Mock Exams',
  `All ${PRODUCT_STATS.questionItems} Question Items & Prompts`,
  'Unlimited AI Scoring',
  'CELPIP Courses & Study Guides',
  'CELPIP Vocabulary Bundles',
  'Score Tracker & Progress Dashboard',
  'Detailed Explanations for Every Question',
  'CLB-Level Sample Responses',
  'Priority Email Support',
]

export const formatPlanPrice = (price) => `$${price.toFixed(2).replace(/\.00$/, '')}`

export function getBillingPlan(planId, fallback = 'annual') {
  return BILLING_PLANS.find(plan => plan.id === planId) || BILLING_PLANS.find(plan => plan.id === fallback) || BILLING_PLANS[0]
}