import { test, expect } from '@playwright/test';

test.describe('Pars Governance - Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display Pars DAO homepage', async ({ page }) => {
    await expect(page).toHaveTitle(/PARS|Pars/i);
    await expect(page.locator('text=/Getting Started|Welcome|Pars/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display connect wallet button', async ({ page }) => {
    const connectButton = page.locator('button:has-text("Connect"), button:has-text("Connect Wallet"), [data-testid="connect-wallet"]').first();
    await expect(connectButton).toBeVisible({ timeout: 10000 });
  });

  test('should display featured DAOs section', async ({ page }) => {
    const featuredDAOs = page.locator('text=/Featured DAOs/i').first();
    await expect(featuredDAOs).toBeVisible({ timeout: 10000 });
  });

  test('should have Venture DAO in PARS-10 network', async ({ page }) => {
    const venturesCard = page.locator('text=/Venture DAO/i').first();
    await expect(venturesCard).toBeVisible({ timeout: 10000 });
  });

  test('should have Treasury DAO in PARS-10 network', async ({ page }) => {
    const treasuryCard = page.locator('text=/Treasury DAO/i').first();
    await expect(treasuryCard).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to Venture DAO page', async ({ page }) => {
    const venturesLink = page.locator('a[href="/dao-network/venture"]').first();
    await venturesLink.click();
    await expect(page).toHaveURL(/.*dao-network\/venture.*/);
  });

  test('should navigate to Health DAO page', async ({ page }) => {
    const healthLink = page.locator('a[href="/dao-network/health"]').first();
    await healthLink.click();
    await expect(page).toHaveURL(/.*dao-network\/health.*/);
  });

  test('should not have critical console errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('exports is not defined') &&
            !text.includes('Failed to resolve import') &&
            !text.includes('403') &&
            !text.includes('Failed to load resource')) {
          errors.push(text);
        }
      }
    });

    await page.goto('/');
    await page.waitForTimeout(3000);

    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('VITE_APP_') &&
      !e.includes('Service Worker')
    );

    expect(criticalErrors).toHaveLength(0);
  });
});
