# TORTOPANI — текущее состояние

Снимок после перехода на **Green Hub** как единственную версию дизайна (06.08.2026).

## Канон

- Главная: `index.html` (бывший `index_green_hub.html`)
- Тема: `styles.css` + `green-hub.css`
- Курсы: `frozen_cake.html`, `la_kartople.html`, `la_kartople_new.html`, `bento.html`
- Оферта: `offer.html`
- Сторінка подяки: `/thanks/<product>` → `api/thanks.mjs` + шаблон `api/_thanks.html` (функція, бо WayForPay повертає покупця POST-ом; статика відповіла б 405). Сюди WayForPay має редіректити після оплати (Approve URL у налаштуваннях кнопки). `bento` → інвайт у канал курсу + `PageView`/`Purchase` на піксель бенто; невідомий продукт → загальна подяка без події
- Оплата: каждая кнопка «Оформити замовлення» с `data-pay` ведёт сразу на свой WayForPay (без попапа); клик шлёт только `InitiateCheckout`, `Purchase` считается один раз — на `/thanks/<product>`. Lead-модалка (`script.js` → `POST /api/lead` → Google Sheets + optional Telegram) остаётся в разметке, но открывается только для кнопок без `data-pay` — сейчас таких нет

## Удалено как legacy

- Старая Home / Easter / `course.css` / `course.js` / `bento.css` / `green-hub-blocks.css` / `avant-green.js`
- Скриншоты сравнения (`cmp_*`, `old_*`, `new_*`, `*_check`)
- `assets/easter/`, `hub/`

## Блокеры публичного запуска

1. Настроить production `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` и проверить `/api/lead`.
2. Privacy Policy (оферта на неё ссылается).
3. Утвердить цену/дату Bento и полный каталог техкарт.
4. Решение об индексации (`robots.txt` сейчас закрывает сайт) и deploy.
