// The green variant of the English landing (en.tortopani.com/choco_bombs_gr):
// the same page in tortopani.com's palette, with its own privacy and offer
// pages, living beside the dark one at /choco_bombs.
const { test, expect } = require("@playwright/test");
const fs = require("fs");

const SET = ["choco_bombs_gr.html", "privacy_gr.html", "offer_en_gr.html"];

test("the green pages load en-green.css and link only within the green set", async ({ page }) => {
  for (const p of SET) {
    await page.goto("/" + p);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator('link[href="en-green.css"]')).toHaveCount(1);
    const text = await page.evaluate(() => document.body.innerText);
    expect(text).not.toMatch(/[Ѐ-ӿ]/);
    const local = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")).filter((h) => !/^(https?:|#|mailto:)/.test(h)));
    for (const h of local) expect(SET, `${p} → ${h}`).toContain(h.split(/[?#]/)[0]);
  }
});

test("the green landing keeps its own gallery and pays through the same invoice", async ({ page }) => {
  await page.goto("/choco_bombs_gr.html");
  const uniq = await page.locator(".cb-rail").evaluate((r) => new Set([...r.querySelectorAll("img")].map((i) => i.getAttribute("src"))).size);
  expect(uniq).toBe(9);
  for (const href of await page.locator("[data-pay]").evaluateAll((els) => els.map((e) => e.getAttribute("data-pay")))) {
    expect(href).toBe("https://secure.wayforpay.com/button/b0c4d81fa7e62");
  }
  const srcs = await page.evaluate(() => [...new Set([...document.images].map((i) => i.src))]);
  for (const src of srcs) expect((await page.request.get(src)).status(), src).toBe(200);
  // the cookie banner's "Learn more" points at the green privacy page
  await expect(page.locator("#cookieBanner a")).toHaveAttribute("href", "privacy_gr.html#cookies");
});

test("en.tortopani.com serves both /choco_bombs and /choco_bombs_gr", () => {
  const cfg = JSON.parse(fs.readFileSync(require.resolve("../vercel.json"), "utf8"));
  const en = cfg.redirects.filter((r) => r.has && r.has[0].value === "en.tortopani.com");
  // nothing on the en host sends /choco_bombs away any more
  expect(en.find((r) => r.source === "/choco_bombs")).toBeUndefined();
  const catchAll = new RegExp("^" + en.find((r) => r.source.includes("?!")).source + "$");
  for (const p of ["/choco_bombs", "/choco_bombs_gr", "/privacy_gr", "/offer_en_gr", "/en-green.css"]) {
    expect(catchAll.test(p), p).toBe(false);
  }
  expect(catchAll.test("/bento")).toBe(true);
});
