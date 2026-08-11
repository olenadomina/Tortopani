# TORTOPANI — текущее состояние

Снимок после перехода на **Green Hub** как единственную версию дизайна (06.08.2026).

## Канон

- Главная: `index.html` (бывший `index_green_hub.html`)
- Тема: `styles.css` + `green-hub.css`
- Курсы: `frozen_cake.html`, `la_kartople.html`, `la_kartople_new.html`, `la_kartople_bundle.html`, `bento.html`
- Оферта: `offer.html`
- Lead: `script.js` → `POST /api/lead` → Google Sheets (`source` = product) + optional Telegram

## Удалено как legacy

- Старая Home / Easter / `course.css` / `course.js` / `bento.css` / `green-hub-blocks.css` / `avant-green.js`
- Скриншоты сравнения (`cmp_*`, `old_*`, `new_*`, `*_check`)
- `assets/easter/`, `hub/`

## Блокеры публичного запуска

1. Настроить production `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` и проверить `/api/lead`.
2. Privacy Policy (оферта на неё ссылается).
3. Утвердить цену/дату Bento и полный каталог техкарт.
4. Решение об индексации (`robots.txt` сейчас закрывает сайт) и deploy.
