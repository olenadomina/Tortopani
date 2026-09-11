// The thank-you page WayForPay sends buyers to after a successful payment.
//
// It is a Vercel function (api/thanks.mjs), not a static file: WayForPay
// returns the buyer with a form POST (static hosting answers 405), and the
// invite must be shown only to someone whose payment result carries a valid
// merchant signature — anyone typing the URL by hand gets a neutral page.
// The Playwright web server is a plain static server, so the handler is
// exercised in-process with a stub req/res and a test secret.
const { test, expect } = require("@playwright/test");
const { createHmac } = require("node:crypto");

const SECRET = "test-secret-key";
process.env.WAYFORPAY_SECRET_KEY = SECRET;

function fakeRes() {
  const res = { headers: {}, statusCode: 0, body: "" };
  res.setHeader = (k, v) => { res.headers[k.toLowerCase()] = v; return res; };
  res.status = (code) => { res.statusCode = code; return res; };
  res.send = (body) => { res.body = String(body); return res; };
  res.end = () => res;
  return res;
}

async function run(method, url, { body, cookie } = {}) {
  const { default: handler } = await import("../api/thanks.mjs");
  const res = fakeRes();
  await handler({ method, url, body, headers: { cookie: cookie || "" } }, res);
  return res;
}

function signedResult(overrides = {}) {
  const f = {
    merchantAccount: "tortopani_com",
    orderReference: "ORDER-42",
    amount: "489",
    currency: "UAH",
    authCode: "123456",
    cardPan: "44****1111",
    transactionStatus: "Approved",
    reasonCode: "1100",
    email: "buyer@example.com",
    ...overrides,
  };
  const base = ["merchantAccount", "orderReference", "amount", "currency", "authCode", "cardPan", "transactionStatus", "reasonCode"]
    .map((k) => f[k]).join(";");
  f.merchantSignature = createHmac("md5", SECRET).update(base, "utf8").digest("hex");
  return f;
}

const cookieOf = (res) => String(res.headers["set-cookie"] || "").split(";")[0];

test("a signed Approved result sets the cookie and bounces to the clean URL", async () => {
  const res = await run("POST", "/api/thanks?p=bento", { body: signedResult() });
  expect(res.statusCode).toBe(303);
  expect(res.headers.location).toBe("/thanks/bento");
  expect(res.headers["set-cookie"]).toMatch(/^tp_paid=.+; Path=\/thanks; Max-Age=1800; HttpOnly; Secure; SameSite=Lax$/);
});

test("with the cookie, GET shows the invite and fires Purchase on the course pixel", async () => {
  const back = await run("POST", "/api/thanks?p=bento", { body: signedResult() });
  const res = await run("GET", "/api/thanks?p=bento", { cookie: cookieOf(back) });
  expect(res.statusCode).toBe(200);
  expect(res.headers["content-type"]).toMatch(/text\/html/);
  expect(res.body).toContain("Дякуємо за&nbsp;покупку!");
  expect(res.body).toContain('href="https://t.me/+LRUUBqjgM9FkMDcy"');
  expect(res.body).toContain("fbq('init', '4349939475317293')");
  expect(res.body).toContain('"content_name":"Курс «Бенто торти від А до Я»","value":489,"currency":"UAH"}, {"eventID":"ORDER-42"}');
  expect(res.body).toContain('<meta name="robots" content="noindex, nofollow"');
});

test("typing the URL by hand gets a neutral page: no invite, no pixel", async () => {
  const res = await run("GET", "/api/thanks?p=bento");
  expect(res.statusCode).toBe(200);
  expect(res.body).toContain("Дякуємо!");
  expect(res.body).not.toContain("t.me/+LRUUBqjgM9FkMDcy");
  expect(res.body).not.toContain("fbq(");
  expect(res.body).toContain('href="https://t.me/tortopamiinsade"');
  expect(res.body).toContain('href="/bento"');
});

test("a tampered or foreign result sets no cookie", async () => {
  for (const body of [
    { ...signedResult(), amount: "1" },                              // amount edited after signing
    signedResult({ transactionStatus: "Declined" }),                 // signed, but not paid
    signedResult({ amount: "199" }),                                 // a cheaper order replayed here
    signedResult({ currency: "USD" }),
    { ...signedResult(), merchantSignature: "00".repeat(16) },
    { orderReference: "X" },                                         // no signature at all
  ]) {
    const res = await run("POST", "/api/thanks?p=bento", { body });
    expect(res.statusCode, JSON.stringify(body)).toBe(303);
    expect(res.headers["set-cookie"], JSON.stringify(body)).toBeUndefined();
  }
});

test("the cookie is bound to its product and expires", async () => {
  const { makeToken, readToken } = await import("../api/thanks.mjs");
  const token = makeToken("bento", "ORDER-1", Date.now());
  expect(readToken(token, "bento")).toEqual({ orderReference: "ORDER-1" });
  expect(readToken(token, "kartople")).toBeNull();
  expect(readToken(token, "bento", Date.now() + 31 * 60 * 1000)).toBeNull();
  expect(readToken(token.replace(/.$/, (c) => (c === "a" ? "b" : "a")), "bento")).toBeNull();
});

test("a GET carrying the result fields is verified the same way", async () => {
  const q = new URLSearchParams(signedResult()).toString();
  const res = await run("GET", `/api/thanks?p=bento&${q}`);
  expect(res.statusCode).toBe(303);
  expect(res.headers.location).toBe("/thanks/bento");
  expect(res.headers["set-cookie"]).toMatch(/^tp_paid=/);
});

test("without the secret, a return with an Approved result is trusted (return-only mode) — but not a bad one", async () => {
  const { verifyResult } = await import("../api/thanks.mjs");
  const product = { value: 489, currency: "UAH" };
  expect(verifyResult({ ...signedResult(), merchantSignature: "garbage" }, product, {})).toEqual({ ok: true, reason: "ok_unverified", orderReference: "ORDER-42" });
  expect(verifyResult(signedResult({ transactionStatus: "Declined" }), product, {}).ok).toBe(false);
  expect(verifyResult(signedResult({ amount: "199" }), product, {}).ok).toBe(false);
  expect(verifyResult(null, product, {})).toEqual({ ok: false, reason: "no_fields" });
});

test("an empty POST still lands on the clean URL", async () => {
  const res = await run("POST", "/api/thanks", { body: "" });
  expect(res.statusCode).toBe(303);
  expect(res.headers.location).toBe("/thanks");
});
