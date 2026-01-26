import { test, expect } from '@playwright/test';

test.describe('Cyrus Governance - Ventures Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ventures');
    await page.waitForLoadState('networkidle');
  });

  test('should display ventures page title', async ({ page }) => {
    const title = page.locator('text=/Venture DAO/i').first();
    await expect(title).toBeVisible({ timeout: 10000 });
  });

  test('should display page subtitle', async ({ page }) => {
    const subtitle = page.locator('text=/Invest in projects/i').first();
    await expect(subtitle).toBeVisible({ timeout: 10000 });
  });

  test('should show partner CTA card', async ({ page }) => {
    const partnerCard = page.locator('text=/Partner with Cyrus Foundation/i').first();
    await expect(partnerCard).toBeVisible({ timeout: 10000 });
  });

  test('should show invest via bonds CTA card', async ({ page }) => {
    const investCard = page.locator('text=/Invest via Protocol Bonds/i').first();
    await expect(investCard).toBeVisible({ timeout: 10000 });
  });

  test('should show token gate badge', async ({ page }) => {
    const badge = page.locator('text=/1M.*CYRUS.*Required/i').first();
    await expect(badge).toBeVisible({ timeout: 10000 });
  });

  test('should show active ventures section', async ({ page }) => {
    const section = page.locator('text=/Active Ventures/i').first();
    await expect(section).toBeVisible({ timeout: 10000 });
  });

  test('should show empty state when no ventures', async ({ page }) => {
    const emptyState = page.locator('text=/No Active Ventures/i').first();
    await expect(emptyState).toBeVisible({ timeout: 10000 });
  });

  test('should show on-chain data info notice', async ({ page }) => {
    const notice = page.locator('text=/on-chain contracts/i').first();
    await expect(notice).toBeVisible({ timeout: 10000 });
  });

  test('bonds link should navigate to bonds page', async ({ page }) => {
    const bondsLink = page.locator('a[href="/bonds"]').first();
    await bondsLink.click();
    await expect(page).toHaveURL(/.*bonds.*/);
  });

  test('should show token gate overlay when wallet not connected', async ({ page }) => {
    // Token gate overlay should show requiring 1M CYRUS
    const overlay = page.locator('text=/Investor Access Required/i');
    await expect(overlay).toBeVisible({ timeout: 10000 });
  });

  test('should show get CYRUS button in token gate', async ({ page }) => {
    const getCyrusButton = page.locator('text=/Get CYRUS/i').first();
    await expect(getCyrusButton).toBeVisible({ timeout: 10000 });
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

    await page.goto('/ventures');
    await page.waitForTimeout(3000);

    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('VITE_APP_')
    );

    expect(criticalErrors).toHaveLength(0);
  });
});
