const { test, expect } = require('@playwright/test');

test.describe('Authentication Flows', () => {
  test('Login page renders correctly', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/WebZero LMS/);
    await expect(page.locator('h2')).toHaveText('Welcome Back');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toHaveText('Sign In');
  });

  test('Shows error message with invalid credentials (Negative Test)', async ({ page }) => {
    await page.goto('/');

    // Fill the login form with fake data
    await page.locator('input[type="email"]').fill('hacker@fake.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    
    // Attempt to login
    await page.locator('button[type="submit"]').click();

    // Verify the error banner appears in the UI
    const errorBanner = page.locator('.error-banner');
    await expect(errorBanner).toBeVisible();
  });
});
