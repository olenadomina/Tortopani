/**
 * TORTOPANI — lead webhook for Google Sheets.
 *
 * Spreadsheet:
 *   https://docs.google.com/spreadsheets/d/1PcLyb7BDREFdqTRu7AhXuYtpmXXcdV7rsdm5UJfhl4I/
 *
 * Expected header row (row 1), example:
 *   createdAt | name | telegram | insta | source
 *
 * IMPORTANT — after ANY edit you MUST publish a new web-app version.
 * Saving the editor alone does NOT update the live URL.
 *
 *   1. Paste this file into Apps Script → Save (Ctrl/Cmd+S)
 *   2. Deploy → Manage deployments → pencil (✎) on the active Web app
 *      OR Deploy → New deployment → Web app (if none / old URL returns 404)
 *   3. Execute as: Me · Who has access: Anyone
 *   4. Version: New version → Deploy
 *   5. Copy the Web app URL → Vercel env GOOGLE_SHEETS_WEBHOOK → Redeploy
 *
 * Quick health check (browser): open the /exec URL — expect
 *   {"ok":true,"service":"tortopani-lead"}
 * If Google shows “file not found” / 404, the deployment is dead — create a new one.
 *
 * Write path (newest first):
 *   insertRowsAfter(1, 1) → write A2:…2 via A1 notation → on failure deleteRow(2).
 *
 * Sheet.getRange(row, column, numRows, numColumns) uses COUNTS for args 3–4
 * (not end-row / end-col). Prefer A1 ranges to avoid that ambiguity.
 */

var SPREADSHEET_ID = "1PcLyb7BDREFdqTRu7AhXuYtpmXXcdV7rsdm5UJfhl4I";
var TZ = "Europe/Kyiv";
var MAX_COLS = 20;
/** Fixed layout when headers are unknown: A=createdAt B=name C=telegram D=insta E=source */
var FALLBACK = { time: 0, name: 1, contact: 2, insta: 3, source: 4 };
var DEFAULT_HEADERS = ["createdAt", "name", "telegram", "insta", "source"];

