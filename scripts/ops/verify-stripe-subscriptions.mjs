/**
 * verify-stripe-subscriptions.mjs
 *
 * Checks the live Stripe subscription setup before taking more payments:
 * - weekly/monthly/annual price env vars exist
 * - each Stripe Price is active, recurring, and has the expected interval
 * - a webhook endpoint is enabled for /api/stripe-webhook with required events
 * - optional Supabase check: recent paid checkout sessions converted users to premium
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_live_xxx \
 *   STRIPE_PRICE_WEEKLY=price_xxx \
 *   STRIPE_PRICE_MONTHLY=price_xxx \
 *   STRIPE_PRICE_ANNUAL=price_xxx \
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=xxx \
 *   node scripts/verify-stripe-subscriptions.mjs
 */

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripeSecret = process.env.STRIPE_SECRET_KEY
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const requiredWebhookEvents = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_failed',
  'charge.refunded',
]

const plans = [
  { plan: 'weekly', env: 'STRIPE_PRICE_WEEKLY', expectedInterval: 'week' },
  { plan: 'monthly', env: 'STRIPE_PRICE_MONTHLY', expectedInterval: 'month' },
  { plan: 'annual', env: 'STRIPE_PRICE_ANNUAL', expectedInterval: 'year' },
]

const results = []

function pass(message) {
  results.push({ ok: true, message })
  console.log(`PASS  ${message}`)
}

function fail(message) {
  results.push({ ok: false, message })
  console.error(`FAIL  ${message}`)
}

function warn(message) {
  results.push({ ok: true, warning: true, message })
  console.warn(`WARN  ${message}`)
}

function cents(amount, currency) {
  if (typeof amount !== 'number') return 'unknown amount'
  return `${(amount / 100).toFixed(2)} ${String(currency || '').toUpperCase()}`
}

function stripeId(value) {
  return typeof value === 'string' ? value : value?.id || null
}

async function checkPrices(stripe) {
  console.log('\nChecking Stripe prices...')

  for (const item of plans) {
    const priceId = process.env[item.env]
    if (!priceId) {
      fail(`${item.env} is missing`)
      continue
    }

    try {
      const price = await stripe.prices.retrieve(priceId, { expand: ['product'] })
      const productName = typeof price.product === 'string' ? price.product : price.product?.name || price.product?.id

      if (!price.active) fail(`${item.plan}: ${price.id} is inactive`)
      else pass(`${item.plan}: ${price.id} is active`)

      if (price.type !== 'recurring') fail(`${item.plan}: ${price.id} is ${price.type}, expected recurring`)
      else pass(`${item.plan}: recurring price confirmed`)

      if (price.recurring?.interval !== item.expectedInterval) {
        fail(`${item.plan}: interval is ${price.recurring?.interval || 'missing'}, expected ${item.expectedInterval}`)
      } else {
        pass(`${item.plan}: interval ${item.expectedInterval} confirmed (${cents(price.unit_amount, price.currency)}, product ${productName})`)
      }

      if (price.livemode && !stripeSecret.startsWith('sk_live_') && !stripeSecret.startsWith('rk_live_')) {
        fail(`${item.plan}: live price is being checked with a non-live key`)
      }
      if (!price.livemode && (stripeSecret.startsWith('sk_live_') || stripeSecret.startsWith('rk_live_'))) {
        fail(`${item.plan}: test price is configured in live env var`)
      }
    } catch (err) {
      fail(`${item.plan}: cannot retrieve ${priceId}: ${err.message}`)
    }
  }
}

