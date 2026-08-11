// Regression test for the footer "Договір публічної оферти" link + the offer page.
// Previously the link was a dead href="#" on every page; it now points to a real
// offer.html built from the Figma legal text.
const { test, expect } = require("@playwright/test");

const ALL_PAGES = [
  "index.html",
  "frozen_cake.html",
  "la_kartople.html",
  "la_kartople_new.html",
  "la_kartople_bundle.html",
  "bento.html",
];

test("every page footer links to offer.html (not a dead #)", async ({ page }) => {
  for (const p of ALL_PAGES) {
    await page.goto("/" + p);
    await expect(page.locator(".footer__offer")).toHaveAttribute("href", "offer.html");
  }
});

test("clicking the footer offer link opens the offer page", async ({ page }) => {
  await page.goto("/frozen_cake.html");
  await page.locator(".footer__offer").click();
  await expect(page).toHaveURL(/offer\.html$/);
  await expect(page.locator(".legal__title")).toContainText("Публічний договір");
});

test("offer.html renders all 21 sections with no horizontal overflow", async ({ page }) => {
  await page.goto("/offer.html");
  await expect(page.locator(".legal__sec h2")).toHaveCount(21);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
