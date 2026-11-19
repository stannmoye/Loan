import { expect, test, type Page } from "@playwright/test";

async function openSection(page: Page, label: string) {
  const openNavigation = page.getByRole("button", { name: "Open navigation" });
  if (await openNavigation.isVisible()) await openNavigation.click();
  await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("button", { name: label, exact: true }).click();
}

test("customer overview renders its adviser image without horizontal overflow", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Good to see you." })).toBeVisible();

  const adviserImage = page.locator(".hero-visual img");
  await expect.poll(async () => adviserImage.evaluate((image) => {
    const element = image as HTMLImageElement;
    return element.complete && element.naturalWidth > 0;
  })).toBe(true);

  await expect(page.getByText(/illustrative preview — not a live account/i)).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("customer-overview.png"), fullPage: true });

  const hasHorizontalOverflow = await page.evaluate(() =>
    document.documentElement.scrollWidth > window.innerWidth
  );
  expect(hasHorizontalOverflow).toBe(false);
});

test("customer sections are navigable and the finance library exposes all planned types", async ({ page }) => {
  await page.goto("/");
  await openSection(page, "Explore loans");
  await expect(page.getByRole("heading", { name: "Understand your options." })).toBeVisible();
  await expect(page.getByText("19 categories · 66 planned product types")).toBeVisible();
  await expect(page.locator(".explore-card")).toHaveCount(19);

  await openSection(page, "My applications");
  await expect(page.getByRole("heading", { name: "Follow your application." })).toBeVisible();

  await openSection(page, "My loans");
  await expect(page.getByRole("heading", { name: "No loan accounts are connected." })).toBeVisible();
  await expect(page.getByText(/does not hold or display real loans, balances/i)).toBeVisible();

  await openSection(page, "Documents");
  await expect(page.getByRole("heading", { name: "Know what may be needed." })).toBeVisible();
  await expect(page.getByRole("button", { name: /upload unavailable/i })).toBeDisabled();
});

test("category details can be searched and opened", async ({ page }) => {
  await page.goto("/customer/explore");
  await page.getByRole("textbox", { name: /search finance categories/i }).fill("HELOC");
  await expect(page.locator(".explore-card")).toHaveCount(1);
  await page.getByRole("button", { name: /what should i compare/i }).click();
  const guide = page.getByRole("dialog");
  await expect(guide.getByRole("heading", { name: "Home finance" })).toBeVisible();
  await expect(guide.getByText(/home equity line of credit/i)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("mobile navigation opens, follows a section and closes", async ({ page }) => {
  await page.goto("/");
  const openNavigation = page.getByRole("button", { name: "Open navigation" });
  if (!(await openNavigation.isVisible())) test.skip();
  await openNavigation.click();
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
  await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("button", { name: "Help centre", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Clear answers. Considered support." })).toBeVisible();
  await expect(page.locator(".sidebar")).not.toHaveClass(/sidebar-open/);
  const hasHorizontalOverflow = await page.evaluate(() =>
    document.documentElement.scrollWidth > window.innerWidth
  );
  expect(hasHorizontalOverflow).toBe(false);
});
