/**
 * Thank-you page after WayForPay checkout — shown in full only to a buyer
 * whose payment WayForPay has just confirmed.
 *
 * Flow:
 *   1. WayForPay sends the buyer back with the payment result (a form POST
 *      to the Approve URL; a GET with the same fields is accepted too).
 *   2. We verify the result's merchantSignature — HMAC-MD5 over eight
 *      fields with the merchant secret key — plus transactionStatus and
 *      the amount, then set a short-lived signed cookie and 303 to the
 *      clean URL, so a refresh does not resubmit and the URL stays stable
 *      for pixel rules.
 *   3. GET with a valid cookie → the channel invite and a Purchase event.
 *      GET without one (typed by hand, forwarded, expired) → a neutral
 *      thank-you with the support chat: no invite, no Purchase.
 *
 * A static file could not do this — Vercel answers a POST to static with
 * 405 — so vercel.json rewrites /thanks and /thanks/<product> here.
 *
 * Env: WAYFORPAY_SECRET_KEY (merchant secret key, from the WayForPay
 * cabinet) turns the signature check on. Without it the function runs in
 * return-only mode: a result that arrives by POST/GET with Approved status
 * and a sufficient amount is trusted as-is, and so is a bare redirect that
 * arrives from wayforpay.com (the payment button's Approve URL may send a
 * plain GET with no fields — the Referer is then the only trace). Enough to
 * keep a typed-in URL from showing the invite, while the client screens
 * joins in Telegram by hand. Set the key and the same code verifies the
 * signature; nothing else changes. WAYFORPAY_MERCHANT (optional) pins the
 * merchant login as well.
 */
import { readFileSync } from "node:fs";
import { createHmac, timingSafeEqual } from "node:crypto";

const SUPPORT_TG = "https://t.me/tortopamiinsade";
const COOKIE = "tp_paid";
const COOKIE_TTL_S = 30 * 60;

const PRODUCTS = {
  bento: {
    title: "Курс «Бенто торти від А до Я»",
    page: "/bento",
    channel: "https://t.me/+LRUUBqjgM9FkMDcy",
    pixelId: "4349939475317293",
    // Also the floor for the paid amount: a cheaper order's signed result
    // must not unlock this channel. Change together with the price.
    value: 489,
    currency: "UAH",
  },
};

const template = readFileSync(new URL("./_thanks.html", import.meta.url), "utf8");

/* ---------------- rendering ---------------- */

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pixelScript(product, orderReference) {
  const params = JSON.stringify({
    content_name: product.title,
    value: product.value,
    currency: product.currency,
  });
  // eventID = the order, so a refresh within the cookie's life (or a later
  // Conversions API event for the same order) can be deduplicated by Meta.
  const eventOpts = orderReference ? `, ${JSON.stringify({ eventID: String(orderReference) })}` : "";
  return `<!-- Meta Pixel Code (${escapeHtml(product.title)}) -->
  <script>
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '${product.pixelId}');
  fbq('trackSingle', '${product.pixelId}', 'PageView');
  fbq('trackSingle', '${product.pixelId}', 'Purchase', ${params}${eventOpts});
  </script>
  <!-- End Meta Pixel Code -->`;
}

const RAW_KEYS = new Set(["PIXEL", "NOTE", "HEADING", "LEAD", "CTA_LABEL"]);

function fill(fields) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    RAW_KEYS.has(key) ? fields[key] : escapeHtml(fields[key])
  );
}

/** Verified buyer: the invite, and the one place Purchase is counted. */
export function renderPaid(productKey, orderReference) {
  const product = PRODUCTS[productKey];
  return fill({
    TITLE: `Дякуємо за покупку — ${product.title}`,
    KICKER: product.title,
    HEADING: "Дякуємо за&nbsp;покупку!",
    LEAD: "Приєднуйся до&nbsp;каналу зі&nbsp;всіма матеріалами курсу&nbsp;⬇️",
    CTA_URL: product.channel,
    CTA_LABEL: "Приєднатися до&nbsp;каналу",
    NOTE: `Посилання не&nbsp;відкривається або є&nbsp;питання — напиши нам у&nbsp;<a href="${SUPPORT_TG}" target="_blank" rel="noopener">Telegram</a>.`,
    PIXEL: pixelScript(product, orderReference),
  });
}

