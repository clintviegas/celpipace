import { test, expect } from '@playwright/test'

// Drives the cancellation reason modal end-to-end.
// Requires E2E_EMAIL / E2E_PASSWORD on a Premium-active test account
// (Stripe TEST mode strongly recommended — running in live mode acts on
// real subscriptions). Skips if env vars are missing so CI doesn't fail.

const E2E_EMAIL    = process.env.E2E_EMAIL
const E2E_PASSWORD = process.env.E2E_PASSWORD

test.skip(!E2E_EMAIL || !E2E_PASSWORD, 'E2E_EMAIL / E2E_PASSWORD not set — skipping')

test('user cancels with reason; modal closes; banner appears', async ({ page }) => {
  await page.goto('/')

  // Open the auth modal (Sign in button on Navbar)
  await page.getByRole('button', { name: /sign in/i }).first().click()
  await page.getByLabel(/email/i).fill(E2E_EMAIL)
  await page.getByLabel(/password/i).fill(E2E_PASSWORD)
  await page.getByRole('button', { name: /^sign in$/i }).click()

  // Land on /subscription
  await page.goto('/subscription')
  await expect(page.getByRole('heading', { name: /manage subscription/i })).toBeVisible()

  // Click Cancel subscription tile to open modal
  await page.getByRole('button', { name: /cancel subscription/i }).click()
  await expect(page.getByRole('heading', { name: /cancel your subscription/i })).toBeVisible()

  // Pick a reason
  await page.getByLabel(/too expensive/i).check()
  await page.getByPlaceholder(/what could we have done better/i).fill('e2e test run')
  await page.getByRole('button', { name: /^no$/i }).click() // would_return = false

  // Confirm — this hits /api/cancel-subscription
  await page.getByRole('button', { name: /confirm cancellation/i }).click()

  // Banner appears + modal closes
  await expect(page.getByText(/cancellation scheduled/i)).toBeVisible({ timeout: 15_000 })
  await expect(page.getByRole('heading', { name: /cancel your subscription/i })).toBeHidden()
})
