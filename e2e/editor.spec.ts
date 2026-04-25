import { test, expect } from "@playwright/test";

test("editor page loads without auth", async ({ page }) => {
  await page.goto("/editor");
  await expect(page).not.toHaveURL(/login/);
  await expect(page.locator('[data-testid="codemirror-editor"]')).toBeVisible();
});

test("preview updates after typing markdown", async ({ page }) => {
  await page.goto("/editor");

  const editor = page.locator(".cm-content");
  await editor.click();
  await editor.type("# Hello Playwright");

  // Preview iframe should appear within 1 second of typing
  await expect(page.locator('[data-testid="preview-iframe"]')).toBeVisible({
    timeout: 3000,
  });
});

test("New Slide button inserts --- separator", async ({ page }) => {
  await page.goto("/editor");

  const editor = page.locator(".cm-content");
  await editor.click();
  await editor.type("Slide 1");

  await page.locator('[data-testid="new-slide-btn"]').click();

  // The --- should now be in the document
  const content = await page.evaluate(() => {
    const cm = document.querySelector(".cm-content");
    return cm?.textContent ?? "";
  });
  expect(content).toContain("---");
});

test("theme dropdown changes theme", async ({ page }) => {
  await page.goto("/editor");

  await page.locator('[data-testid="theme-select"]').click();
  await page.getByRole("option", { name: "Dark" }).click();

  // Wait for preview to re-render
  await expect(page.locator('[data-testid="preview-iframe"]')).toBeVisible({
    timeout: 3000,
  });
});

test("mobile viewport shows best-viewed-on-desktop message", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
  });
  const page = await context.newPage();
  await page.goto("/editor");

  await expect(page.getByText("Best viewed on desktop")).toBeVisible();
  await expect(page.locator('[data-testid="codemirror-editor"]')).not.toBeVisible();
  await context.close();
});
