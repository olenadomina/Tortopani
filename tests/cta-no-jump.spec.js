// Regression test for the buy-CTA bug.
//
// Every buy button is `<a href="#" data-modal-open>`. The click handler opens the
// lead modal but historically did NOT call preventDefault(), so the href="#"
// default action also jumped the page to the very top on every click — and
// focus() inside the modal could scroll the page too.
//
// Expected behaviour: clicking a buy CTA opens the modal and leaves the scroll
// position essentially where it was.
const { test, expect } = require("@playwright/test");

const COURSE_PAGES = [
  "frozen_cake.html",
  "la_kartople.html",
  "la_kartople_new.html",
  "la_kartople_bundle.html",
];

for (const page of COURSE_PAGES) {
  test(`${page}: buy CTA opens modal without jumping the page to top`, async ({ page: pg }) => {
    await pg.goto("/" + page);
    // Deterministic measurements: kill smooth scrolling.
    await pg.addStyleTag({
      content: "html{scroll-behavior:auto !important}*,*::before,*::after{animation:none!important;transition:none!important}",
    });

    // Use the LAST in-flow buy CTA — the closing offer. The assertion below
    // needs the button to sit well below the fold to be meaningful, and the
    // first CTA now lives in the hero on the rebuilt pages.
    const cta = pg.locator("main [data-modal-open]").last();
    await cta.scrollIntoViewIfNeeded();
    await pg.waitForTimeout(100);

    const before = await pg.evaluate(() => Math.round(window.scrollY));
    expect(before, "CTA should sit well below the top of the page").toBeGreaterThan(300);

    await cta.click();
    await pg.waitForTimeout(150);

    const after = await pg.evaluate(() => Math.round(window.scrollY));
    const modalOpen = await pg.evaluate(() =>
      document.getElementById("modal").classList.contains("is-open")
    );

    expect(modalOpen, "lead modal should open").toBe(true);
    expect(
      Math.abs(after - before),
      `page must not jump (was ${before}, became ${after})`
    ).toBeLessThan(80);
  });
}

test("home course CTA with a payment URL still opens the lead modal", async ({ page }) => {
  await page.goto("/index.html");

  const cta = page.locator("#monthly [data-modal-open]").first();
  await expect(cta).not.toHaveAttribute("data-direct-checkout", "");
  await cta.click();

  await expect(page.locator("#modal")).toHaveClass(/is-open/);
  await expect(page.locator("#leadProduct")).toHaveValue(/Картопля/);
  expect(page.url()).toMatch(/\/index\.html$/);
});

test("techcard buy CTA skips the lead modal and opens checkout", async ({ page }) => {
  await page.route("https://secure.wayforpay.com/**", async (route) => {
    await route.fulfill({ status: 200, contentType: "text/html", body: "Checkout" });
  });
  await page.goto("/techcards.html");

  const cta = page.locator("main [data-direct-checkout]").first();
  const checkoutUrl = await cta.getAttribute("data-pay");

  await Promise.all([
    page.waitForURL(checkoutUrl),
    cta.click(),
  ]);

  expect(page.url()).toBe(checkoutUrl);
});

test("bundle popup preserves InitiateCheckout and Purchase pixel events", async ({ page }) => {
  await page.route("**/api/lead", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
  await page.goto("/la_kartople_bundle.html");
  await page.evaluate(() => {
    window.__pixelCalls = [];
    window.__openedCheckout = "";
    window.fbq = (...args) => window.__pixelCalls.push(args);
    window.open = (url) => {
      window.__openedCheckout = url;
      return { opener: window };
    };
  });

  const cta = page.locator("main [data-pixel-event]").first();
  await expect(cta).toHaveAttribute("data-pixel-ids", "1657768735391830 2515900125583722");
  await expect(cta).toHaveAttribute("data-pixel-value", "499");
  await expect(cta).toHaveAttribute("data-pixel-currency", "UAH");
  await cta.click();
  await expect(page.locator("#modal")).toHaveClass(/is-open/);

  await page.locator('#leadForm [name="name"]').fill("Pixel Test");
  await page.locator('#leadForm [name="contact"]').fill("@pixel_test");
  await page.locator('#leadForm [type="submit"]').click();
  await expect(page.locator("#formSuccess")).toBeVisible();
  await page.waitForTimeout(500);

  const result = await page.evaluate(() => ({
    calls: window.__pixelCalls,
    checkout: window.__openedCheckout,
  }));
  const events = result.calls.map((call) => [call[1], call[2], call[3]]);

  expect(events).toContainEqual([
    "1657768735391830",
    "InitiateCheckout",
    { content_name: "Дві збірки «Картопля»", value: 499, currency: "UAH" },
  ]);
  expect(events).toContainEqual([
    "2515900125583722",
    "InitiateCheckout",
    { content_name: "Дві збірки «Картопля»", value: 499, currency: "UAH" },
  ]);
  expect(events).toContainEqual([
    "1657768735391830",
    "Purchase",
    { content_name: "Дві збірки «Картопля»", value: 499, currency: "UAH" },
  ]);
  expect(events).toContainEqual([
    "2515900125583722",
    "Purchase",
    { content_name: "Дві збірки «Картопля»", value: 499, currency: "UAH" },
  ]);
  expect(result.checkout).toBe("https://secure.wayforpay.com/button/baa7fa1e2c58f");
});
