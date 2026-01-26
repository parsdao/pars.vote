import { test, expect } from '@playwright/test';

test.describe('Cyrus Governance - Bonds Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/bonds');
    await page.waitForLoadState('networkidle');
  });

  test('should display bonds page header', async ({ page }) => {
    const header = page.locator('text=/Protocol Bonds/i').first();
    await expect(header).toBeVisible({ timeout: 10000 });
  });

  test('should display bonds description', async ({ page }) => {
    const description = page.locator('text=/OlympusDAO/i').first();
    await expect(description).toBeVisible({ timeout: 10000 });
  });

  test('should show on-chain info notice', async ({ page }) => {
    const notice = page.locator('text=/on-chain contracts/i').first();
    await expect(notice).toBeVisible({ timeout: 10000 });
  });

  test('should show available bonds section', async ({ page }) => {
    const section = page.locator('text=/Available Bonds/i').first();
    await expect(section).toBeVisible({ timeout: 10000 });
  });

  test('should show empty bonds state', async ({ page }) => {
    const emptyState = page.locator('text=/No Active Bonds/i').first();
    await expect(emptyState).toBeVisible({ timeout: 10000 });
  });

  test('should show how bonding works section', async ({ page }) => {
    const howItWorks = page.locator('text=/How Bonding Works/i').first();
    await expect(howItWorks).toBeVisible({ timeout: 10000 });
  });

  test('should show step 1 - deposit assets', async ({ page }) => {
    const step1 = page.locator('text=/Deposit Assets/i').first();
    await expect(step1).toBeVisible({ timeout: 10000 });
  });

  test('should show step 2 - receive discounted PARS', async ({ page }) => {
    const step2 = page.locator('text=/Receive Discounted PARS/i').first();
    await expect(step2).toBeVisible({ timeout: 10000 });
  });

  test('should show step 3 - vest and claim', async ({ page }) => {
    const step3 = page.locator('text=/Vest.*Claim/i').first();
    await expect(step3).toBeVisible({ timeout: 10000 });
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

    await page.goto('/bonds');
    await page.waitForTimeout(3000);

    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('VITE_APP_')
    );

    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('Cyrus Governance - Bonds Investment Flow', () => {
  test('should navigate from homepage to bonds', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click on bonds card in featured DAOs
    const bondsCard = page.locator('a[href="/bonds"]').first();
    await bondsCard.click();

    await expect(page).toHaveURL(/.*bonds.*/);
    await expect(page.locator('text=/Protocol Bonds/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate from ventures to bonds via CTA', async ({ page }) => {
    await page.goto('/ventures');
    await page.waitForLoadState('networkidle');

    // Click on invest via bonds CTA
    const investCTA = page.locator('a[href="/bonds"]').first();
    await investCTA.click();

    await expect(page).toHaveURL(/.*bonds.*/);
  });
});
