import { expect, test } from '@playwright/test';

const apiBase = (process.env.E2E_API_BASE_URL ?? 'http://localhost:8080/api/v1').replace(/\/$/, '');
const patientEmail = process.env.E2E_PATIENT_EMAIL ?? 'shubham@gmail.com';
const patientPassword = process.env.E2E_PATIENT_PASSWORD ?? 'Kadam@123';
const hospitalQuery = process.env.E2E_HOSPITAL_QUERY ?? 'Health360';

test.describe('OPD golden path (patient → queue)', () => {
  test('API wake endpoint responds', async ({ request }) => {
    const awake = await request.get(`${apiBase}/health/awake`);
    expect(awake.status(), 'health/awake should be 204 or 200').toBeGreaterThanOrEqual(200);
    expect(awake.status()).toBeLessThan(300);

    const health = await request.get(`${apiBase}/health`);
    expect(health.ok()).toBeTruthy();
    const body = await health.json();
    expect(body.status ?? body.data?.status).toBeTruthy();
  });

  test('patient can request OPD and see My OPD status', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();

    await page.getByLabel(/^email$/i).fill(patientEmail);
    await page.getByLabel(/^password$/i).fill(patientPassword);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Consent gate or patient dashboard
    await page.waitForURL(/\/patient\//, { timeout: 30_000 });
    await page.getByRole('status', { name: /loading/i }).waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => undefined);

    if (page.url().includes('/patient/consent')) {
      const accept = page.getByRole('button', { name: /accept|agree|continue|save/i });
      if (await accept.isVisible().catch(() => false)) {
        await accept.click();
        await page.waitForURL(/\/patient\//, { timeout: 15_000 });
      }
    }

    await page.goto('/patient/request-opd');
    await expect(page.getByRole('heading', { name: /request opd/i })).toBeVisible();

    const hospitalInput = page.getByRole('combobox', { name: /^hospital$/i });
    await hospitalInput.click();
    await hospitalInput.fill(hospitalQuery);
    const option = page.getByRole('option').filter({ hasText: new RegExp(hospitalQuery, 'i') }).first();
    await expect(option).toBeVisible({ timeout: 20_000 });
    await option.click();

    await expect(page.getByText(/selected:/i)).toBeVisible({ timeout: 15_000 });

    // Branch auto-selects primary when loaded; wait until submit is enabled (hospital + branch set).
    const submit = page.getByRole('button', { name: /submit opd request/i });
    await expect(submit).toBeEnabled({ timeout: 30_000 });

    await page.getByLabel(/reason for visit/i).fill('Phase A Playwright smoke — fever check');
    await submit.click();

    await page.waitForURL(/\/patient\/opd/, { timeout: 30_000 });
    await expect(page.getByText(/my opd|queue|waiting|called|token|position|visit/i).first()).toBeVisible({
      timeout: 20_000,
    });
  });
});
