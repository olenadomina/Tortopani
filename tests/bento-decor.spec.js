// The decor section of the bento course: seven techniques as a ledger, and a
// collage of the ones that have a photograph. The collage is absolutely
// positioned into the ledger's height, so any tile added has to fit the grid
// on its own — CSS grid silently overflows a plate it has outgrown.
const { test, expect } = require("@playwright/test");

const PAGE = "/bento.html";

async function collageBoxes(page) {
  return page.evaluate(() => {
    const box = (el) => {
      const r = el.getBoundingClientRect();
      return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
    };
    const plate = document.querySelector(".gh-collage");
    return {
      plate: box(plate),
      ledger: box(document.querySelector(".gh-decor-list")),
      tiles: [...plate.querySelectorAll("img")].map((img) => ({
        src: img.getAttribute("src"),
        alt: img.getAttribute("alt") || "",
        loaded: img.complete && img.naturalWidth > 0,
        ...box(img),
      })),
    };
  });
}

function expectTilesToTileThePlate({ plate, tiles }) {
  const tolerance = 1;
  for (const tile of tiles) {
    expect(tile.loaded, `${tile.src} must actually load`).toBe(true);
    expect(tile.alt.trim().length, `${tile.src} needs a descriptive alt text`).toBeGreaterThan(10);
    expect(tile.left, `${tile.src} runs past the plate's left edge`).toBeGreaterThanOrEqual(plate.left - tolerance);
    expect(tile.top, `${tile.src} runs past the plate's top edge`).toBeGreaterThanOrEqual(plate.top - tolerance);
    expect(tile.right, `${tile.src} runs past the plate's right edge`).toBeLessThanOrEqual(plate.right + tolerance);
    expect(tile.bottom, `${tile.src} runs past the plate's bottom edge`).toBeLessThanOrEqual(plate.bottom + tolerance);
  }
  for (let i = 0; i < tiles.length; i += 1) {
    for (let j = i + 1; j < tiles.length; j += 1) {
      const a = tiles[i];
      const b = tiles[j];
      const overlaps = a.left < b.right - tolerance && b.left < a.right - tolerance
        && a.top < b.bottom - tolerance && b.top < a.bottom - tolerance;
      expect(overlaps, `${a.src} overlaps ${b.src}`).toBe(false);
    }
  }
}

test("the decor collage holds six photographs, two of them tall, and fills the ledger's height", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(PAGE);
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.locator("#decor").scrollIntoViewIfNeeded();
  await page.evaluate(() => Promise.all(
    [...document.querySelectorAll(".gh-collage img")].map((img) => {
      img.loading = "eager";
      return img.complete ? null : new Promise((done) => { img.onload = done; img.onerror = done; });
    })
  ));

  const layout = await collageBoxes(page);
  expect(layout.tiles, "six techniques have a photograph").toHaveLength(6);
  expectTilesToTileThePlate(layout);

  // The piping close-up leads the collage and the cat cake closes it; both run
  // two rows tall so the pair anchors opposite corners.
  const heights = layout.tiles.map((t) => t.height);
  const single = Math.min(...heights);
  const tall = heights.filter((h) => h > single * 1.8);
  expect(tall, "exactly two tiles run tall").toHaveLength(2);
  expect(heights[0], "the first tile runs tall").toBeGreaterThan(single * 1.8);
  expect(heights[heights.length - 1], "the last tile runs tall").toBeGreaterThan(single * 1.8);
  expect(layout.tiles[0].left, "the tall tiles sit on opposite sides").toBeLessThan(layout.tiles[5].left);

  // The plate is sized by the ledger; the two columns start and finish together.
  expect(Math.abs(layout.plate.top - layout.ledger.top)).toBeLessThan(2);
  expect(Math.abs(layout.plate.bottom - layout.ledger.bottom)).toBeLessThan(2);
});

test("on a phone the collage leads the list and still tiles cleanly", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(PAGE);
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.locator("#decor").scrollIntoViewIfNeeded();
  await page.evaluate(() => Promise.all(
    [...document.querySelectorAll(".gh-collage img")].map((img) => {
      img.loading = "eager";
      return img.complete ? null : new Promise((done) => { img.onload = done; img.onerror = done; });
    })
  ));

  const layout = await collageBoxes(page);
  expect(layout.tiles).toHaveLength(6);
  expectTilesToTileThePlate(layout);
  expect(layout.plate.bottom, "the picture leads the list on narrow screens").toBeLessThanOrEqual(layout.ledger.top + 1);
  expect(layout.plate.width, "the collage must not overflow the phone").toBeLessThanOrEqual(390);
});
