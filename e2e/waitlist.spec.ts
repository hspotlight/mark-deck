import { test, expect } from "@playwright/test";

test("valid email submission shows confirmation", async ({ page }) => {
  await page.goto("/waitlist");
  await page.locator('[data-testid="email-input"]').fill("test@example.com");
  await page.locator('[data-testid="waitlist-submit"]').click();
  await expect(page.locator('[data-testid="waitlist-success"]')).toBeVisible({
    timeout: 5000,
  });
});

test("invalid email format is blocked", async ({ page }) => {
  await page.goto("/waitlist");
  const input = page.locator('[data-testid="email-input"]');
  await input.fill("not-an-email");
  await page.locator('[data-testid="waitlist-submit"]').click();
  // HTML5 validation prevents submission — success message should NOT appear
  await expect(page.locator('[data-testid="waitlist-success"]')).not.toBeVisible();
});

test("empty form submission is blocked", async ({ page }) => {
  await page.goto("/waitlist");
  await page.locator('[data-testid="waitlist-submit"]').click();
  await expect(page.locator('[data-testid="waitlist-success"]')).not.toBeVisible();
});