async function checkWebhookEndpoints(stripe) {
  console.log('\nChecking Stripe webhook endpoints...')

  try {
    const endpoints = await stripe.webhookEndpoints.list({ limit: 100 })
    const matches = endpoints.data.filter((endpoint) => endpoint.url?.includes('/api/stripe-webhook'))

    if (!matches.length) {
      fail('No Stripe webhook endpoint found for /api/stripe-webhook')
      return
    }

    for (const endpoint of matches) {
      if (endpoint.status !== 'enabled') {
        fail(`Webhook ${endpoint.id} is ${endpoint.status}: ${endpoint.url}`)
        continue
      }

      pass(`Webhook ${endpoint.id} is enabled: ${endpoint.url}`)
      const enabledEvents = endpoint.enabled_events || []
      const listensToAll = enabledEvents.includes('*')
      const missingEvents = requiredWebhookEvents.filter((event) => !listensToAll && !enabledEvents.includes(event))

      if (missingEvents.length) {
        fail(`Webhook ${endpoint.id} is missing events: ${missingEvents.join(', ')}`)
      } else {
        pass(`Webhook ${endpoint.id} listens for required subscription events`)
      }
    }
  } catch (err) {
    warn(`Could not list webhook endpoints with this key: ${err.message}`)
  }
}

async function findProfile(supabase, { userId, email, customerId, subscriptionId }) {
  const lookups = [
    userId && ['id', userId],
    subscriptionId && ['stripe_subscription_id', subscriptionId],
    customerId && ['stripe_customer_id', customerId],
    email && ['email', email],
  ].filter(Boolean)

  for (const [column, value] of lookups) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id,email,is_premium,current_plan,premium_source,subscription_status,stripe_customer_id,stripe_subscription_id,premium_expires_at')
      .eq(column, value)
      .maybeSingle()

    if (error) throw error
    if (data) return data
  }

  return null
}

async function checkRecentConversions(stripe) {
  console.log('\nChecking recent paid checkout sessions against Supabase...')

  if (!supabaseUrl || !supabaseServiceKey) {
    warn('Skipping Supabase conversion check because SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const sessions = await stripe.checkout.sessions.list({
    limit: 25,
    expand: ['data.subscription'],
  })

  const paidSubscriptionSessions = sessions.data.filter((session) => (
    session.mode === 'subscription' &&
    session.payment_status === 'paid' &&
    stripeId(session.subscription)
  ))

  if (!paidSubscriptionSessions.length) {
    warn('No recent paid subscription Checkout Sessions found in the last 25 sessions')
    return
  }

  for (const session of paidSubscriptionSessions) {
    const subscription = typeof session.subscription === 'string'
      ? await stripe.subscriptions.retrieve(session.subscription)
      : session.subscription
    const userId = session.metadata?.user_id || session.client_reference_id || null
    const email = session.customer_details?.email || session.customer_email || session.metadata?.email || null
    const customerId = stripeId(session.customer)
    const subscriptionId = stripeId(subscription)
    const expectedPlan = session.metadata?.plan || subscription?.metadata?.plan || null

    const profile = await findProfile(supabase, { userId, email, customerId, subscriptionId })
    const label = `${email || userId || customerId || session.id} (${session.id})`

    if (!profile) {
      fail(`${label}: paid in Stripe but no matching Supabase profile found`)
      continue
    }

    if (!profile.is_premium) {
      fail(`${label}: profile found but is_premium is false`)
      continue
    }

    if (expectedPlan && profile.current_plan !== expectedPlan) {
      fail(`${label}: current_plan is ${profile.current_plan}, expected ${expectedPlan}`)
      continue
    }

    if (!String(profile.premium_source || '').startsWith('stripe:')) {
      fail(`${label}: premium_source is ${profile.premium_source || 'empty'}, expected stripe:<plan>`)
      continue
    }

    if (subscriptionId && profile.stripe_subscription_id !== subscriptionId) {
      fail(`${label}: stripe_subscription_id mismatch, profile has ${profile.stripe_subscription_id || 'empty'}, expected ${subscriptionId}`)
      continue
    }

    pass(`${label}: converted to premium (${profile.current_plan}, ${profile.subscription_status}, expires ${profile.premium_expires_at || 'unknown'})`)
  }
}

async function main() {
  if (!stripeSecret) {
    fail('STRIPE_SECRET_KEY is missing')
    process.exit(1)
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' })

  await checkPrices(stripe)
  await checkWebhookEndpoints(stripe)
  await checkRecentConversions(stripe)

  const failures = results.filter((result) => !result.ok)
  const warnings = results.filter((result) => result.warning)
  console.log(`\nSummary: ${results.length - failures.length - warnings.length} passed, ${warnings.length} warnings, ${failures.length} failures`)

  if (failures.length) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})