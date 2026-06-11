import { PRODUCT_STATS } from './constants'

export const WELCOME_COUPON_CODE = 'CELPIP25'
export const WELCOME_DISCOUNT = 0.25

// ⚠️ STRIPE WIRING: `price` here is DISPLAY ONLY. The amount actually charged
// comes from the Stripe Price object referenced by STRIPE_PRICE_WEEKLY /
// STRIPE_PRICE_MONTHLY / STRIPE_PRICE_ANNUAL (see api/create-checkout-session.js).
// If you change a `price` below, create a matching Stripe Price and point the
// env var at it, or customers will see one number and be charged another.
// Existing subscribers stay on their old Price IDs and are unaffected.
//
// Pricing strategy: CELPIP is a short-lived need (people prep 4–8 weeks, take
// the test, leave). Monthly is the natural fit and is the hero. Annual is
// priced as a real long-haul/retaker plan so it no longer undercuts monthly.
export const BILLING_PLANS = [
  {
    id: 'weekly',
    label: 'Weekly',
    price: 12.99,
    perMo: null,
    period: '/week',
    cadence: 'Weekly billing',
    days: 7,
    badge: 'Final-week sprint',
    blurb: 'For last-minute cramming in the days before test day',
  },
  {
    id: 'monthly',
    label: 'Monthly',
    price: 24.99,
    perMo: null,
    period: '/month',
    cadence: 'Monthly billing',
    days: 30,
    badge: 'Most popular',
    blurb: 'The full prep window — most test-takers are ready in 4–8 weeks',
    popular: true,
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
    blurb: 'For retakers and long-haul preppers — a full year of access',
  },
]

export const PREMIUM_FEATURES = [
  'All 8 full Mock Exams',
  `All ${PRODUCT_STATS.questionItems} Question Items & Prompts`,
  'Unlimited Real-Time Scoring',
  'CELPIP Courses & Study Guides',
  'CELPIP Vocabulary Bundles',
  'Score Tracker & Progress Dashboard',
  'Detailed Explanations for Every Question',
  'CLB-Level Sample Responses',
  'Priority Email Support',
]

export const formatPlanPrice = (price) => `$${price.toFixed(2).replace(/\.00$/, '')}`

export function getBillingPlan(planId, fallback = 'monthly') {
  return BILLING_PLANS.find(plan => plan.id === planId) || BILLING_PLANS.find(plan => plan.id === fallback) || BILLING_PLANS[0]
}