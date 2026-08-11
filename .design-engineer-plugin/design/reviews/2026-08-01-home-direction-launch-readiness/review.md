---
activity: home-direction-launch-readiness-review
date: 2026-08-01
phase: phase_7_review
deliverable_type: product_assessment
component: ux_design
status: complete
severity: critical
tags: [ui-ux-review, homepage, conversion, accessibility, psychology, design-system, launch-readiness]
related_deliverables:
  - "index.html"
  - "index_editorial.html"
  - "editorial.css"
  - "docs/DESIGN-SYSTEM.md"
  - "docs/STATUS.md"
tools_used: [codex-desktop, playwright, browser]
decisions:
  - "Recommend the editorial Home as the canonical visual direction because it is more distinctive and better aligned with the requested light presentation, but do not launch it until the commerce, trust, content, responsive, and accessibility gates in this review are closed."
  - "Treat the client comments as Home requirements and the Google Doc as the source for a separate Bento course-detail page, because its long curriculum structure is not suitable for the Home information architecture."
---

# TORTOPANI — полный UI/UX Product Director review

## Executive verdict

**Нет, все комментарии заказчицы пока не учтены.** Editorial-вариант закрывает заметную часть визуальных пожеланий и является более сильным направлением, но не готов к публичному запуску.

Рекомендация: выбрать `index_editorial.html` как **визуальное направление будущей канонической главной**, а не публиковать файл как есть. Текущий статус — **direction approved by review / launch blocked**; это не означает одобрение заказчицей.

Главные причины блокировки:

1. Последняя иерархия заказчицы не выполнена: Bento не является первым экраном, а предложение месяца не следует сразу за ним.
2. Отдельной страницы нового Bento по Google Doc нет.
3. Purchase-CTA обещают покупку, оплату и быстрый доступ, но фактически открывают универсальную lead-форму консультации.
4. Тестовые отзывы показаны как реальные, а таймер ежедневно создаёт повторяющуюся срочность.
5. Editorial остаётся `noindex`, а `robots.txt` запрещает индексацию всего сайта.
6. Каталог содержит 5 из целевых 12 техкарт; финальный список из 12 позиций не определён.
7. На узких мобильных экранах есть горизонтальное переполнение; модалка и асинхронная форма не закрывают ключевые accessibility-требования.

## Scope and evidence

Проверено:

- `index.html` и `index_editorial.html` на desktop/tablet/mobile;
- представительная курсовая страница `frozen_cake.html` и договор `offer.html`;
- `styles.css`, `editorial.css`, `course.css`, `script.js`, `course.js`, `i18n.js`, `api/lead.mjs`;
- UA/EN-переключение, навигация, модалки, CTA, responsive-поведение и локальные media payloads;
- комментарии заказчицы из сообщения пользователя;
- Google Doc как структура **отдельной страницы нового курса**, не главной;
- Playwright: 320, 375, 390, 560, 768, 860, 1024, 1280/1440 px; финальный suite — 8/8 passed.

Не проверено и требует подтверждения:

- достоверность доходных claims, количества учениц и старых цен;
- реальные отзывы и право на их публикацию;
- финальные 12 названий/фото техкарт;
- финальные фото Лилии и работ учениц;
- модель продажи: checkout или заявка менеджеру;
- production env для Telegram lead relay;
- аналитика реального трафика и конверсия;
- субъективное одобрение заказчицей кремовой бумаги и текущего зелёного.

Статусы в отчёте:

- **Observed** — подтверждено исходником или rendered-state.
- **Inferred** — вывод из наблюдаемого поведения; требует продуктовой проверки.
- **Needs validation** — данных недостаточно.

## Требования заказчицы: трассировка

