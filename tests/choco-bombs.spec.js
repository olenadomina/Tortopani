// The English «Картопля» landing for the foreign audience: short, one offer,
// every buy button straight to the USD WayForPay invoice.
const { test, expect } = require("@playwright/test");

const PAY = "https://secure.wayforpay.com/button/b0c4d81fa7e62";

test("choco_bombs.html is English, priced $70 → $19, and every buy goes to WayForPay", async ({ page }) => {
  await page.goto("/choco_bombs.html");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  const buys = page.locator("[data-pay]");
  expect(await buys.count()).toBeGreaterThanOrEqual(2);
  for (const href of await buys.evaluateAll((els) => els.map((e) => e.getAttribute("data-pay")))) {
    expect(href).toBe(PAY);
  }

  const hero = page.locator(".cb-hero");
  await expect(hero.locator("s, del").first()).toContainText("$70");
  await expect(hero).toContainText("$19");
  await expect(hero.locator("[data-deadline]")).toBeVisible();
});

test("lists all 18 flavors with loaded photos, and no Ukrainian is left on the page", async ({ page }) => {
  await page.goto("/choco_bombs.html");
  const cards = page.locator(".cb-flavor");
  await expect(cards).toHaveCount(18);

  // Every image path must resolve. Checked by request rather than by waiting for
  // the browser to paint them: the local python server resets connections
  // when ~25 images are fetched at once, which made a naturalWidth check flaky.
  const srcs = await page.evaluate(() => [...new Set([...document.images].map((i) => i.src))]);
  for (const src of srcs) {
    expect((await page.request.get(src)).status(), src).toBe(200);
  }

  const text = await page.evaluate(() => document.body.innerText);
  expect(text).not.toMatch(/[Ѐ-ӿ]/);
  const footer = page.locator("footer");
  await expect(footer.locator('a[href="offer_en.html"]')).toBeVisible();
  await expect(footer.locator('a[href="privacy.html"]')).toBeVisible();
});

test("the countdown ticks and the page does not scroll sideways on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/choco_bombs.html");
  const secs = page.locator(".cb-hero [data-count='s']");
  const first = await secs.textContent();
  await page.waitForTimeout(1300);
  expect(await secs.textContent()).not.toBe(first);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("the Meta Pixel waits for cookie consent, and Accept loads it", async ({ page }) => {
  const fb = [];
  page.on("request", (r) => { if (/facebook\.(net|com)/.test(r.url())) fb.push(r.url()); });
  await page.goto("/choco_bombs.html");
  const banner = page.locator("#cookieBanner");
  await expect(banner).toBeVisible();
  await page.waitForTimeout(500);
  expect(fb).toEqual([]);
  expect(await page.evaluate(() => typeof window.fbq)).toBe("undefined");

  await banner.getByRole("button", { name: /accept/i }).click();
  await expect(banner).toBeHidden();
  expect(await page.evaluate(() => typeof window.fbq)).toBe("function");

  await page.reload();
  await expect(banner).toBeHidden();
  expect(await page.evaluate(() => typeof window.fbq)).toBe("function");
});

test("Decline keeps the pixel off for good", async ({ page }) => {
  await page.goto("/choco_bombs.html");
  await page.locator("#cookieBanner").getByRole("button", { name: /decline/i }).click();
  await page.reload();
  await expect(page.locator("#cookieBanner")).toBeHidden();
  expect(await page.evaluate(() => typeof window.fbq)).toBe("undefined");
});

test("privacy.html is English and covers cookies and AI-edited images", async ({ page }) => {
  await page.goto("/privacy.html");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  const text = await page.evaluate(() => document.body.innerText);
  expect(text).not.toMatch(/[\u0400-\u04FF]/);
  expect(text).toMatch(/cookie/i);
  expect(text).toMatch(/artificial intelligence|AI/);
  await expect(page.locator("[data-cookie-settings]")).toBeVisible();
});

test("header menu links jump to real sections, and the burger opens it on a phone", async ({ page }) => {
  await page.goto("/choco_bombs.html");
  const links = page.locator(".cb-nav__links a[href^='#']");
  expect(await links.count()).toBeGreaterThanOrEqual(3);
  for (const href of await links.evaluateAll((els) => els.map((e) => e.getAttribute("href")))) {
    expect(await page.locator(href).count()).toBe(1);
  }

  await page.setViewportSize({ width: 375, height: 800 });
  const burger = page.locator(".cb-burger");
  await expect(burger).toBeVisible();
  await expect(links.first()).toBeHidden();
  await burger.click();
  await expect(burger).toHaveAttribute("aria-expanded", "true");
  await expect(links.first()).toBeVisible();
  await links.first().click();
  await expect(burger).toHaveAttribute("aria-expanded", "false");
});

test("the studio gallery shows 10 photos and scrolls itself", async ({ page }) => {
  await page.goto("/choco_bombs.html");
  const rail = page.locator(".cb-rail");
  const uniq = await rail.evaluate((r) => new Set([...r.querySelectorAll("img")].map((i) => i.getAttribute("src"))).size);
  expect(uniq).toBe(10);
  await rail.scrollIntoViewIfNeeded();
  const start = await rail.evaluate((r) => r.scrollLeft);
  await page.waitForTimeout(2500);
  expect(await rail.evaluate((r) => r.scrollLeft)).toBeGreaterThan(start + 10);
});

test("the English pages link to an English offer with all 21 sections", async ({ page }) => {
  for (const p of ["/choco_bombs.html", "/privacy.html"]) {
    await page.goto(p);
    await expect(page.locator('footer a[href="offer_en.html"]')).toBeVisible();
  }
  await page.goto("/offer_en.html");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator(".legal h2")).toHaveCount(21);
  const text = await page.evaluate(() => document.body.innerText);
  expect(text).not.toMatch(/[Ѐ-ӿ]/);
  expect(text).toContain("3656500203");
});

test("the English pages never link back to the Ukrainian site", async ({ page }) => {
  for (const p of ["/choco_bombs.html", "/privacy.html", "/offer_en.html"]) {
    await page.goto(p);
    const local = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")).filter((h) => !/^(https?:|#|mailto:)/.test(h)));
    for (const h of local) expect(["choco_bombs.html", "privacy.html", "offer_en.html"], `${p} → ${h}`).toContain(h.split(/[?#]/)[0].replace(/^\//, ""));
  }
});
