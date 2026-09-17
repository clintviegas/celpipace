import { test, expect } from '@playwright/test'

// Smoke: site loads, SEO routes respond, legacy routes redirect.
// Safe to run against any environment (no Stripe / no signin).
// Default runner uses production preview (npm run e2e:smoke). Use e2e:smoke:dev for Vite HMR.

async function waitForAppReady(page) {
  await page.locator('.route-loader').waitFor({ state: 'detached', timeout: 20_000 }).catch(() => {})
}

test('homepage renders', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await waitForAppReady(page)
  await expect(page).toHaveTitle(/CELPIPACE/i)
  await expect(page.locator('h1').first()).toBeVisible()
  // Homepage defers desktop sections until idle; pricing is below the fold.
  const pricing = page.locator('#pricing, .pricing-section').first()
  await pricing.scrollIntoViewIfNeeded({ timeout: 20_000 })
  await expect(pricing).toBeVisible({ timeout: 20_000 })
})

test('pricing page renders', async ({ page }) => {
  const res = await page.goto('/pricing', { waitUntil: 'domcontentloaded' })
  expect(res?.status()).toBe(200)
  await waitForAppReady(page)
  const pricing = page.locator('.pricing-section, #pricing').first()
  await expect(pricing).toBeVisible({ timeout: 20_000 })
  await expect(page.getByRole('button', { name: /Continue with/i })).toBeVisible()
})

test('contact page renders', async ({ page }) => {
  const res = await page.goto('/contact', { waitUntil: 'domcontentloaded' })
  expect(res?.status()).toBe(200)
  await waitForAppReady(page)
  await expect(page.locator('form.contact-form, .contact-form form, form').first()).toBeVisible({ timeout: 20_000 })
})

test('canonical SEO routes return 200', async ({ page }) => {
  for (const slug of ['celpip-listening-practice', 'celpip-reading-practice', 'celpip-writing-practice', 'celpip-speaking-practice']) {
    await page.goto('about:blank')
    const res = await page.goto(`/${slug}`, { waitUntil: 'domcontentloaded' })
    expect(res?.status(), `expected /${slug} to be 200`).toBe(200)
    await waitForAppReady(page)
    await expect(page).toHaveURL(new RegExp(`/${slug}(\\?|$)`))
    await expect(page).toHaveTitle(new RegExp(slug.replace(/-/g, '|'), 'i'))
  }
})

test('legacy short routes 301-redirect to canonical', async ({ request }) => {
  const pairs = [
    ['/writing',   '/celpip-writing-practice'],
    ['/speaking',  '/celpip-speaking-practice'],
    ['/reading',   '/celpip-reading-practice'],
    ['/listening', '/celpip-listening-practice'],
  ]
  for (const [from, to] of pairs) {
    const res = await request.fetch(from, { maxRedirects: 0, failOnStatusCode: false })
    // Vercel returns 308 by default for permanent: true unless overridden;
    // accept 301 or 308 — both are permanent redirects to Google.
    expect([301, 308]).toContain(res.status())
    expect(res.headers()['location']).toBe(to)
  }
})
