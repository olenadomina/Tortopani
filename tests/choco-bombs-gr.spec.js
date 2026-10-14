// The green variant of the English landing (en.tortopani.com/choco_bombs_gr)
// is off the site since 2026-10-14. Its sources stay in the repo but are not
// deployed, and its old URLs land on the chocolate pages instead of a 404.
const { test, expect } = require("@playwright/test");
const fs = require("fs");

const cfg = JSON.parse(fs.readFileSync(require.resolve("../vercel.json"), "utf8"));

test("the green pages are kept out of the deployment", () => {
  const ignored = fs.readFileSync(require.resolve("../.vercelignore"), "utf8").split("\n");
  for (const f of ["choco_bombs_gr.html", "privacy_gr.html", "offer_en_gr.html", "en-green.css", "assets/chocobombs/green"]) {
    expect(ignored, f).toContain(f);
  }
});

test("old green URLs redirect to their chocolate twins on every host", () => {
  const twins = {
    "/choco_bombs_gr": "https://en.tortopani.com/",
    "/privacy_gr": "https://en.tortopani.com/privacy",
    "/offer_en_gr": "https://en.tortopani.com/offer_en",
    "/thanks/choco_bombs_gr": "https://en.tortopani.com/thanks/choco_bombs",
  };
  for (const [from, to] of Object.entries(twins)) {
    const rule = cfg.redirects.find((r) => !r.has && r.source === from);
    expect(rule, from).toBeTruthy();
    expect(rule.destination).toBe(to);
    // ahead of the en host's catch-all, which would send them all to "/"
    expect(cfg.redirects.indexOf(rule)).toBeLessThan(cfg.redirects.findIndex((r) => r.source.includes("?!")));
  }
});

test("nothing on the live English pages still points at the green variant", async () => {
  const { default: handler } = await import("../api/thanks.mjs");
  const res = { headers: {}, body: "" };
  res.setHeader = () => res;
  res.status = () => res;
  res.send = (b) => { res.body = String(b); return res; };
  res.end = () => res;
  await handler({ method: "GET", url: "/api/thanks?p=choco_bombs", headers: {} }, res);
  for (const body of [res.body, fs.readFileSync("choco_bombs.html", "utf8"), fs.readFileSync("privacy.html", "utf8"), fs.readFileSync("offer_en.html", "utf8")]) {
    expect(body).not.toMatch(/_gr\b|en-green|tp-variant/);
  }
});
