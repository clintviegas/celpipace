#!/usr/bin/env node
// scripts/test-billing-logic.mjs
//
// Offline tests for the pure logic in the billing pipeline — no secrets, no
// network, no database. Runs in CI.
//
// The DB-level guarantees (claim exclusivity, lease reclaim, effect uniqueness,
// outbox dedupe) are enforced by Postgres constraints and were verified against
// the live database; those are not re-testable here. What IS testable here is
// the mapping and scheduling logic, which is where a silent wrong answer would
// hide.
//
// Run: node scripts/test-billing-logic.mjs

import { subscriptionToProfilePatch, normalizePlanSlug, invoiceSubscriptionId, stripeTimeToIso } from '../api/_lib/billing.js'
import { backoffSeconds, MAX_ATTEMPTS } from '../api/_lib/inbox.js'

let passed = 0
const failures = []

function check(name, actual, expected) {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  if (a === e) { passed++; return }
  failures.push(`${name}\n    expected: ${e}\n    actual:   ${a}`)
}

function ok(name, condition, detail = '') {
  if (condition) { passed++; return }
  failures.push(`${name}${detail ? `\n    ${detail}` : ''}`)
}

const HOUR = 3600
const now = Math.floor(Date.now() / 1000)

function sub(overrides = {}) {
  return {
    id: 'sub_test',
    status: 'active',
    current_period_start: now,
    current_period_end: now + 7 * 24 * HOUR,
    cancel_at_period_end: false,
    items: { data: [{ price: { id: 'price_unknown' } }] },
    metadata: {},
    ...overrides,
  }
}

// ── Plan resolution ─────────────────────────────────────────────────────────
check('quarterly aliases to annual', normalizePlanSlug('quarterly'), 'annual')
check('case and whitespace tolerated', normalizePlanSlug('  Weekly '), 'weekly')
check('unknown plan yields empty', normalizePlanSlug('lifetime'), '')
check('null plan yields empty', normalizePlanSlug(null), '')

check('metadata plan is used when price is unknown',
  subscriptionToProfilePatch(sub({ metadata: { plan: 'monthly' } })).current_plan, 'monthly')
check('explicit fallback is used when nothing else resolves',
  subscriptionToProfilePatch(sub(), 'annual').current_plan, 'annual')
check('falls back to the generic premium bucket',
  subscriptionToProfilePatch(sub()).current_plan, 'premium')

// ── Status mapping + entitlement ────────────────────────────────────────────
// past_due must keep access: dunning should not lock a paying customer out.
for (const [stripeStatus, expectedStatus, expectedPremium] of [
  ['active',              'active',     true ],
  ['trialing',            'trialing',   true ],
  ['past_due',            'past_due',   true ],
  ['canceled',            'canceled',   false],
  ['unpaid',              'expired',    false],
  ['incomplete',          'incomplete', false],
  // Checkout started, payment never completed, Stripe gave up. Must NOT grant
  // premium — this fell through an `else` to 'active' until 2026-08-06.
  ['incomplete_expired',  'expired',    false],
  ['paused',              'expired',    false],
  // Unknown/future statuses fail closed rather than handing out the product.
  ['some_future_status',  'expired',    false],
]) {
  const patch = subscriptionToProfilePatch(sub({ status: stripeStatus }))
  check(`status ${stripeStatus} -> ${expectedStatus}`, patch.subscription_status, expectedStatus)
  check(`status ${stripeStatus} premium=${expectedPremium}`, patch.is_premium, expectedPremium)
}

// A cancelled-at-period-end subscription keeps access until the period ends;
// Stripe only sends customer.subscription.deleted at the boundary.
const pending = subscriptionToProfilePatch(sub({ cancel_at_period_end: true }))
ok('cancel_at_period_end keeps premium until the period ends', pending.is_premium === true)
check('cancel_at_period_end is recorded', pending.cancel_at_period_end, true)

// Non-premium states must drop the plan to free, or the UI shows a paid tier.
check('expired subscription drops plan to free',
  subscriptionToProfilePatch(sub({ status: 'canceled', metadata: { plan: 'weekly' } })).current_plan, 'free')

// ── Period fields ───────────────────────────────────────────────────────────
const periods = subscriptionToProfilePatch(sub())
check('premium_expires_at tracks current_period_end',
  periods.premium_expires_at, periods.current_period_end)
ok('period end is an ISO string', typeof periods.current_period_end === 'string')

// Newer Stripe API versions moved the period onto the subscription item.
const itemLevel = subscriptionToProfilePatch({
  ...sub(), current_period_start: null, current_period_end: null,
  items: { data: [{ price: { id: 'p' }, current_period_start: now, current_period_end: now + HOUR }] },
})
ok('falls back to item-level period fields', itemLevel.current_period_end !== null)

check('null epoch yields null', stripeTimeToIso(null), null)

// ── Invoice subscription extraction (three known Stripe shapes) ─────────────
check('invoice.subscription as string',
  invoiceSubscriptionId({ subscription: 'sub_a' }), 'sub_a')
check('invoice.subscription as object',
  invoiceSubscriptionId({ subscription: { id: 'sub_b' } }), 'sub_b')
check('invoice.parent.subscription_details',
  invoiceSubscriptionId({ parent: { subscription_details: { subscription: 'sub_c' } } }), 'sub_c')
check('invoice line item parent',
  invoiceSubscriptionId({ lines: { data: [{ parent: { subscription_item_details: { subscription: 'sub_d' } } }] } }), 'sub_d')
check('one-off invoice has no subscription', invoiceSubscriptionId({}), null)

// ── Retry backoff ───────────────────────────────────────────────────────────
let previous = 0
for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  const delay = backoffSeconds(attempt)
  ok(`backoff attempt ${attempt} grows`, delay > previous, `got ${delay}, previous ${previous}`)
  ok(`backoff attempt ${attempt} is capped at 1h`, delay <= 3600, `got ${delay}`)
  previous = delay
}
ok('backoff is jittered', new Set(
  Array.from({ length: 20 }, () => backoffSeconds(3))
).size > 1, 'all 20 samples identical — jitter is not applied')

// ── Report ──────────────────────────────────────────────────────────────────
if (failures.length) {
  console.error(`\n\x1b[31m✖ ${failures.length} failing\x1b[0m  (${passed} passed)\n`)
  failures.forEach(f => console.error(`  • ${f}\n`))
  process.exit(1)
}
console.log(`✓ billing logic: ${passed} assertions passed`)
