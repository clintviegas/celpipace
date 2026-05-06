import { test, expect } from '@playwright/test'

// Smoke: site loads, SEO routes respond, legacy routes redirect.
// Safe to run against any environment (no Stripe / no signin).

test('homepage renders', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/CELPIPACE/i)
  await expect(page.locator('h1').first()).toBeVisible()
})

test('canonical SEO routes return 200', async ({ page }) => {
  for (const slug of ['celpip-listening-practice', 'celpip-reading-practice', 'celpip-writing-practice', 'celpip-speaking-practice']) {
    const res = await page.goto(`/${slug}`)
    expect(res?.status(), `expected /${slug} to be 200`).toBe(200)
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
