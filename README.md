# TORTOPANI — сайт школи кондитера

Статичний двомовний (укр / англ) сайт школи **Лілія Полякова (TORTOPANI)**.
Дизайн: **Green Hub** (`green-hub.css` поверх `styles.css`).

## Сторінки

| Файл | Сторінка |
|---|---|
| `index.html` | Головна (Green Hub) |
| `techcards.html` | Каталог окремих техкарт десертів |
| `frozen_cake.html` | Заморожені мусові торти / бенто |
| `la_kartople.html` | Трендова «Картопля» |
| `la_kartople_new.html` | «Картопля» 2.0 |
| `bento.html` | Бенто торти від А до Я (передзапис) |
| `offer.html` | Публічний договір (оферта), `noindex` |

Мова перемикається кнопкою **UA \| EN** у шапці (українська — за замовчуванням).

## Запуск

```bash
cd /Users/olena.domina/Tortopani
python3 -m http.server 8755
# → http://localhost:8755
```

Відкривай **через сервер**, а не подвійним кліком: відносні CSS/JS
підвантажуються коректно лише по http.

## Деплой

Чиста статика. **Vercel**: `vercel.json`, `.vercelignore`, `robots.txt` (прототип закритий від індексації).

Кнопки «Оформити замовлення» ведуть одразу на WayForPay (`data-pay`), без попапа.
Після оплати WayForPay повертає покупця на `/thanks/<product>` (функція `api/thanks.mjs`): підпис результату перевіряється секретним ключем мерчанта — env `WAYFORPAY_SECRET_KEY` у Vercel; лише після цього сторінка показує інвайт у канал курсу і рахує `Purchase`.
Модалка заявки лишилася для кнопок без `data-pay`: `POST /api/lead` → **Google Sheets** (+ опційно Telegram).

**Перший раз**
1. Відкрий [таблицю лідів](https://docs.google.com/spreadsheets/d/1PcLyb7BDREFdqTRu7AhXuYtpmXXcdV7rsdm5UJfhl4I/edit) → **Extensions → Apps Script**.
2. Встав код з `docs/google-sheets-lead.gs`, збережи.
3. **Deploy → New deployment → Web app** (Execute as: Me, Who has access: Anyone).
4. На Vercel додай env `GOOGLE_SHEETS_WEBHOOK` = URL веб-застосунку.
5. Опційно: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.

**Після зміни скрипта** (обовʼязково — інакше вебхук лишається на старій версії):
1. Встав оновлений `docs/google-sheets-lead.gs` → **Save**.
2. **Deploy → Manage deployments → ✎** → Version: **New version** → **Deploy**.
3. URL зазвичай не змінюється; Vercel чіпати не треба.

У колонку A завжди пишеться час (Europe/Kyiv). У `source` — назва товару з модалки.

## Структура

```
index.html + course pages   Green Hub сторінки
styles.css                  спільні токени, nav, footer, modal, кнопки
green-hub.css               тема й компоненти Green Hub
script.js                   nav, модалка, lead → /api/lead, countdown, reveal
i18n.js                     англійський словник + перемикач мови
api/lead.mjs                Vercel: заявка → Sheets (+ Telegram)
docs/google-sheets-lead.gs  Apps Script для таблиці лідів
assets/                     зображення (atelier, frozen, kartople, bento…)
```
