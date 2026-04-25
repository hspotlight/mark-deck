import { test, expect } from "@playwright/test";

// These tests require the Firebase emulator running with seeded data.
// Run: npm run emulators && npm run seed before running.

test("404 for non-existent deck slug", async ({ page }) => {
  await page.goto("/nonexistent-user/nonexistent-slug");
  await expect(
    page.getByText("This page doesn't exist or was removed")
  ).toBeVisible();
});

test("404 for private deck", async ({ page }) => {
  // Assumes seed.ts creates a private deck at /seed-user/private-deck
  await page.goto("/seed-user/private-deck");
  await expect(
    page.getByText("This page doesn't exist or was removed")
  ).toBeVisible();
});

test("public deck page shows title and iframe", async ({ page }) => {
  // Assumes seed.ts creates a public deck at /seed-user/test-deck
  await page.goto("/seed-user/test-deck");
  await expect(page.locator('[data-testid="deck-title"]')).toBeVisible();
  await expect(page.locator('[data-testid="deck-iframe"]')).toBeVisible();
});

test("copy link button writes URL to clipboard", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/seed-user/test-deck");

  await page.getByRole("button", { name: "Copy link" }).click();
  await expect(page.getByText("Copied!")).toBeVisible();

  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toContain("/seed-user/test-deck");
});
