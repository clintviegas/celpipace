// /api/create-checkout-session.js
// Creates a Stripe Checkout Session for celpipAce Premium (RECURRING).
//
// Env vars required (Vercel project settings):
//   STRIPE_SECRET_KEY
//   STRIPE_PRICE_WEEKLY          price_xxx (recurring weekly)
//   STRIPE_PRICE_MONTHLY         price_xxx (recurring monthly)
//   STRIPE_PRICE_QUARTERLY       price_xxx (recurring every 3 months)
//   PUBLIC_SITE_URL              e.g. https://celpipace.com (no trailing slash)
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY    server-side only

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const PLAN_PRICE_ENV = {
  weekly:    'STRIPE_PRICE_WEEKLY',
  monthly:   'STRIPE_PRICE_MONTHLY',
  quarterly: 'STRIPE_PRICE_QUARTERLY',
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) return res.status(500).json({ error: 'Stripe not configured' })

  const { plan, userId, email } = req.body || {}
  if (!plan || !PLAN_PRICE_ENV[plan]) return res.status(400).json({ error: 'Invalid plan' })
  if (!userId || !email) return res.status(400).json({ error: 'Missing user info' })

  const priceId = process.env[PLAN_PRICE_ENV[plan]]
  if (!priceId) return res.status(500).json({ error: `Stripe price not configured for ${plan}` })

  const siteUrl =
    process.env.PUBLIC_SITE_URL ||
    (req.headers.origin || '').replace(/\/$/, '') ||
    'https://celpipace.com'

  const stripe = new Stripe(secret, { apiVersion: '2024-06-20' })

  // Reuse an existing Stripe customer if we have one on file, and block
  // double-subscriptions for users who are already active.
  let customerId = null
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
    } catch (e) {
      console.warn('[checkout] profile lookup failed:', e?.message)
    }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      ...(customerId ? { customer: customerId } : { customer_email: email }),
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${siteUrl}/subscription?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${siteUrl}/pricing?checkout=cancelled`,
      client_reference_id: userId,
      metadata: { user_id: userId, email, plan },
      subscription_data: {
        metadata: { user_id: userId, email, plan },
        description: `celpipAce Premium — ${plan}`,
      },
    })
    return res.status(200).json({ url: session.url, id: session.id })
  } catch (err) {
    console.error('[stripe checkout] error:', err)
    return res.status(500).json({ error: err.message || 'Stripe error' })
  }
}
