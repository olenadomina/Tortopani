const { test, expect } = require("@playwright/test");

const HOME = "/index.html";
const RESPONSIVE_WIDTHS = [320, 390, 768, 1440];

async function openImplementedRoute(page) {
  const response = await page.goto(HOME);
  const status = response ? response.status() : 0;
  test.skip(status !== 200, `${HOME} is not implemented yet (HTTP ${status || "no response"})`);
  await page.evaluate(() => document.fonts && document.fonts.ready);
  return response;
}

test("Green Hub home exposes the live, noindex hub contract", async ({ page }) => {
  const response = await page.goto(HOME);
  expect(response, "the Green Hub home must return a response").not.toBeNull();
  expect(response.status(), "the Green Hub home must exist").toBe(200);

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /^(?=.*\bnoindex\b)(?=.*\bnofollow\b).+$/i
  );

  const heading = page.locator("h1");
  await expect(heading, "the page needs exactly one page-level heading").toHaveCount(1);
  await expect(heading).toBeVisible();

  const logo = page.locator('header img[src$="assets/logo_hor.png"]');
  await expect(logo, "the original horizontal TORTOPANI lockup must be used once").toHaveCount(1);
});

test("the hero photograph loads and the copy stays inside the scrim", async ({ page }) => {
  await openImplementedRoute(page);

  const heroPhoto = page.locator(".gh-hero__photo img");
  await expect(heroPhoto, "the hero must expose one author photograph").toHaveCount(1);
  await expect(heroPhoto).toBeVisible();
  expect(
    (await heroPhoto.getAttribute("alt")).trim().length,
    "the author photograph needs a descriptive alt text"
  ).toBeGreaterThan(10);
  const loaded = await heroPhoto.evaluate((img) => img.complete && img.naturalWidth > 0);
  expect(loaded, "the hero photograph must actually load").toBe(true);

  // The photograph is meant to be replaced by a real shoot later. Legibility
  // must survive that swap, so the copy has to stay inside the part of the
  // scrim that is still near-opaque — the left half of the hero.
  await expect(page.locator(".gh-hero__scrim")).toHaveCount(1);
  const withinScrim = await page.evaluate(() => {
    const hero = document.querySelector(".gh-hero").getBoundingClientRect();
    const copy = document.querySelector(".gh-hero__copy").getBoundingClientRect();
    return (copy.right - hero.left) / hero.width;
  });
  expect(withinScrim, "hero copy must not run past the opaque half of the scrim").toBeLessThan(0.5);
});

test("the hero proposition, lead and primary action fit the first mobile screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openImplementedRoute(page);

  const lead = page.locator(".gh-hero__lead");
  await expect(lead, "the hero must carry a supporting sentence, not only a headline").toBeVisible();
  const leadSize = await lead.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(leadSize, "hero body copy must not drop below 16px").toBeGreaterThanOrEqual(16);

  const cta = page.locator(".gh-hero__actions .btn").first();
  await expect(cta).toBeVisible();
  const box = await cta.boundingBox();
  expect(box.y + box.height, "the primary hero action must sit above the mobile fold").toBeLessThan(844);
  expect(box.height, "the primary action needs a comfortable touch target").toBeGreaterThanOrEqual(44);
});

test("the catalog is the first section after the hero and every course is reachable", async ({ page }) => {
  await openImplementedRoute(page);

  // A hub's job is to let visitors pick, so only the hero, the figures band
  // and the monthly offer may come before the catalog.
  const catalogIndex = await page.evaluate(() =>
    [...document.querySelectorAll("main > section")].findIndex((s) => s.id === "courses")
  );
  expect(catalogIndex, "the catalog must be found in main").toBeGreaterThan(-1);
  expect(catalogIndex, "the catalog must stay near the top of the page").toBeLessThanOrEqual(3);

  // The bento course sits in its own announcement panel above the grid rather
  // than in the buy-me cards, but it sells like them: a price, a checkout
  // button and a link through to its page.
  await expect(page.locator("#courses .gh-launch")).toHaveCount(1);
  await expect(page.locator("#courses .gh-launch .ed-price__new")).toBeVisible();
  await expect(page.locator("#courses .gh-launch [data-modal-open][data-pay]")).toBeVisible();
  await expect(page.locator('#courses .gh-launch a[href="bento.html"]')).toBeVisible();

  // Every course in the catalog — the panel and the three cards — opens the
  // order modal with a checkout URL of its own.
  const payUrls = await page.locator("#courses [data-modal-open][data-pay]").evaluateAll(
    (nodes) => nodes.map((n) => n.getAttribute("data-pay"))
  );
  expect(payUrls, "each catalog course carries its own checkout").toHaveLength(4);
  expect(new Set(payUrls).size, "checkout URLs must not be shared").toBe(4);
  const cards = page.locator("#courses .gh-card");
  await expect(cards, "the catalog lists every purchasable course").toHaveCount(3);

  for (const href of ["frozen_cake.html", "la_kartople.html", "la_kartople_new.html"]) {
    await expect(
      page.locator(`#courses a[href="${href}"]`).first(),
      `the catalog must link to ${href}`
    ).toBeVisible();
    const status = (await page.request.get(`/${href}`)).status();
    expect(status, `${href} must resolve`).toBe(200);
  }
  expect((await page.request.get("/bento.html")).status(), "bento.html must resolve").toBe(200);
});

test("no horizontal overflow at any supported width", async ({ page }) => {
  await openImplementedRoute(page);

  for (const width of RESPONSIVE_WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(250);
    const overflow = await page.evaluate(
      (vw) => document.documentElement.scrollWidth > vw + 1,
      width
    );
    expect(overflow, `the page must not scroll sideways at ${width}px`).toBe(false);
  }
});

test("site stays Ukrainian; mobile menu and the lead modal keep working", async ({ page }) => {
  const consoleErrors = [];
  page.on("console", (msg) => msg.type() === "error" && consoleErrors.push(msg.text()));
  page.on("pageerror", (error) => consoleErrors.push(String(error)));

  await page.setViewportSize({ width: 390, height: 844 });
  await openImplementedRoute(page);

  // Language switch is temporarily disabled — UA only
  await expect(page.locator("html")).toHaveAttribute("lang", "uk");
  await expect(page.locator(".lang-switch")).toHaveCount(0);

  // Burger opens, Escape closes
  const burger = page.locator("#burger");
  await burger.click();
  await expect(page.locator("#navLinks")).toHaveClass(/is-open/);
  await page.keyboard.press("Escape");
  await expect(page.locator("#navLinks")).not.toHaveClass(/is-open/);

  // A course CTA carries its product into the modal
  const orderButton = page.locator("#monthly [data-modal-open]").first();
  await orderButton.scrollIntoViewIfNeeded();
  await orderButton.click();
  const modal = page.locator("#modal");
  await expect(modal).toHaveClass(/is-open/);
  await expect(page.locator("#leadProduct")).toHaveValue(/Картопля|Kartoplia/);
  await page.keyboard.press("Escape");
  await expect(modal).not.toHaveClass(/is-open/);

  expect(consoleErrors, "the page must not log runtime errors").toEqual([]);
});
