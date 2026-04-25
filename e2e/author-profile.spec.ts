import { test, expect } from "@playwright/test";

// These tests require the Firebase emulator running with seeded data.

test("404 for non-existent username", async ({ page }) => {
  await page.goto("/nonexistent-user-xyz");
  await expect(
    page.getByText("This page doesn't exist or was removed")
  ).toBeVisible();
});

test("author profile shows display name, bio, and public decks only", async ({
  page,
}) => {
  // Assumes seed.ts creates seed-user with 2 public decks and 1 private deck
  await page.goto("/seed-user");

  await expect(page.locator('[data-testid="profile-name"]')).toBeVisible();

  const cards = page.locator('[data-testid="deck-card"]');
  await expect(cards).toHaveCount(2);
});

test("clicking a deck card navigates to the deck page", async ({ page }) => {
  await page.goto("/seed-user");

  const firstCard = page.locator('[data-testid="deck-card"]').first();
  const href = await firstCard.getAttribute("href");

  await firstCard.click();
  await expect(page).toHaveURL(new RegExp("/seed-user/"));
  expect(href).toBeTruthy();
});
