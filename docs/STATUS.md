# TORTOPANI — текущее состояние

Снимок после перехода на **Green Hub** как единственную версию дизайна (06.08.2026).

## Канон

- Главная: `index.html` (бывший `index_green_hub.html`)
- Тема: `styles.css` + `green-hub.css`
- Курсы: `frozen_cake.html`, `la_kartople.html`, `la_kartople_new.html`, `bento.html`
- Оферта: `offer.html`
- Сторінка подяки: `/thanks/<product>` → `api/thanks.mjs` + шаблон `api/_thanks.html` (функція, бо WayForPay повертає покупця POST-ом; статика відповіла б 405). WayForPay має редіректити сюди після оплати (Approve URL у налаштуваннях кнопки). Функція **перевіряє `merchantSignature`** (HMAC-MD5 на `WAYFORPAY_SECRET_KEY`), `transactionStatus=Approved`, валюту й суму ≥ ціни продукту → ставить підписану cookie на 30 хв → 303 на чистий URL. З cookie: інвайт у канал + `PageView`/`Purchase` (eventID = orderReference) на піксель продукту. Без cookie (набрали руками, переслали, прострочено): нейтральна подяка з чатом підтримки, без інвайту й без пікселя. **Env у Vercel: `WAYFORPAY_SECRET_KEY`** вмикає перевірку підпису; без нього функція працює в return-only режимі — довіряє результату, що прийшов з WayForPay (Approved, сума ≥ ціни), а набраний руками URL усе одно бачить нейтральну сторінку; клієнтка додатково перевіряє заявки в Telegram вручну. `WAYFORPAY_MERCHANT` (опційно). Зміна ціни продукту → оновити `value` у `PRODUCTS`
- Оплата: каждая кнопка «Оформити замовлення» с `data-pay` ведёт сразу на свой WayForPay (без попапа); клик шлёт только `InitiateCheckout`, `Purchase` считается один раз — на `/thanks/<product>`. Lead-модалка (`script.js` → `POST /api/lead` → Google Sheets + optional Telegram) остаётся в разметке, но открывается только для кнопок без `data-pay` — сейчас таких нет

## Удалено как legacy

- Старая Home / Easter / `course.css` / `course.js` / `bento.css` / `green-hub-blocks.css` / `avant-green.js`
- Скриншоты сравнения (`cmp_*`, `old_*`, `new_*`, `*_check`)
- `assets/easter/`, `hub/`

## Блокеры публичного запуска

1. Настроить production `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` и проверить `/api/lead`.
1a. (опционально) Поставить `WAYFORPAY_SECRET_KEY` в Vercel — тогда `/thanks` проверяет подпись WayForPay; сейчас клиентка выбрала ручную проверку заявок в Telegram.
2. Privacy Policy (оферта на неё ссылается).
3. Утвердить цену/дату Bento и полный каталог техкарт.
4. Решение об индексации (`robots.txt` сейчас закрывает сайт) и deploy.
