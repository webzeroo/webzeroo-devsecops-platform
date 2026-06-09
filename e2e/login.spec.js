const { test, expect } = require('@playwright/test');

test('Login page renders correctly', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/WebZero LMS/);

  // Expect the login heading
  await expect(page.locator('h2')).toHaveText('Welcome to WebZero');

  // Expect email and password inputs to be visible
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();

  // Expect the sign in button
  await expect(page.locator('button[type="submit"]')).toHaveText('Sign In');
});
