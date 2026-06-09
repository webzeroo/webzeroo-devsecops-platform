const { test, expect } = require('@playwright/test');

test('Unauthenticated user is redirected to login', async ({ page }) => {
  // Try to access the admin dashboard directly
  await page.goto('/admin/dashboard');

  // Next.js protected route wrapper should instantly redirect back to login
  await expect(page).toHaveURL(/.*\//);

  // Verify the login form is shown
  await expect(page.locator('h2')).toHaveText('Welcome Back');
});

test('Unauthenticated user is redirected from learner portal', async ({ page }) => {
  // Try to access the learner dashboard directly
  await page.goto('/learner/dashboard');

  // Next.js protected route wrapper should instantly redirect back to login
  await expect(page).toHaveURL(/.*\//);

  // Verify the login form is shown
  await expect(page.locator('h2')).toHaveText('Welcome Back');
});
