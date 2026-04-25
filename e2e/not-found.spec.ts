import { test, expect } from "@playwright/test";

test("unknown route shows 404 message", async ({ page }) => {
  const response = await page.goto("/this-route-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByText("This page doesn't exist or was removed")
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Go to homepage" })).toBeVisible();
});

test("unknown nested route shows 404 message", async ({ page }) => {
  await page.goto("/nonexistent-user/nonexistent-slug");
  await expect(
    page.getByText("This page doesn't exist or was removed")
  ).toBeVisible();
});
