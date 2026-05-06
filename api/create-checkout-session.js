// /api/create-checkout-session.js
// Creates a Stripe Checkout Session for celpipAce Premium (RECURRING).
//
// Env vars required (Vercel project settings):
//   STRIPE_SECRET_KEY
//   STRIPE_PRICE_WEEKLY          price_xxx (recurring weekly)
//   STRIPE_PRICE_MONTHLY         price_xxx (recurring monthly)
//   STRIPE_PRICE_ANNUAL          price_xxx (recurring yearly)
//   STRIPE_PROMOTION_CODE_CELPIP25 promo_xxx (optional; otherwise looked up by code)
//   PUBLIC_SITE_URL              e.g. https://celpipace.ca (no trailing slash)
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY    server-side only

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const PLAN_PRICE_ENV = {
  weekly:  ['STRIPE_PRICE_WEEKLY'],
  monthly: ['STRIPE_PRICE_MONTHLY'],
  annual:  ['STRIPE_PRICE_ANNUAL', 'STRIPE_PRICE_QUARTERLY'],
}

const PLAN_ALIASES = {
  quarterly: 'annual',
}

const WELCOME_COUPON_CODE = 'CELPIP25'

function normalizePlan(plan) {
  const cleanPlan = String(plan || '').trim().toLowerCase()
  return PLAN_PRICE_ENV[cleanPlan] ? cleanPlan : PLAN_ALIASES[cleanPlan]
}

function getPlanPriceId(plan) {
  const envNames = PLAN_PRICE_ENV[plan] || []
  for (const envName of envNames) {
    if (process.env[envName]) return process.env[envName]
  }
  return null
}

async function getWelcomePromotionCodeId(stripe) {
  if (process.env.STRIPE_PROMOTION_CODE_CELPIP25) {
    return process.env.STRIPE_PROMOTION_CODE_CELPIP25
  }

  const promotionCodes = await stripe.promotionCodes.list({
    code: WELCOME_COUPON_CODE,
    active: true,
    limit: 1,
  })

  return promotionCodes.data[0]?.id || null
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) return res.status(500).json({ error: 'Stripe not configured' })

  const { userId, email } = req.body || {}
  const plan = normalizePlan(req.body?.plan)
  const couponCode = String(req.body?.couponCode || '').trim().toUpperCase()

  if (!plan) return res.status(400).json({ error: 'Invalid plan' })
  if (!userId || !email) return res.status(400).json({ error: 'Missing user info' })
  if (couponCode && couponCode !== WELCOME_COUPON_CODE) {
    return res.status(400).json({ error: 'invalid_coupon', message: 'This coupon code is not supported here. You can enter other Stripe promotion codes at checkout.' })
  }

  const priceId = getPlanPriceId(plan)
  if (!priceId) return res.status(500).json({ error: `Stripe price not configured for ${plan}` })

  const siteUrl =
    process.env.PUBLIC_SITE_URL ||
    (req.headers.origin || '').replace(/\/$/, '') ||
    'https://celpipace.ca'

  const stripe = new Stripe(secret, { apiVersion: '2024-06-20' })

  // Reuse an existing Stripe customer if we have one on file, and block
  // double-subscriptions for users who are already active.
  let customerId = null
  let firstPurchaseEligible = false
  const supaUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const svcKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (supaUrl && svcKey) {
    try {
      const supabase = createClient(supaUrl, svcKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
      const { data: prof } = await supabase
        .from('profiles')
        .select('stripe_customer_id, is_premium, subscription_status')
        .eq('id', userId)
        .maybeSingle()
      if (prof?.is_premium && prof?.subscription_status === 'active') {
        return res.status(409).json({
          error: 'already_subscribed',
          message: 'You already have an active subscription.',
        })
      }
      if (prof?.stripe_customer_id) customerId = prof.stripe_customer_id

      const { count: userPaymentCount, error: userPaymentsErr } = await supabase
        .from('payments')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .in('status', ['paid', 'refunded'])
      if (userPaymentsErr) throw userPaymentsErr

      const { count: emailPaymentCount, error: emailPaymentsErr } = await supabase
        .from('payments')
        .select('id', { count: 'exact', head: true })
        .eq('email', email)
        .in('status', ['paid', 'refunded'])
      if (emailPaymentsErr) throw emailPaymentsErr

      firstPurchaseEligible = !userPaymentCount && !emailPaymentCount
    } catch (e) {
      console.warn('[checkout] profile lookup failed:', e?.message)
      if (couponCode === WELCOME_COUPON_CODE) {
        return res.status(500).json({ error: 'coupon_validation_failed', message: 'Could not verify first-time coupon eligibility.' })
      }
    }
  } else if (couponCode === WELCOME_COUPON_CODE) {
    return res.status(500).json({ error: 'coupon_validation_failed', message: 'Coupon validation requires Supabase service configuration.' })
  }

  let welcomePromotionCodeId = null
  if (couponCode === WELCOME_COUPON_CODE) {
    if (!firstPurchaseEligible) {
      return res.status(409).json({
        error: 'coupon_first_purchase_only',
        message: 'CELPIP25 is only available on your first subscription purchase.',
      })
    }
    welcomePromotionCodeId = await getWelcomePromotionCodeId(stripe)
    if (!welcomePromotionCodeId) {
      return res.status(500).json({
        error: 'coupon_not_configured',
        message: 'CELPIP25 is not configured in Stripe yet. Create an active 25% promotion code named CELPIP25.',
      })
    }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      ...(customerId ? { customer: customerId } : { customer_email: email }),
      line_items: [{ price: priceId, quantity: 1 }],
      ...(welcomePromotionCodeId
        ? { discounts: [{ promotion_code: welcomePromotionCodeId }] }
        : { allow_promotion_codes: true }),
      success_url: `${siteUrl}/subscription?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${siteUrl}/pricing?checkout=cancelled`,
      client_reference_id: userId,
      metadata: { user_id: userId, email, plan, coupon_code: welcomePromotionCodeId ? WELCOME_COUPON_CODE : '' },
      subscription_data: {
        metadata: { user_id: userId, email, plan, coupon_code: welcomePromotionCodeId ? WELCOME_COUPON_CODE : '' },
        description: `celpipAce Premium — ${plan}`,
      },
    })
    return res.status(200).json({ url: session.url, id: session.id })
  } catch (err) {
    console.error('[stripe checkout] error:', err)
    return res.status(500).json({ error: err.message || 'Stripe error' })
  }
}
