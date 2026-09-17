#!/usr/bin/env node
/**
 * Live checkout endpoint matrix test — writes NDJSON to debug log file.
 * Usage: node scripts/debug-checkout-live.mjs [baseUrl]
 */
import { appendFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const LOG_PATH = resolve(dirname(fileURLToPath(import.meta.url)), '../.cursor/debug-7c6ac0.log')
const BASE = (process.argv[2] || 'https://www.celpipace.ca').replace(/\/$/, '')
const SESSION_ID = '7c6ac0'
const RUN_ID = process.env.DEBUG_RUN_ID || 'pre-fix'

function log(hypothesisId, location, message, data) {
  const entry = JSON.stringify({
    sessionId: SESSION_ID,
    runId: RUN_ID,
    hypothesisId,
    location,
    message,
    data,
    timestamp: Date.now(),
  })
  appendFileSync(LOG_PATH, `${entry}\n`)
}

const FAKE_USER_ID = '00000000-0000-4000-8000-000000000099'
const FAKE_EMAIL = 'debug-test@example.com'

const CASES = [
  { name: 'weekly-no-coupon', plan: 'weekly', coupon: null, hypothesisId: 'H1', expectCheckout: true },
  { name: 'monthly-no-coupon', plan: 'monthly', coupon: null, hypothesisId: 'H1', expectCheckout: true },
  { name: 'annual-no-coupon', plan: 'annual', coupon: null, hypothesisId: 'H1', expectCheckout: true },
  { name: 'quarterly-alias', plan: 'quarterly', coupon: null, hypothesisId: 'H2', expectCheckout: true },
  { name: 'weekly-celpip50', plan: 'weekly', coupon: 'CELPIP50', hypothesisId: 'H3', expectCheckout: true },
  { name: 'monthly-celpip25', plan: 'monthly', coupon: 'CELPIP25', hypothesisId: 'H3', expectCheckout: true },
  { name: 'annual-celpip25', plan: 'annual', coupon: 'CELPIP25', hypothesisId: 'H3', expectCheckout: true },
  { name: 'monthly-celpip50-wrong-plan', plan: 'monthly', coupon: 'CELPIP50', hypothesisId: 'H3', expectError: 'coupon_weekly_only' },
  { name: 'invalid-plan', plan: 'lifetime', coupon: null, hypothesisId: 'H2', expectError: 'Invalid plan' },
  { name: 'missing-user', plan: 'monthly', coupon: null, skipUser: true, hypothesisId: 'H4', expectError: 'Missing user info' },
]

async function testCheckout(testCase) {
  const body = testCase.skipUser
    ? { plan: testCase.plan }
    : {
        plan: testCase.plan,
        userId: FAKE_USER_ID,
        email: FAKE_EMAIL,
        ...(testCase.coupon ? { couponCode: testCase.coupon } : {}),
      }

  const res = await fetch(`${BASE}/api/create-checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  let data = {}
  const text = await res.text()
  try { data = text ? JSON.parse(text) : {} } catch { data = { raw: text.slice(0, 200) } }

  const result = {
    case: testCase.name,
    plan: testCase.plan,
    coupon: testCase.coupon,
    status: res.status,
    ok: res.ok,
    error: data.error || null,
    message: data.message || null,
    hasUrl: !!data.url,
    sessionIdPrefix: data.id ? String(data.id).slice(0, 12) : null,
    expectCheckout: !!testCase.expectCheckout,
    expectError: testCase.expectError || null,
    passed: testCase.expectCheckout
      ? res.ok && !!data.url
      : testCase.expectError
        ? !res.ok && (data.error === testCase.expectError || data.message === testCase.expectError)
        : false,
  }

  log(testCase.hypothesisId, 'debug-checkout-live.mjs', `live test ${testCase.name}`, result)
  return result
}

async function testOtherEndpoints() {
  const portalRes = await fetch(`${BASE}/api/customer-portal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: FAKE_USER_ID }),
  })
  const portalData = await portalRes.json().catch(() => ({}))
  log('H4', 'debug-checkout-live.mjs', 'customer-portal probe', {
    status: portalRes.status,
    error: portalData.error || null,
  })

  const webhookRes = await fetch(`${BASE}/api/stripe-webhook`, { method: 'GET' })
  log('H4', 'debug-checkout-live.mjs', 'stripe-webhook probe', {
    status: webhookRes.status,
    methodAllowed: webhookRes.status === 405,
  })
}

console.log(`Testing checkout at ${BASE} → ${LOG_PATH}`)
log('ALL', 'debug-checkout-live.mjs', 'live test run started', { base: BASE, cases: CASES.length })

const results = []
for (const testCase of CASES) {
  results.push(await testCheckout(testCase))
}
await testOtherEndpoints()

const summary = {
  total: results.length,
  passed: results.filter(r => r.passed).length,
  checkoutReady: results.filter(r => r.expectCheckout && r.passed).length,
  checkoutTotal: results.filter(r => r.expectCheckout).length,
  guardrailsOk: results.filter(r => r.expectError && r.passed).length,
  guardrailsTotal: results.filter(r => r.expectError).length,
  failed: results.filter(r => !r.passed).length,
  errors: [...new Set(results.map(r => r.error).filter(Boolean))],
}
log('ALL', 'debug-checkout-live.mjs', 'live test run complete', summary)

console.log('\n=== CHECKOUT LIVE TEST SUMMARY ===')
for (const r of results) {
  const icon = r.passed ? '✓' : '✗'
  const label = r.expectError ? `(guardrail → ${r.expectError})` : (r.hasUrl ? '→ Stripe URL' : (r.error || 'no url'))
  console.log(`${icon} ${r.case}: HTTP ${r.status} ${label}`)
}
console.log(`\nCheckout sessions ready: ${summary.checkoutReady}/${summary.checkoutTotal}`)
console.log(`Validation guardrails OK: ${summary.guardrailsOk}/${summary.guardrailsTotal}`)
console.log(`Overall passed: ${summary.passed}/${summary.total}`)
if (summary.failed) {
  const failed = results.filter(r => !r.passed).map(r => r.case)
  console.log(`Unexpected failures: ${failed.join(', ') || 'none'}`)
}
