/**
 * Thank-you page after WayForPay checkout.
 *
 * WayForPay's «повернення на сайт» posts the buyer back to the merchant URL,
 * and a static file on Vercel answers a POST with 405 — so this function owns
 * the route instead: POST → 303 to the same URL, GET → the page. vercel.json
 * rewrites /thanks and /thanks/<product> here.
 *
 * Each product carries its own channel invite and Meta pixel; the page fires
 * PageView + Purchase on that pixel, so it is the one place a purchase is
 * counted (the buy buttons send InitiateCheckout only). Unknown or missing
 * product → a generic thank-you with the support chat, no Purchase event.
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
  if (!product) return "";
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

export function renderThanks(productKey) {
  const product = PRODUCTS[productKey] || null;
  const fields = product
    ? {
        TITLE: `Дякуємо за покупку — ${product.title}`,
        KICKER: product.title,
        HEADING: "Дякуємо за&nbsp;покупку!",
        LEAD: "Приєднуйся до&nbsp;каналу зі&nbsp;всіма матеріалами курсу&nbsp;⬇️",
        CTA_URL: product.channel,
        CTA_LABEL: "Приєднатися до&nbsp;каналу",
        NOTE: `Посилання не&nbsp;відкривається або є&nbsp;питання — напиши нам у&nbsp;<a href="${SUPPORT_TG}" target="_blank" rel="noopener">Telegram</a>.`,
      }
    : {
        TITLE: "Дякуємо за покупку — TORTOPANI",
        KICKER: "TORTOPANI",
        HEADING: "Дякуємо за&nbsp;покупку!",
        LEAD: "Доступ до&nbsp;матеріалів надішлемо у&nbsp;Telegram найближчим часом.",
        CTA_URL: SUPPORT_TG,
        CTA_LABEL: "Написати в&nbsp;Telegram",
        NOTE: "Якщо оплата пройшла, а&nbsp;повідомлення немає — напиши нам, і&nbsp;ми все перевіримо.",
      };
  fields.PIXEL = pixelScript(product);

  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (key === "PIXEL" || key === "NOTE" || key === "HEADING" || key === "LEAD" || key === "CTA_LABEL") return fields[key];
    return escapeHtml(fields[key]);
  });
}

export function productFromRequest(req) {
  const url = new URL(req.url || "/", "http://localhost");
  return String(url.searchParams.get("p") || "").toLowerCase();
}

export default async function handler(req, res) {
  const productKey = productFromRequest(req);
  if (req.method === "POST") {
    // WayForPay's return is a form POST; land the buyer on a plain GET so a
    // refresh does not resubmit and the URL stays clean for pixel rules.
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
