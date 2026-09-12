/**
 * Thank-you page after WayForPay checkout: the course's Telegram invite and
 * the one place a Purchase is counted on the course pixel.
 *
 * It is a function, not a static file, because WayForPay returns the buyer
 * with a form POST to the Approve URL and Vercel answers a POST to static
 * with 405 (Safari then downloads the page as a text file). POST → 303 to
 * the same clean URL → GET renders the page. vercel.json rewrites /thanks
 * and /thanks/<product> here.
 *
 * The page is deliberately open: it must be reachable by its plain URL so
 * the client and her targetologist can load it to set the pixel up. Access
 * to the channel itself is guarded on the Telegram side — the client
 * approves every join request by hand.
 */
import { readFileSync } from "node:fs";

const SUPPORT_TG = "https://t.me/tortopamiinsade";

const PRODUCTS = {
  bento: {
    title: "Курс «Бенто торти від А до Я»",
    channel: "https://t.me/+LRUUBqjgM9FkMDcy",
    pixelId: "4349939475317293",
    value: 489,
    currency: "UAH",
  },
};

const template = readFileSync(new URL("./_thanks.html", import.meta.url), "utf8");

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pixelScript(product) {
  const params = JSON.stringify({
    content_name: product.title,
    value: product.value,
    currency: product.currency,
  });
  return `<!-- Meta Pixel Code (${escapeHtml(product.title)}) -->
  <script>
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '${product.pixelId}');
  fbq('trackSingle', '${product.pixelId}', 'PageView');
  fbq('trackSingle', '${product.pixelId}', 'Purchase', ${params});
  </script>
  <!-- End Meta Pixel Code -->`;
}

const RAW_KEYS = new Set(["PIXEL", "NOTE", "HEADING", "LEAD", "CTA_LABEL"]);

function fill(fields) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    RAW_KEYS.has(key) ? fields[key] : escapeHtml(fields[key])
  );
}

export function renderThanks(productKey) {
  const product = PRODUCTS[productKey] || null;
  if (product) {
    return fill({
      TITLE: `Дякуємо за покупку — ${product.title}`,
      KICKER: product.title,
      HEADING: "Дякуємо за&nbsp;покупку!",
      LEAD: "Приєднуйся до&nbsp;каналу зі&nbsp;всіма матеріалами курсу&nbsp;⬇️",
      CTA_URL: product.channel,
      CTA_LABEL: "Приєднатися до&nbsp;каналу",
      NOTE: `Посилання не&nbsp;відкривається або є&nbsp;питання — напиши нам у&nbsp;<a href="${SUPPORT_TG}" target="_blank" rel="noopener">Telegram</a>.`,
      PIXEL: pixelScript(product),
    });
  }
  // Unknown product: no channel to offer and no pixel to fire.
  return fill({
    TITLE: "Дякуємо за покупку — TORTOPANI",
    KICKER: "TORTOPANI",
    HEADING: "Дякуємо за&nbsp;покупку!",
    LEAD: "Доступ до&nbsp;матеріалів надішлемо у&nbsp;Telegram найближчим часом.",
    CTA_URL: SUPPORT_TG,
    CTA_LABEL: "Написати в&nbsp;Telegram",
    NOTE: "Якщо оплата пройшла, а&nbsp;повідомлення немає — напиши нам, і&nbsp;ми все перевіримо.",
    PIXEL: "",
  });
}

export function productFromRequest(req) {
  const url = new URL(req.url || "/", "http://localhost");
  return String(url.searchParams.get("p") || "").toLowerCase();
}

export default async function handler(req, res) {
  const productKey = productFromRequest(req);
  if (req.method === "POST") {
    // WayForPay's return; land on a plain GET so a refresh does not
    // resubmit and the URL stays clean for pixel rules.
    res.setHeader("Location", productKey ? `/thanks/${encodeURIComponent(productKey)}` : "/thanks");
    return res.status(303).end();
  }
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD, POST");
    return res.status(405).end();
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).send(renderThanks(productKey));
}
