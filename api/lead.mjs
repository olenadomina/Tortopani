/**
 * Lead relay: browser → this function → Google Sheets (+ optional Telegram).
 *
 * Required for a successful write (at least one):
 *   GOOGLE_SHEETS_WEBHOOK — Apps Script web-app URL (see docs/google-sheets-lead.gs)
 *
 * Optional:
 *   TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID — also notify Telegram
 *
 * Body JSON: { name, contact, product|source, page }
 * `source` in the spreadsheet is the product title from the modal.
 */

const MAX_FIELD = 300;
const KYIV_TZ = "Europe/Kyiv";

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .slice(0, MAX_FIELD)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .trim();
}

function cleanField(value) {
  return String(value == null ? "" : value).slice(0, MAX_FIELD).trim();
}

/** ISO UTC + Kyiv wall-clock for Apps Script / sheet column A. */
function leadTimestamps(now = new Date()) {
  const iso = now.toISOString();
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: KYIV_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type) => parts.find((p) => p.type === type)?.value || "00";
  const kyiv = `${get("day")}.${get("month")}.${get("year")} ${get("hour")}:${get("minute")}:${get("second")}`;
  return { iso, kyiv };
}

async function readJson(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return null;
  }
}

async function appendSheet(webhook, payload) {
  const res = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    redirect: "follow",
  });
  const text = await res.text().catch(() => "");
  if (!res.ok) {
    throw new Error(`sheets_http_${res.status}:${text.slice(0, 200)}`);
  }
  // Apps Script returns HTTP 200 even when doPost catches an error and
  // replies with { ok: false, error: "..." }. Treat that as failure.
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) {
    try {
      const body = JSON.parse(trimmed);
      if (body && body.ok === false) {
        throw new Error(`sheets_script:${String(body.error || "unknown").slice(0, 200)}`);
      }
    } catch (err) {
      if (String(err.message || "").startsWith("sheets_script:")) throw err;
      // Non-JSON or unexpected shape after a 200 — still accept (legacy scripts).
    }
  }
  return true;
}

async function notifyTelegram(token, chatId, { name, contact, source, page }) {
  const text = [
    "<b>Нова заявка з сайту</b>",
    `Імʼя: ${escapeHtml(name)}`,
    `Контакт: ${escapeHtml(contact)}`,
    source ? `Товар: ${escapeHtml(source)}` : "Товар: — (загальна консультація)",
    page ? `Сторінка: ${escapeHtml(page)}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  if (!tg.ok) {
    console.error("lead: telegram responded", tg.status, await tg.text());
    throw new Error("telegram_failed");
  }
  return true;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const webhook = String(process.env.GOOGLE_SHEETS_WEBHOOK || "").trim();
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const hasSheets = Boolean(webhook);
  const hasTelegram = Boolean(token && chatId);

  if (!hasSheets && !hasTelegram) {
    console.error("lead: neither GOOGLE_SHEETS_WEBHOOK nor Telegram env is configured");
    return res.status(503).json({ error: "not_configured" });
  }

  const body = await readJson(req);
  if (!body) return res.status(400).json({ error: "bad_json" });

  const name = cleanField(body.name);
  const contact = cleanField(body.contact);
  if (!name || !contact) return res.status(400).json({ error: "missing_fields" });

  const source = cleanField(body.source || body.product);
  const page = cleanField(body.page);
  const { iso, kyiv } = leadTimestamps();
  const payload = {
    name,
    contact,
    telegram: contact,
    source,
    product: source,
    page,
    // Redundant keys for Apps Script header aliases (UA/EN).
    timestamp: iso,
    time: kyiv,
    datetime: iso,
    date: kyiv,
    "ім'я": name,
    "Ім'я": name,
    "телеграм": contact,
    "джерело": source,
    "Джерело": source,
    "товар": source,
  };

  let sheetOk = false;
  let telegramOk = false;
  const errors = [];

  if (hasSheets) {
    try {
      await appendSheet(webhook, payload);
      sheetOk = true;
    } catch (err) {
      console.error("lead: sheets failed", err);
      errors.push("sheets_failed");
    }
  }

  if (hasTelegram) {
    try {
      await notifyTelegram(token, chatId, payload);
      telegramOk = true;
    } catch (err) {
      console.error("lead: telegram failed", err);
      errors.push("telegram_failed");
    }
  }

  // Prefer Sheets as the source of truth the client asked for.
  if (sheetOk || (!hasSheets && telegramOk)) {
    return res.status(200).json({ ok: true, sheet: sheetOk, telegram: telegramOk });
  }

  return res.status(502).json({ error: "relay_failed", details: errors });
}
