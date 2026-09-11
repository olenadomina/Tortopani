// The thank-you page WayForPay sends buyers to after a successful payment.
//
// It is a Vercel function (api/thanks.mjs), not a static file, because
// WayForPay returns the buyer with a form POST and static hosting answers
// that with 405. The Playwright web server here is a plain static server, so
// the handler is exercised in-process with a stub req/res.
const { test, expect } = require("@playwright/test");

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
  await handler({ method, url }, res);
  return res;
}

test("GET /thanks/bento renders the bento invite with Purchase on the course pixel", async () => {
  const res = await run("GET", "/api/thanks?p=bento");
  expect(res.statusCode).toBe(200);
  expect(res.headers["content-type"]).toMatch(/text\/html/);
  expect(res.body).toContain("Дякуємо за&nbsp;покупку!");
  expect(res.body).toContain('href="https://t.me/+LRUUBqjgM9FkMDcy"');
  expect(res.body).toContain("fbq('init', '4349939475317293')");
  expect(res.body).toContain("'PageView'");
  expect(res.body).toContain('"content_name":"Курс «Бенто торти від А до Я»","value":489,"currency":"UAH"');
  expect(res.body).toContain('<meta name="robots" content="noindex, nofollow"');
});

test("an unknown product falls back to the support chat and fires no Purchase", async () => {
  const res = await run("GET", "/api/thanks?p=nope");
  expect(res.statusCode).toBe(200);
  expect(res.body).toContain('href="https://t.me/tortopamiinsade"');
  expect(res.body).not.toContain("fbq(");
});

test("WayForPay's POST return is bounced to a clean GET of the same page", async () => {
  const res = await run("POST", "/api/thanks?p=bento");
  expect(res.statusCode).toBe(303);
  expect(res.headers.location).toBe("/thanks/bento");
  const bare = await run("POST", "/api/thanks");
  expect(bare.headers.location).toBe("/thanks");
});
