// The English thank-you page for the Choco Bombs e-book (en.tortopani.com).
// Same function as the Ukrainian /thanks (api/thanks.mjs), exercised
// in-process the way tests/thanks-page.spec.js does it.
const { test, expect } = require("@playwright/test");
const fs = require("fs");

function fakeRes() {
  const res = { headers: {}, statusCode: 0, body: "" };
  res.setHeader = (k, v) => { res.headers[k.toLowerCase()] = v; return res; };
  res.status = (code) => { res.statusCode = code; return res; };
  res.send = (body) => { res.body = String(body); return res; };
  res.end = () => res;
  return res;
}

async function run(method, url) {
  const { default: handler } = await import("../api/thanks.mjs");
  const res = fakeRes();
  await handler({ method, url, headers: {} }, res);
  return res;
}

test("GET /thanks/choco_bombs is an English page that promises the e-book by email", async () => {
  const res = await run("GET", "/api/thanks?p=choco_bombs");
  expect(res.statusCode).toBe(200);
  expect(res.body).toContain('<html lang="en">');
  expect(res.body).toMatch(/email/i);
  expect(res.body).toContain("Within 24 hours");
  const text = res.body.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, " ");
  expect(text).not.toMatch(/[Ѐ-ӿ]/);
  expect(res.body).toContain('<meta name="robots" content="noindex, nofollow"');
  // Only English pages are linked — never the Ukrainian site.
  const hrefs = [...res.body.matchAll(/href="([^"]+)"/g)].map((m) => m[1]).filter((h) => !/^(https?:|#)/.test(h) && !/\.(css|png)/.test(h));
  expect(hrefs).toEqual([]);
  // Every page link is absolute to the English host, so the logo cannot land on
  // the Ukrainian home even when this page is opened on tortopani.com.
  const pageLinks = [...res.body.matchAll(/href="(https:\/\/[^"]*tortopani\.com[^"]*)"/g)].map((m) => m[1]);
  expect(pageLinks.length).toBeGreaterThanOrEqual(4);
  for (const h of pageLinks) expect(h).toMatch(/^https:\/\/en\.tortopani\.com\//);
});

test("the English thank-you page counts Purchase only through cookie consent", async () => {
  const res = await run("GET", "/api/thanks?p=choco_bombs");
  // No pixel bootstrapped inline: cookie-consent.js loads it after Accept.
  expect(res.body).not.toContain("fbq('init'");
  expect(res.body).toContain('src="/cookie-consent.js" data-pixel="1657768735391830"');
  expect(res.body).toContain('"Purchase"');
  expect(res.body).toContain('{"content_name":"E-book Choco Bombs","value":19,"currency":"USD"}');
});

test("WayForPay's POST return lands on the clean English URL", async () => {
  const res = await run("POST", "/api/thanks?p=choco_bombs");
  expect(res.statusCode).toBe(303);
  expect(res.headers.location).toBe("/thanks/choco_bombs");
});

test("en.tortopani.com does not bounce /thanks/choco_bombs back to the landing", () => {
  const cfg = JSON.parse(fs.readFileSync(require.resolve("../vercel.json"), "utf8"));
  const catchAll = cfg.redirects.find((r) => r.has && r.has[0].value === "en.tortopani.com" && r.source.includes("?!"));
  const re = new RegExp("^" + catchAll.source + "$");
  expect(re.test("/thanks/choco_bombs")).toBe(false);
  expect(re.test("/thanks/bento")).toBe(true);
  expect(re.test("/bento")).toBe(true);
});

test("GET /thanks/choco_bombs_gr is the same thank-you page in the green palette", async () => {
  const res = await run("GET", "/api/thanks?p=choco_bombs_gr");
  expect(res.statusCode).toBe(200);
  expect(res.body).toContain('<link rel="stylesheet" href="/en-green.css" />');
  expect(res.body).toContain("Within 24 hours");
  expect(res.body).toContain('href="https://en.tortopani.com/choco_bombs_gr"');
  expect(res.body).toContain('href="https://en.tortopani.com/privacy_gr"');
  expect(res.body).toContain('href="https://en.tortopani.com/offer_en_gr"');
  expect(res.body).toContain('data-privacy="/privacy_gr"');
  expect(res.body).toContain('{"content_name":"E-book Choco Bombs","value":19,"currency":"USD"}');
  // the green page must not send itself anywhere
  expect(res.body).not.toContain("location.replace");
});

test("the shared /thanks/choco_bombs hands green-page buyers to the green thank-you", async () => {
  const res = await run("GET", "/api/thanks?p=choco_bombs");
  expect(res.body).toContain("location.replace(\"/thanks/choco_bombs_gr\")");
  expect(res.body).not.toContain("en-green.css");
});

test("en.tortopani.com lets /thanks/choco_bombs_gr through", () => {
  const cfg = JSON.parse(fs.readFileSync(require.resolve("../vercel.json"), "utf8"));
  const catchAll = cfg.redirects.find((r) => r.has && r.has[0].value === "en.tortopani.com" && r.source.includes("?!"));
  expect(new RegExp("^" + catchAll.source + "$").test("/thanks/choco_bombs_gr")).toBe(false);
});
