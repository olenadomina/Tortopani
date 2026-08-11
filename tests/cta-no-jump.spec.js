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
    await pg.addStyleTag({ content: "html{scroll-behavior:auto !important}" });

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
