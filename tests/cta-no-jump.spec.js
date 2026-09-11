// Buy CTAs go straight to checkout.
//
// The lead popup used to sit between every buy button and WayForPay, and its
// /api/lead round-trip left buyers waiting on a busy form. Now any trigger
// that carries a checkout URL in data-pay navigates to it on click; the lead
// modal opens only for offers without one.
const { test, expect } = require("@playwright/test");

const COURSE_PAGES = [
  "frozen_cake.html",
  "la_kartople.html",
  "la_kartople_new.html",
  "bento.html",
];

async function stubCheckout(page) {
  // Fonts, pixels and hero videos only slow the run down here. Routes match
  // last-registered-first, so the checkout stub below wins over the abort.
  await page.route(/^https?:\/\/(?!localhost|127\.0\.0\.1)/, (route) => route.abort());
  await page.route(/\.(mp4|webm)(\?|$)/, (route) => route.abort());
  await page.route("https://secure.wayforpay.com/**", async (route) => {
    await route.fulfill({ status: 200, contentType: "text/html", body: "Checkout" });
  });
}

// Centre the CTA so the sticky buy bar at the bottom edge cannot cover it.
async function centre(locator) {
  await locator.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
}

for (const p of COURSE_PAGES) {
  test(`${p}: every buy CTA carries the page's checkout and opens it without the popup`, async ({ page }) => {
    await stubCheckout(page);
    await page.goto("/" + p);

    // One product per page → one checkout URL shared by every CTA on it.
    const payUrls = await page.locator("main [data-modal-open]").evaluateAll(
      (nodes) => nodes.map((n) => n.getAttribute("data-pay"))
    );
    expect(payUrls.length).toBeGreaterThan(0);
    for (const url of payUrls) expect(url).toMatch(/^https:\/\/secure\.wayforpay\.com\//);
    expect(new Set(payUrls).size, "all CTAs on a course page sell the same product").toBe(1);

    // The closing offer sits far below the fold — the click must leave the
    // popup closed and land on checkout.
    const cta = page.locator("main [data-modal-open]").last();
    await centre(cta);
    await Promise.all([page.waitForURL(payUrls[0]), cta.click()]);
    expect(page.url()).toBe(payUrls[0]);
  });
}

test("home: each catalog course opens its own checkout directly", async ({ page }) => {
  await stubCheckout(page);
  await page.goto("/index.html");

  const cta = page.locator('#courses .gh-card [data-modal-open][data-product*="Картопля"]').first();
  const checkoutUrl = await cta.getAttribute("data-pay");
  expect(checkoutUrl).toMatch(/^https:\/\/secure\.wayforpay\.com\//);

  await centre(cta);
  await Promise.all([page.waitForURL(checkoutUrl), cta.click()]);
  expect(page.url()).toBe(checkoutUrl);
  await expect(page.locator("#modal.is-open")).toHaveCount(0);
});

test("techcard buy CTA opens checkout", async ({ page }) => {
  await stubCheckout(page);
  await page.goto("/techcards.html");

  const cta = page.locator("main [data-modal-open][data-pay]").first();
  const checkoutUrl = await cta.getAttribute("data-pay");

  await Promise.all([page.waitForURL(checkoutUrl), cta.click()]);
  expect(page.url()).toBe(checkoutUrl);
});

test("bento CTA fires InitiateCheckout and Purchase on the course pixel before checkout", async ({ page }) => {
  await stubCheckout(page);
  await page.goto("/bento.html");
  // Hold the navigation so the pixel calls can be read from the page.
  await page.evaluate(() => {
    window.__pixelCalls = [];
    window.__checkout = "";
    window.fbq = (...args) => window.__pixelCalls.push(args);
    window.addEventListener("beforeunload", (e) => { e.preventDefault(); });
  });

  const cta = page.locator("main [data-pixel-event]").first();
  await expect(cta).toHaveAttribute("data-pixel-ids", "4349939475317293");
  await expect(cta).toHaveAttribute("data-pixel-value", "489");
  await expect(cta).toHaveAttribute("data-pixel-currency", "UAH");
  await expect(cta).toHaveAttribute("data-pay", "https://secure.wayforpay.com/button/b21d9a9270cc5");

  page.on("dialog", (d) => d.dismiss());
  await cta.click();
  await page.waitForTimeout(300);

  const calls = await page.evaluate(() => window.__pixelCalls);
  const events = calls.map((call) => [call[1], call[2], call[3]]);
  expect(events).toEqual([
    ["4349939475317293", "InitiateCheckout", { content_name: "Курс «Бенто торти від А до Я»", value: 489, currency: "UAH" }],
    ["4349939475317293", "Purchase", { content_name: "Курс «Бенто торти від А до Я»", value: 489, currency: "UAH" }],
  ]);
  await expect(page.locator("#modal.is-open")).toHaveCount(0);
});
