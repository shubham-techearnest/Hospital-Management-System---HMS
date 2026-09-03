import { defineConfig, devices } from '@playwright/test';

/**
 * Phase A5 — OPD smoke / golden-path UI tests.
 *
 * Defaults assume local Vite + API:
 *   WEB: http://localhost:5173
 *   API: http://localhost:8080/api/v1
 *
 * Override with:
 *   E2E_BASE_URL, E2E_API_BASE_URL, E2E_PATIENT_EMAIL, E2E_PATIENT_PASSWORD
 */
const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:5173';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