| Требование | Статус | Evidence / комментарий |
|---|---|---|
| Новый текст hero «Навчаю заробляти…» и две CTA | Met | Текст и кнопки стоят в `index_editorial.html:104-123`. |
| На mobile первый экран не должен быть только текстом | Met | Порядок `метка → заголовок → фото → лид → CTA` задан в `editorial.css:489-502`; на 390 px фото находится между заголовком и лидом. |
| Убрать клеточки | Met | В editorial нет плиточного/клеточного фона; поверхность плоская. |
| Сделать светло/бело | Partial | Фон светлый, но тёплый `#FDFBF5/#F9F5EC`, а не буквальный белый (`editorial.css:31-37`). Нужна визуальная валидация заказчицы. |
| Уйти от «грязного зелёного» | Partial / needs validation | Большая масса заменена светлым sage `#E7EEDA`, но primary остаётся `#4A7A14` (`editorial.css:47-53,408-436`). |
| Экран с цифрами сохранить | Met | `index_editorial.html:149-158`. Claims требуют доказательств. |
| Текст «Про мене» сохранить | Met | `index_editorial.html:264-287`. |
| Новые фото Лилии | Blocked by content | В About остаётся `assets/lilia.jpg`; новые утверждённые фото не получены. |
| «Обери свій курс» сохранить | Met structurally | Секция есть в `index_editorial.html:295-375`. |
| Новый Bento поставить первым курсом | Missing | Первым остаётся курс замороженных муссовых Bento; TODO виден в `index_editorial.html:303-305`. |
| Пасху временно убрать | Partial | Карточка скрыта в `<template>` (`index_editorial.html:338-357`), но Easter остаётся в Home metadata (`index_editorial.html:7`, `i18n.js:72-74`) и доступен по прямому URL. |
| «Що ти навчишся готувати» оставить, заменить фото | Partial / blocked by content | Галерея есть (`index_editorial.html:435-471`), утверждённых новых фото нет. |
| Отдельная навигация и блок техкарт | Met | Пункт меню — `index_editorial.html:83`; блок — `index_editorial.html:182-258`. |
| Snickers, Marrakech, carrot-caramel; 299 вместо 500 | Partial | Snickers и price pattern готовы; Marrakech и carrot-caramel остаются TODO (`index_editorial.html:255-257`). |
| Всего 12 техкарт | Missing content definition | Сейчас 5 карточек. Из комментариев и TODO нельзя однозначно восстановить все 12 уникальных позиций. |
| Заглушка размером с одну карточку | **Met** | `grid-column: span 1` (`editorial.css:335-347`); тест и rendered-state подтверждают равную ширину на 390/768/1024. При заполненном ряду она скрывается. |
| Объяснить действие «Не знаєш, який курс обрати?» | Partial | Editorial удалил полосу; публичный `index.html` её сохраняет. Это дизайнерская интерпретация, не подтверждённый ответ заказчицы. |
| Блок наставничества | Partial / blocked by content | Структура и CTA есть, но текст явно временный (`index_editorial.html:378-395`). |
| Bento «Новинка» — первый экран | **Missing** | Сначала общий hero; Bento начинается ниже fold (`index_editorial.html:98-146`). На 390 px блок начинается примерно с y=940. |
| Сразу ниже — «Пропозиція місяця» | **Missing / deliberate deviation** | Между Bento и monthly поставлены цифры (`index_editorial.html:149-180`); гипотеза не подтверждена заказчицей. |
| Две «Картоплі» за 700 грн | Met by content, not transaction | 925 → 700 и выгода 225 показаны (`index_editorial.html:161-180`), но покупка не реализована. |
| Одновременный запуск курса и сайта | Missing | Editorial — `noindex`; глобальный `robots.txt` — `Disallow: /`; отдельной Bento-страницы нет. |
| Google Doc как структура нового курса | Correctly separated by review | Документ следует использовать для course-detail: программа, 30+ уроков, 9 рецептов, декоры, бонусы, процесс обучения и отзывы. Не переносить всю структуру на Home. |

### Конфликты требований

1. Ранний комментарий задаёт общий hero с тезисом про доход; поздний требует Bento в первом экране. Текущая реализация сохраняет оба, но позднее требование не выполняет.
2. Заказчица просит `Bento → monthly offer`; текущий статус-документ сознательно вставляет между ними цифры. UX-гипотеза разумна, но требует согласования.
3. Цель — 12 техкарт, но доступные имена и TODO не складываются в подтверждённый список из 12. Нельзя выдумывать недостающие позиции.
4. «Белый и нежный» интерпретирован как тёплая бумага + sage. Это направление, не подтверждённая финальная палитра.