/** Anyone else: no invite, no pixel. Says how access actually arrives. */
export function renderNeutral(productKey) {
  const product = PRODUCTS[productKey] || null;
  return fill({
    TITLE: product ? `Дякуємо — ${product.title}` : "Дякуємо — TORTOPANI",
    KICKER: product ? product.title : "TORTOPANI",
    HEADING: "Дякуємо!",
    LEAD: "Доступ до&nbsp;каналу з&nbsp;матеріалами відкривається одразу після оплати — WayForPay сам поверне тебе на&nbsp;цю сторінку.",
    CTA_URL: SUPPORT_TG,
    CTA_LABEL: "Написати в&nbsp;Telegram",
    NOTE: "Вже оплатила, а&nbsp;посилання не&nbsp;отримала — напиши нам, і&nbsp;ми все перевіримо.",
    PIXEL: "",
  });
}

/* ---------------- WayForPay result ---------------- */

const SIGNED_FIELDS = ["merchantAccount", "orderReference", "amount", "currency", "authCode", "cardPan", "transactionStatus", "reasonCode"];

function hmac(algorithm, key, data) {
  return createHmac(algorithm, key).update(data, "utf8").digest("hex");
}

function safeEqual(a, b) {
  const ab = Buffer.from(String(a || ""), "utf8");
  const bb = Buffer.from(String(b || ""), "utf8");
  return ab.length === bb.length && ab.length > 0 && timingSafeEqual(ab, bb);
}

/**
 * Decide whether a WayForPay result unlocks `product`. Returns
 * { ok, reason, orderReference }; `reason` is for the log, never the page.
 */
export function verifyResult(fields, product, env = process.env) {
  if (!fields) return { ok: false, reason: "no_fields" };
  const secret = env.WAYFORPAY_SECRET_KEY;
  if (secret) {
    if (!fields.merchantSignature) return { ok: false, reason: "no_signature" };
    const expected = hmac("md5", secret, SIGNED_FIELDS.map((k) => (fields[k] == null ? "" : String(fields[k]))).join(";"));
    if (!safeEqual(expected, String(fields.merchantSignature).toLowerCase())) return { ok: false, reason: "bad_signature" };
  }

  if (env.WAYFORPAY_MERCHANT && fields.merchantAccount !== env.WAYFORPAY_MERCHANT) return { ok: false, reason: "wrong_merchant" };
  if (fields.transactionStatus !== "Approved") return { ok: false, reason: `status_${fields.transactionStatus || "none"}` };
  if (!product) return { ok: false, reason: "unknown_product" };
  if (String(fields.currency || "").toUpperCase() !== product.currency) return { ok: false, reason: "wrong_currency" };
  if (!(Number(fields.amount) >= product.value)) return { ok: false, reason: "amount_below_price" };

  return { ok: true, reason: secret ? "ok" : "ok_unverified", orderReference: String(fields.orderReference || "") };
}

/* ---------------- cookie ---------------- */

function cookieKey(env = process.env) {
  // Derived from the merchant key when there is one, so the client sets a
  // single secret; in return-only mode a fixed key still signs the cookie
  // against casual edits (it is not a secret, and does not pretend to be).
  return hmac("sha256", env.WAYFORPAY_SECRET_KEY || "tortopani-thanks-return-only", "tortopani-thanks-cookie");
}

export function makeToken(productKey, orderReference, now = Date.now(), env = process.env) {
  const exp = Math.floor(now / 1000) + COOKIE_TTL_S;
  const body = Buffer.from(JSON.stringify({ p: productKey, o: orderReference, exp }), "utf8").toString("base64url");
  return `${body}.${hmac("sha256", cookieKey(env), body)}`;
}

export function readToken(token, productKey, now = Date.now(), env = process.env) {
  if (!token) return null;
  const [body, sig] = String(token).split(".");
  if (!body || !sig || !safeEqual(hmac("sha256", cookieKey(env), body), sig)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (data.p !== productKey || !(data.exp > Math.floor(now / 1000))) return null;
    return { orderReference: String(data.o || "") };
  } catch {
    return null;
  }
}

