/**
 * backfill-autopayment.mjs
 *
 * One-time script: updates all active/trialing Stripe subscriptions to
 * save_default_payment_method: 'on_subscription' so auto-renewals work
 * without the user re-entering their payment details.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_live_xxx node scripts/backfill-autopayment.mjs
 *
 * Dry run (no changes made):
 *   STRIPE_SECRET_KEY=sk_live_xxx DRY_RUN=1 node scripts/backfill-autopayment.mjs
 */

import Stripe from 'stripe'

const secret = process.env.STRIPE_SECRET_KEY
if (!secret) {
  console.error('Error: STRIPE_SECRET_KEY env var is required.')
  process.exit(1)
}

const DRY_RUN = process.env.DRY_RUN === '1'
const stripe = new Stripe(secret, { apiVersion: '2024-06-20' })

let updated = 0
let skipped = 0
let failed  = 0

console.log(DRY_RUN ? '--- DRY RUN (no changes will be made) ---' : '--- LIVE RUN ---')

for await (const sub of stripe.subscriptions.list({
  status: 'all',
  limit: 100,
  expand: ['data.default_payment_method'],
})) {
  // Only process active or trialing subscriptions
  if (sub.status !== 'active' && sub.status !== 'trialing') {
    skipped++
    continue
  }

  const alreadySet =
    sub.payment_settings?.save_default_payment_method === 'on_subscription'

  if (alreadySet) {
    console.log(`SKIP  ${sub.id} (${sub.status}) — already configured`)
    skipped++
    continue
  }

  if (DRY_RUN) {
    console.log(`WOULD UPDATE  ${sub.id} (${sub.status})  customer=${sub.customer}`)
    updated++
    continue
  }

  try {
    await stripe.subscriptions.update(sub.id, {
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
    })
    console.log(`UPDATED  ${sub.id} (${sub.status})  customer=${sub.customer}`)
    updated++
  } catch (err) {
    console.error(`FAILED   ${sub.id}  ${err.message}`)
    failed++
  }
}

console.log(`\nDone. updated=${updated}  skipped=${skipped}  failed=${failed}`)
