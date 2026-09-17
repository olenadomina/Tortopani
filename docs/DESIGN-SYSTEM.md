# TORTOPANI — Design System (Green Hub)

Единая тема сайта: botanical green `#2E7D4F` на кремовом / белом.

## Слои

| Файл | Роль |
|---|---|
| `styles.css` | Общие токены, nav, footer, modal, кнопки, формы |
| `green-hub.css` | Green Hub: bands, cards, buy, countdown, accents |
| `script.js` | Nav, modal intents, lead → `/api/lead`, countdown, reveal |
| `i18n.js` | EN-словарь; UA — в HTML |

## Цвет

- Brand green: `#2E7D4F` (fill и accent text)
- Dark bands: тот же `#2E7D4F` / `#215F3C` для самых тёмных панелей
- Amber `#FFC53D`: chips, sale burst, CTA на тёмно-зелёном
- Struck price on dark: `#FFC0B8`

## Страницы

`index.html`, `frozen_cake.html`, `la_kartople.html`, `la_kartople_new.html`, `la_kartople_bundle.html`, `bento.html`, `offer.html`.

## Lead

`POST /api/lead` (`api/lead.mjs`) → Telegram. Env: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.
