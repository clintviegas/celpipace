// /api/customer-portal.js
// Creates a Stripe Billing Portal session so the user can self-serve:
//   • view invoices
//   • update card
//   • cancel (their access continues until current_period_end)
//
// Configure the portal once in Stripe Dashboard → Settings → Billing → Customer portal.
// Make sure cancellations are set to "Cancel at end of billing period" so users
// keep access through their paid period (matches our spec).
//
// Env:
//   STRIPE_SECRET_KEY
//   PUBLIC_SITE_URL
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//
// Body: { userId }

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const secret    = process.env.STRIPE_SECRET_KEY
  const supaUrl   = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const svcKey    = process.env.SUPABASE_SERVICE_ROLE_KEY
  const siteUrl   =
    process.env.PUBLIC_SITE_URL ||
    (req.headers.origin || '').replace(/\/$/, '') ||
    'https://celpipace.com'

  if (!secret || !supaUrl || !svcKey) {
    return res.status(500).json({ error: 'Server not configured' })
  }

  const { userId } = req.body || {}
  if (!userId) return res.status(400).json({ error: 'Missing userId' })

  const supabase = createClient(supaUrl, svcKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: prof, error } = await supabase
    .from('profiles')
    .select('stripe_customer_id, email')
    .eq('id', userId)
    .maybeSingle()

  if (error)               return res.status(500).json({ error: error.message })
  if (!prof?.stripe_customer_id) {
    return res.status(404).json({ error: 'no_customer', message: 'No Stripe customer on file. Subscribe first.' })
  }

  const stripe = new Stripe(secret, { apiVersion: '2024-06-20' })
  try {
    const portal = await stripe.billingPortal.sessions.create({
      customer: prof.stripe_customer_id,
      return_url: `${siteUrl}/subscription`,
    })
    return res.status(200).json({ url: portal.url })
  } catch (err) {
    console.error('[customer-portal] error:', err)
    return res.status(500).json({ error: err.message || 'Stripe error' })
  }
}