## Что работает хорошо

- Editorial заметно более авторский и premium, чем базовая Home: serif-корпус, асимметричный hero, нумерованные главы, «безкоробочный» каталог и смещённая галерея создают цельный голос.
- Mobile hero уже не является стеной текста: продуктовый кадр появляется до длинного lead.
- Клиентские блоки — цифры, About, courses, mentorship, techcards, monthly offer — структурно присутствуют.
- Каталог техкарт расширяем; одноразмерная заглушка теперь соответствует просьбе пользователя.
- Easter можно вернуть без повторной сборки карточки.
- В editorial нет повторяющихся теней, emoji-grid и тяжёлых card containers.
- Семантический `h1` один; у проверенных изображений есть `alt`.
- Выборочные editorial-цвета проходят AA: primary white on `#4A7A14` ≈ 5.14:1; body/secondary text также проходят.
- Modal уже поддерживает Escape, backdrop close и возврат фокуса к триггеру (`script.js:50-90`).
- Form success показывается только после успешного HTTP response; при ошибке введённые данные сохраняются (`script.js:96-127`).

## Launch blockers and findings

P0 здесь означает «нельзя выпускать в публичный коммерческий трафик», а не обязательно технический crash.

### P0 — публичный запуск заблокирован

#### P0.1 Purchase promise не соответствует flow

- **Status:** Observed; confidence high.
- Home CTA «Купити/Забрати» и курс обещают оплату/доступ, но общий JS отправляет только имя и Telegram в `/api/lead`; backend прямо документирует отсутствие checkout (`api/lead.mjs:1-13,46-90`).
- Все намерения заканчиваются одной консультационной модалкой (`index_editorial.html:524-552`).
- Impact: пользователь не может завершить обещанную покупку и получает другой следующий шаг.
- Smallest fix: выбрать одну модель. Либо подключить checkout и product-specific confirmation, либо честно переименовать CTA в `Залишити заявку / Отримати платіжне посилання` и объяснить SLA менеджера.

#### P0.2 Editorial не является публичной Home

- **Status:** Observed; confidence high.
- `index_editorial.html:8-10` содержит `noindex, nofollow`; `/` обслуживает `index.html`; `robots.txt:1-4` запрещает весь сайт.
- Smallest fix: делать canonical switch и SEO-разблокировку только после закрытия остальных launch gates.

#### P0.3 Нельзя публиковать выдуманные отзывы как social proof

- **Status:** Observed; confidence high.
- TODO прямо говорит заменить примеры, но три имени/города/результата видимы (`index_editorial.html:475-498`; `docs/STATUS.md:99-102`).
- Smallest fix: скрыть секцию до появления реальных разрешённых отзывов либо показать только проверяемые ссылки на Instagram proof.

### P1 — major

#### P1.1 Launch-offer не является первым экраном

- **Status:** Observed; confidence high.
- Current: generic hero → Bento novelty → stats → monthly. Client latest: Bento novelty → monthly.
- Impact: serial-position advantage получает общий бренд, а не продукт запуска.
- Recommendation: объединить brand promise и Bento в один hero; одна primary CTA к Bento, secondary — `Інші курси`. Monthly поставить следующим блоком; цифры — после него.

#### P1.2 Новый Bento не имеет detail page и конфликтует с существующим Bento

- **Status:** Observed; confidence high.
- Новинка — placeholder/waitlist (`index_editorial.html:127-146`), а первым в каталоге остаётся «Заморожені мусові торти бенто» (`index_editorial.html:306-320`).
- Impact: два разных продукта называются Bento без ясной архитектуры.
- Fix: отдельная страница по Google Doc с финальным названием, оффером, программой, ценой и однозначным отличием от frozen mousse Bento.

#### P1.3 Универсальная модалка смешивает четыре намерения

- **Status:** Observed; confidence high.
- Waitlist, monthly bundle, techcard purchase и mentorship application используют один title/lead/outcome (`index_editorial.html:142,175,202-242,391,524-552`; `script.js:69-83`).
- Impact: «Купити» превращается в «безкоштовну консультацію» — feedforward mismatch.
- Fix: intent-specific title, fields, submit label, product recap и success outcome.

