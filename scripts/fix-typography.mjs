#!/usr/bin/env node
/**
 * Bind Ukrainian prepositions / short words to the next word (non-breaking space).
 * Processes visible text and common attribute values in HTML files.
 */
import fs from "node:fs";
import path from "node:path";

const NBSP = "\u00A0";

const WORDS = [
  "через",
  "замість",
  "після",
  "перед",
  "понад",
  "між",
  "без",
  "від",
  "для",
  "про",
  "при",
  "над",
  "під",
  "із",
  "зо",
  "до",
  "на",
  "по",
  "за",
  "об",
  "в",
  "у",
  "з",
  "і",
  "й",
  "а",
  "о",
  "та",
  "або",
  "але",
  "чи",
  "як",
  "що",
  "не",
  "би",
  "б",
  "же",
  "Це",
  "При",
  "Після",
  "До",
  "На",
  "Зо",
  "Із",
  "З",
  "В",
  "У",
  "І",
  "Та",
  "Але",
  "Або",
  "Як",
  "Що",
  "Не",
  "Без",
  "Від",
  "Для",
  "Про",
  "За",
  "Над",
  "Під",
].sort((a, b) => b.length - a.length);

const NEXT = String.raw`[\p{L}ЁёІїЄєҐґ0-9«"'(<]`;

function bindWords(text, trailing = false) {
  let out = text;
  for (const word of WORDS) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(${escaped}) (?!${NBSP})(?=${NEXT})`, "gu");
    out = out.replace(re, `$1${NBSP}`);
    if (trailing) {
      const end = new RegExp(`(${escaped}) $`, "u");
      out = out.replace(end, `$1${NBSP}`);
    }
  }
  return out;
}

function processHtml(html) {
  const parts = html.split(/(<[^>]+>)/g);
  return parts
    .map((segment, index) => {
      if (!segment.startsWith("<")) {
        const trailing = Boolean(parts[index + 1]?.startsWith("<"));
        return bindWords(segment, trailing);
      }
      return segment.replace(
        /(\s(?:alt|title|placeholder|aria-label|content)=["'])([^"']*)(["'])/gi,
        (_, pre, val, post) => pre + bindWords(val) + post
      );
    })
    .join("");
}

const root = path.resolve(import.meta.dirname, "..");
const files = [
  "index.html",
  "frozen_cake.html",
  "la_kartople.html",
  "la_kartople_new.html",
  "easter.html",
  "offer.html",
];

for (const file of files) {
  const filePath = path.join(root, file);
  const before = fs.readFileSync(filePath, "utf8");
  const after = processHtml(before);
  if (after !== before) {
    fs.writeFileSync(filePath, after);
    console.log(`updated ${file}`);
  } else {
    console.log(`unchanged ${file}`);
  }
}
