import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.E2E_BASE_URL || 'http://localhost:5173'

function resolveWebServer() {
  if (process.env.E2E_PREVIEW === '1') {
    return {
      command: 'npm run preview -- --host 127.0.0.1 --port 4173',
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    }
  }
  if (process.env.E2E_BASE_URL) return undefined
  return {
    command: 'npm run dev -- --host 127.0.0.1 --port 5173',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'ready in',
  }
}

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL,
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: resolveWebServer(),
})