#### P1.4 Ложная срочность и противоречивое reassurance

- **Status:** Observed; confidence high.
- `course.js:8-29` каждый день пересчитывает таймер до 23:59:59; цена/доступ после дедлайна не меняются.
- «Ви нічим не ризикуєте» в модалках конфликтует с финальностью платежа после доступа в `offer.html`.
- Fix: реальный датированный campaign deadline с post-deadline state либо убрать countdown/«тільки сьогодні»; заменить абсолютное reassurance фактическими условиями.

#### P1.5 Контент запуска неполон

- **Status:** Observed + blocked by client content; confidence high.
- Не готовы: Bento copy/price/page, финальные 12 techcards, mentorship text, новые About/gallery photos, реальные отзывы.
- Fix: content manifest с owner, status, approval и fallback для каждого item; не заполнять пробелы выдуманным контентом.

#### P1.6 Mobile overflow и course modal dismissal

- **Status:** Observed; confidence high.
- Editorial UA overflow: около 4 px на 390, 17 px на 375 и 72–73 px на 320. Root — inherited `.btn{white-space:nowrap}` (`styles.css:132-140`) плюс min-content в hero/mentorship (`editorial.css:496-530`).
- В representative course modal на 390×844 dialog выше viewport; close control оказывается над видимой областью.
- Fix: `min-width:0`, stretch/wrap mobile actions, viewport-safe modal with `align-items:flex-start`, internal scrolling and permanently visible close.

#### P1.7 Media payload слишком тяжёлый для mobile conversion

- **Status:** Observed local measurement; confidence high.
- `index_editorial.html` ссылается примерно на 77.2 MiB локальных media; representative course — около 51 MiB, включая ~38 MiB hero video.
- Impact: риск долгого LCP, расхода мобильного трафика и ухода до CTA.
- Fix: AVIF/WebP responsive images, poster first, compressed/streamed video, no eager loading below fold, size budgets and performance regression check.

### P2 — moderate

#### P2.1 Modal keyboard/screen-reader contract неполон