function parseCookies(header) {
  const out = {};
  String(header || "").split(";").forEach((part) => {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

/* ---------------- request plumbing ---------------- */

export function productFromRequest(req) {
  const url = new URL(req.url || "/", "http://localhost");
  return String(url.searchParams.get("p") || "").toLowerCase();
}

/** Result fields from a form/JSON POST body, or from the query on a GET. */
async function readFields(req) {
  const url = new URL(req.url || "/", "http://localhost");
  if (req.method === "GET" || req.method === "HEAD") {
    return url.searchParams.has("merchantSignature") ? Object.fromEntries(url.searchParams) : null;
  }
  let raw = req.body;
  if (raw == null) {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    raw = Buffer.concat(chunks).toString("utf8");
  }
  if (raw && typeof raw === "object" && !Buffer.isBuffer(raw)) return raw;
  const text = Buffer.isBuffer(raw) ? raw.toString("utf8") : String(raw || "");
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return Object.fromEntries(new URLSearchParams(text));
  }
}

function cleanPath(productKey) {
  return productKey ? `/thanks/${encodeURIComponent(productKey)}` : "/thanks";
}

/** True when the request was sent by a page on wayforpay.com. */
export function cameFromWayForPay(req) {
  const ref = (req.headers && (req.headers.referer || req.headers.referrer)) || "";
  try {
    const host = new URL(ref).hostname.toLowerCase();
    return host === "wayforpay.com" || host.endsWith(".wayforpay.com");
  } catch {
    return false;
  }
}

function stampAndBounce(res, productKey, orderReference) {
  res.setHeader("Set-Cookie", `${COOKIE}=${makeToken(productKey, orderReference)}; Path=/thanks; Max-Age=${COOKIE_TTL_S}; HttpOnly; Secure; SameSite=Lax`);
  res.setHeader("Location", cleanPath(productKey));
  return res.status(303).end();
}

export default async function handler(req, res) {
  const productKey = productFromRequest(req);
  const product = PRODUCTS[productKey] || null;
  const fields = await readFields(req);
  const fromWfp = cameFromWayForPay(req);
  const hasCookie = Boolean(parseCookies(req.headers && req.headers.cookie)[COOKIE]);
  // One line per visit, no values: enough to see how WayForPay actually
  // returns buyers (method, fields or not, referer) without logging payments.
  console.log("[thanks] visit", { method: req.method, product: productKey, fields: fields ? Object.keys(fields) : null, fromWfp, hasCookie });

  // A payment result arrived (WayForPay's return, by POST or GET): verify,
  // stamp the cookie on success, and bounce to the clean URL either way.
  if (fields) {
    const verdict = verifyResult(fields, product);
    if (verdict.ok) {
      if (verdict.reason === "ok_unverified") console.warn("[thanks] return accepted without signature check — WAYFORPAY_SECRET_KEY is not set");
      return stampAndBounce(res, productKey, verdict.orderReference);
    }
    console.warn("[thanks] return not verified", { product: productKey, reason: verdict.reason });
    res.setHeader("Location", cleanPath(productKey));
    return res.status(303).end();
  }

  // No result fields, but the buyer was sent here by wayforpay.com: in
  // return-only mode that is the return. With a key configured a bare
  // redirect proves nothing, so it falls through to the neutral page.
  if (fromWfp && product && !process.env.WAYFORPAY_SECRET_KEY && !hasCookie) {
    console.warn("[thanks] bare redirect from wayforpay.com accepted — no result fields, WAYFORPAY_SECRET_KEY is not set");
    return stampAndBounce(res, productKey, "");
  }

  if (req.method === "POST") {
    // Empty POST (no result fields): nothing to verify, just land cleanly.
    res.setHeader("Location", cleanPath(productKey));
    return res.status(303).end();
  }
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD, POST");
    return res.status(405).end();
  }

  const paid = product ? readToken(parseCookies(req.headers && req.headers.cookie)[COOKIE], productKey) : null;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).send(paid ? renderPaid(productKey, paid.orderReference) : renderNeutral(productKey));
}