function doPost(e) {
  try {
    var body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }
    appendLead_(body);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function doGet() {
  return json_({ ok: true, service: "tortopani-lead" });
}

/** Normalize header cells: NBSP / zero-width / apostrophe variants / case. */
function normHeader_(value) {
  return String(value == null ? "" : value)
    .replace(/[\u00A0\u200B\u200C\u200D\uFEFF]/g, " ")
    .replace(/[\u2018\u2019\u02BC\uFF07`´]/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Collapse apostrophes/spaces for fuzzy UA matches (ім'я ≈ імя). */
function softKey_(value) {
  return normHeader_(value).replace(/['\s._\-]+/g, "");
}

/** 1-based column index → A1 letter(s). */
function colLetter_(index1) {
  var n = index1;
  var out = "";
  while (n > 0) {
    var rem = (n - 1) % 26;
    out = String.fromCharCode(65 + rem) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out || "A";
}

/** Parse API timestamp or fall back to now. Always a real Date. */
function stampDate_(body) {
  var candidates = [
    body && body.createdAt,
    body && body.created_at,
    body && body.timestamp,
    body && body.datetime,
    body && body.time,
    body && body.date
  ];
  for (var i = 0; i < candidates.length; i++) {
    if (!candidates[i]) continue;
    // Date() cannot parse dd.MM.yyyy Kyiv wall clock — skip those.
    var raw = String(candidates[i]);
    if (/^\d{2}\.\d{2}\.\d{4}/.test(raw)) continue;
    var parsed = new Date(raw);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

/**
 * Sheet timestamp: prefer ISO (matches older createdAt rows like
 * 2026-08-04T10:05:42.708Z). Fall back to a fresh ISO from the parsed Date.
 */
function stampIso_(body, date) {
  var candidates = [
    body && body.createdAt,
    body && body.created_at,
    body && body.timestamp,
    body && body.datetime
  ];
  for (var i = 0; i < candidates.length; i++) {
    var raw = candidates[i] == null ? "" : String(candidates[i]).trim();
    if (/^\d{4}-\d{2}-\d{2}T/.test(raw)) return raw;
  }
  return date.toISOString();
}

/**
 * Map a normalized header to a logical role.
 * Returns: time | name | contact | insta | source | page | ""
 */
function headerRole_(key) {
  if (!key) return "";
  var soft = softKey_(key);

  // createdAt / timestamp — strong aliases first (exact soft keys).
  if (
    soft === "createdat" ||
    soft === "created_at" ||
    soft === "timestamp" ||
    soft === "datetime" ||
    soft === "date" ||
    soft === "time" ||
    soft === "дата" ||
    soft === "час" ||
    soft === "время" ||
    soft === "датаічас" ||
    soft === "датаивремя" ||
    soft === "датачас" ||
    soft === "датавремя" ||
    /^(date.?time|time.?stamp|created.?at)$/.test(key) ||
    /^(дата|час|время|когда|коли)\b/.test(key)
  ) {
    return "time";
  }
  if (
    soft === "name" ||
    soft === "firstname" ||
    soft === "імя" ||
    soft === "имя" ||
    soft === "имяклиента" ||
    /^(name|ім'?я|імя|имя)$/.test(key)
  ) {
    return "name";
  }
  if (
    soft === "tg" ||
    soft === "telegram" ||
    soft === "телеграм" ||
    soft === "телега" ||
    soft === "contact" ||
    soft === "контакт" ||
    soft === "ник" ||
    soft === "nick" ||
    soft === "username" ||
    soft === "юзернейм" ||
    /telegram|телеграм|контакт|username/.test(key)
  ) {
    return "contact";
  }
  if (
    soft === "insta" ||
    soft === "instagram" ||
    soft === "інста" ||
    soft === "инста" ||
    soft === "інстаграм" ||
    soft === "инстаграм" ||
    /instagram|інста|инста/.test(key)
  ) {
    return "insta";
  }
  if (
    soft === "source" ||
    soft === "джерело" ||
    soft === "источник" ||
    soft === "product" ||
    soft === "товар" ||
    soft === "курс" ||
    soft === "offer" ||
    soft === "офер" ||
    /source|джерело|источник|product|товар|курс|откуда|звідки/.test(key)
  ) {
    return "source";
  }
  if (
    soft === "page" ||
    soft === "url" ||
    soft === "сторінка" ||
    soft === "страница" ||
    soft === "link" ||
    /page|url|сторінк|страниц|посилан/.test(key)
  ) {
    return "page";
  }
  return "";
}

function pickField_(body, keys) {
  for (var i = 0; i < keys.length; i++) {
    var v = body && body[keys[i]];
    if (v == null) continue;
    var s = String(v).trim();
    if (s) return s;
  }
  return "";
}

function appendLead_(body) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheets()[0];
  if (!sheet) throw new Error("no_sheet");

  var when = stampDate_(body);
  var whenIso = stampIso_(body, when);

  var lastCol = Math.min(Math.max(sheet.getLastColumn(), 5), MAX_COLS);
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

  // Seed a header row on a truly empty sheet.
  if (!normHeader_(headers[0]) && sheet.getLastRow() === 0) {
    headers = DEFAULT_HEADERS.slice();
    lastCol = headers.length;
    sheet.getRange(1, 1, 1, lastCol).setValues([headers]);
  }

  // Trim trailing empty headers so we never write dozens of blank cells.
  while (lastCol > 5 && !normHeader_(headers[lastCol - 1])) {
    lastCol--;
  }
  headers = headers.slice(0, lastCol);
  if (lastCol < 5) {
    lastCol = 5;
    while (headers.length < 5) headers.push("");
  }

  var name = pickField_(body, [
    "name", "ім'я", "імя", "имя", "Name", "Ім'я", "Імʼя"
  ]);
  var contact = pickField_(body, [
    "contact", "telegram", "Telegram", "телеграм", "tg", "username", "контакт"
  ]);
  var source = pickField_(body, [
    "source", "product", "джерело", "товар", "курс", "Source", "Джерело"
  ]);
  var page = pickField_(body, ["page", "url", "сторінка", "страница"]);
  // We do not collect Instagram — leave blank (not "—") so filters stay clean.
  var insta = pickField_(body, ["insta", "instagram", "інста", "инста"]);

  if (!name && !contact) {
    throw new Error("empty_lead");
  }

  // Resolve column indexes by header role (first match wins).
  var col = { time: -1, name: -1, contact: -1, insta: -1, source: -1, page: -1 };
  for (var c = 0; c < lastCol; c++) {
    var role = headerRole_(normHeader_(headers[c]));
    if (role && col[role] < 0) col[role] = c;
  }

  // Fall back to fixed Tortopani layout when headers do not match.
  // Real sheet: createdAt | name | telegram | insta | source
  if (col.time < 0) col.time = FALLBACK.time;
  if (col.name < 0) col.name = FALLBACK.name;
  if (col.contact < 0) col.contact = FALLBACK.contact;
  if (col.insta < 0) col.insta = FALLBACK.insta;
  if (col.source < 0) col.source = FALLBACK.source;

  var row = [];
  for (var i = 0; i < lastCol; i++) row.push("");

  row[col.time] = whenIso;
  if (name) row[col.name] = name;
  if (contact) row[col.contact] = contact;
  if (insta) row[col.insta] = insta;
  if (source) row[col.source] = source;
  if (page && col.page >= 0) row[col.page] = page;

  // Guard: never leave a blank inserted row if the write fails.
  // Class Sheet getRange(r,c,numRows,numColumns) uses COUNTS — use A1 instead.
  var a1 = "A2:" + colLetter_(lastCol) + "2";
  sheet.insertRowsAfter(1, 1);
  try {
    sheet.getRange(a1).setValues([row]);
    // Belt-and-suspenders: ensure createdAt landed even if mapping drifted.
    sheet.getRange("A2").setValue(whenIso);
  } catch (writeErr) {
    try {
      sheet.deleteRow(2);
    } catch (deleteErr) {
      // Keep the original write error as the response cause.
    }
    throw writeErr;
  }
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