- **Status:** Observed; confidence high.
- Dialog имеет `role="dialog"`/`aria-modal`, Escape и focus return, но Tab не замыкается внутри; фон не получает `inert`/`aria-hidden`.
- Error/success не имеют `aria-live`/`role=status`; loading не объявляется через `aria-busy`.
- APG ожидает, что Tab/Shift+Tab остаются внутри modal dialog и фон действительно неинтерактивен: [W3C ARIA APG modal pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

#### P2.2 Target size и autoplay требуют доработки

- **Status:** Observed sampling; confidence medium because WCAG exceptions may apply.
- UA/EN switch и footer-offer измерены ниже 24 px по высоте; проект при этом декларирует 44 px targets.
- WCAG 2.2 AA устанавливает базовый минимум 24×24 с исключениями: [W3C Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).
- Course autoplay loops не имеют controls. Если движение длится >5 s и не essential, нужен pause/stop/hide: [W3C Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html).

#### P2.3 Design-system split

- **Status:** Observed; confidence high.
- Base DS документирует white/bright tokens (`docs/DESIGN-SYSTEM.md:10-30`), editorial переопределяет paper/deep-green palette и добавляет raw `#FBE8D9/#E7EEDA` (`editorial.css:25-76,280-284,408-436`).
- Recommendation: если editorial утверждён, сделать его canonical theme, создать semantic `surface-paper`, `surface-sage`, `surface-offer`, `action-primary` tokens и обновить DS; не поддерживать две Home бесконечно.

#### P2.4 Каталог из 12 элементов не соответствует текущей desktop-сетке

- **Status:** Inferred from current CSS; confidence high.
- `auto-fill minmax(200px,1fr)` формирует 5 колонок на wide desktop; 12 items дадут 5/5/2, хотя DS описывает 4×3.
- Recommendation: explicit 4 desktop / 3 tablet / 2 mobile before adding final content.
- One-card placeholder уже соответствует запросу. Его скрытие при полном текущем ряду — отдельное разумное поведение, но при необходимости постоянного анонса это нужно явно изменить.

#### P2.5 Bilingual fidelity неполна

- **Status:** Observed; confidence high.
- В EN techcard prices, `data-product` и gallery alts остаются UA; price HTML для курсов подставляет старые `.price__old/.price__new` вместо editorial classes (`i18n.js:119-137`).
- Impact: визуальный drift и украинские данные в English flow.

#### P2.6 Privacy, analytics и form feedback

- **Status:** Observed repository search; confidence high.
- Форма собирает имя/Telegram и обещает конфиденциальность, но доступной privacy-policy link/page не найдено; оферта только упоминает policy.
- Analytics/gtag/pixel/PostHog не найдены; launch funnel нельзя измерить.
- Submit disabled во время fetch, но нет понятного loading label/state; error fallback не является прямой Telegram link.

#### P2.7 Claims and pricing need evidence

- **Status:** Needs validation; confidence medium.
- `$1000`, `1 000 000+`, `1000+/2000+`, absolutes «з першого разу/завжди» и crossed-out prices требуют единой трактовки и доказательств.
- Editorial sampled contrast проходит AA; это не равно полной conformance. WCAG для normal text — 4.5:1, large — 3:1: [W3C Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

### P3 — polish and maintenance

- Monthly CTA говорит `Забрати збірку` в единственном числе, хотя продаются две.
- Easter всё ещё упомянут в metadata.
- Меню начинается с «Курси», хотя визуально раньше идут monthly/techcards.
- После reviews нет внутренней primary conversion CTA; остаётся внешний Instagram exit.
- Horizontal gallery скрывает scrollbar и не имеет явных controls/keyboard affordance.
- `docs/STATUS.md` частично описывает старую palette/composition и требует обновления после решения.
- EN missing/incorrect editorial keys и `home.modal_photo_alt` нужно закрыть системно.

## Craft review: named tests

| Test | Result | Evidence |
|---|---|---|
| Swap | **PASS editorial** | Замена Lora/italic marks, numbered chapters, asymmetric hero, unboxed catalog и staggered gallery на defaults разрушает узнаваемость. Base Home значительно более generic. |
| Squint | **FAIL overall** | Desktop hierarchy ясна, но mobile overflow/clipping ломает общую композицию и видимость CTA. |
| Signature | **PASS** | Signature: 01–06 chapter labels, editorial serif, asymmetrical hero, cardless catalog, paired offer media, pale-sage mentorship. |
| Token | **FAIL** | Параллельный root theme, appearance token `--green-deep`, raw sage/offer values и stale DS documentation. |
| AI Slop | **PASS with residue** | Нет gradient/emoji/nested-card/shadow repetition; cream и editorial composition domain-grounded. Остаточные generic-паттерны: big-number stats и `Детальніше`, но stats клиент одобрил. |

## Recommended Home information architecture

1. **Launch hero: Bento «Новинка».** Фото/короткое видео в первом viewport; brand promise про доход — supporting proposition, не отдельный длинный экран.
2. **Пропозиція місяця:** две «Картоплі» за 700; один честный transactional CTA.
3. **Proof pause:** подтверждённые цифры или компактный proof module.
4. **Техкарти:** 12 позиций, explicit 4/3/2 grid, фильтр/табы пока не нужны.
5. **Обери свій курс:** Bento first; legacy frozen Bento переименовать/развести.
6. **Про мене:** утверждённый текст + новые фото.
7. **Наставництво:** конкретная программа, fit, формат, результат и application CTA.
8. **Чому працює / Галерея:** capability and outcome evidence.
9. **Verified reviews:** только реальные, с разрешением и контекстом результата.
10. **Final CTA:** повтор главного launch action, не generic consultation.

Google Doc превращается в отдельную Bento detail page: hero → value/proof → 30+ lessons/9 recipes → modules/flavours/decor → bonuses → learning process/support/access → verified reviews → price/checkout. Home показывает только краткий teaser и ведёт туда.

## Smallest safe implementation sequence

### Gate 1 — product decisions

1. Зафиксировать: Bento replaces/merges generic hero; monthly идёт сразу следом.
2. Утвердить название и отличие нового Bento от frozen mousse Bento.
3. Зафиксировать 12 techcards: exact title, photo, regular/current price, order, availability.
4. Выбрать checkout vs lead-assisted sale.

### Gate 2 — trust and content

1. Скрыть placeholder reviews и убрать daily-reset urgency.
2. Выровнять refund/risk language с офертой.
3. Получить Bento copy/page, mentorship copy, новые фото и проверяемые claims.

### Gate 3 — interaction and accessibility

1. Intent-specific CTA/modal outcomes.
2. Исправить 320–390 overflow и viewport-safe course modal.
3. Focus trap, inert background, live feedback, loading state, target sizes, media controls.

### Gate 4 — system, localization and performance

1. Семантизировать editorial theme и обновить DS.
2. Исправить EN prices/product values/alts.
3. Оптимизировать 77/51 MiB payloads и добавить performance budget.
4. Добавить tests для Home overflow, order, 12-card grid, EN metadata и modal keyboard behavior.

### Gate 5 — launch operations

1. Сделать выбранный вариант canonical `index.html`.
2. Обновить title/meta/OG/canonical; удалить Easter metadata.
3. Добавить privacy link и funnel analytics.
4. Проверить production form/checkout end-to-end.
5. Снять `noindex` и global robots block только после финального QA.

## Launch gate

**Current: NO-GO.** Visual direction is strong; commercial journey and trust layer are not safe to launch.

Go only when:

- Bento is the approved first-screen offer and has a complete detail page;
- transaction copy matches actual checkout/lead behavior;
- no placeholder reviews or fabricated urgency remain;
- 12-card manifest and required photos/copy are approved;
- mobile overflow/modal issues and keyboard/screen-reader gaps are fixed;
- payload and EN path meet baseline quality;
- privacy, analytics, production env and SEO/indexation are verified.

## Open decisions for the owner/client

1. Bento replaces the generic hero or merges with it? Recommendation: merge, with Bento dominant.
2. Must monthly offer follow immediately, with stats after it? Recommendation: yes, matching the latest instruction.
3. Exact list and order of all 12 techcards; which position is still unnamed?
4. Is the placeholder meant to disappear when a current row is full, or remain as a permanent announcement until all 12 exist?
5. Checkout or lead-assisted sales? What exact response time and delivery channel?
6. Is warm paper + deep green approved, or must the final background be pure white with a brighter primary?
7. Are `$1000`, student totals and crossed-out prices verifiable and legally usable?

## Verification summary

- `npm test`: **8/8 passed**.
- One-card placeholder: width matched adjacent card at 390/768/1024; hidden at wide full-row state.
- Console: no observed errors in reviewed flows.
- Source review: one `h1`, no sampled missing `alt`; UA/EN and modal behavior exercised.
- Coverage gaps: no automated Home overflow, section-order, 12-card, EN product metadata, focus-trap, live-region or performance test yet.

## Design Engineer guardrails

| Check | Result | Evidence |
|---|---|---|
| Safety | PASS | Explicit project paths; no secret reads/writes, destructive commands, deployment, form submission, or external mutation. |
| Scope | PASS | Product change is limited to the explicitly requested one-card placeholder; all other output is review/documentation. |
| TDD | PASS | Placeholder regression test failed against the previous multi-column behavior, then passed after the scoped CSS/JS change; final suite 8/8. |
| Design grounding | PASS | Findings use the implemented HTML/CSS/JS source of truth, `docs/DESIGN-SYSTEM.md`, client requirements, and rendered-state evidence. |
| Canonical paths | PASS | Durable review is under `.design-engineer-plugin/design/reviews/`; disposable screenshots remain under `temporary/playwright/`. |
| Evidence discipline | PASS | Observed, inferred, unknown, confidence, and coverage limits are separated; no client approval or production readiness is fabricated. |
| Dependency impact | PASS | `.design-engineer-plugin/memory/stale-dependents.md` names Figma, design-system, requirements, and test candidates without asserting unverified breakage. |
| Verification | PASS | Responsive/keyboard/contrast/source audits and `npm test` ran; production env, checkout, analytics, client approval, and claim evidence are explicitly unverified. |
| Completion | PASS | UX/requirements, psychology/ethical persuasion, craft/design-system, accessibility, and synthesis outputs are complete; unresolved launch blockers remain visible. |
