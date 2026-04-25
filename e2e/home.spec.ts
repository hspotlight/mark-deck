import { test, expect } from "@playwright/test";

test("hero headline is visible", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Write.");
  await expect(page.locator("h1")).toContainText("Preview.");
  await expect(page.locator("h1")).toContainText("Publish.");
});

test('"Start writing" CTA links to /editor', async ({ page }) => {
  await page.goto("/");
  const cta = page.getByRole("link", { name: "Start writing" });
  await expect(cta).toBeVisible();
  await expect(cta).toHaveAttribute("href", "/editor");
});

test('"Join waitlist" link navigates to /waitlist', async ({ page }) => {
  await page.goto("/");
  const links = page.getByRole("link", { name: "Join waitlist" });
  await expect(links.first()).toHaveAttribute("href", "/waitlist");
});
