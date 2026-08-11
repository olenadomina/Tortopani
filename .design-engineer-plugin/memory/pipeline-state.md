# Design Engineer Pipeline State

## Last Updated

2026-08-02T21:58:30+02:00 — Signature Green best-of Home candidate completed, independently reviewed and responsively verified; canonical previews and public-release gates remain unchanged.

## Project

- Type: existing product
- Mode: autopilot
- Orchestration depth: full
- Product: bilingual static TORTOPANI marketing site and course pages
- Source of truth: HTML/CSS/JS implementation; the client Google Doc is the approved Bento programme source; Figma is downstream
- Branch: `feat/home-restructure-2026-08`

## Completed Phase

Phase 7 Review — `review:signature-green-home`.

- Completed skills: `design-engineer`, `design-engineer-development`, `design-engineer-review`, `design-engineer-roles`, `design-engineer-guardrails`, `design-engineer-document`.
- Approved plan: `.design-engineer-plugin/plans/2026-08-02-signature-home.md`.
- Completion evidence: `.design-engineer-plugin/design/reviews/2026-08-02-signature-green/design-qa.md`.
- Guardrails: 9/9 applicable checks PASS for the internal noindex candidate.
- Release classification: preferred local Home direction; NO-GO for public launch until the gates below close.

## Implemented

- `index_signature_green.html`: independent noindex Home candidate with one author+Bento hero, programme facts/benefits, monthly offer, techcards, method proof, course catalog, author/mentorship, gallery, external reviews and final consultation.
- `signature-green.css`: standalone warm-ivory/botanical-green visual system over shared `styles.css`, using Prata + Manrope, fine borders, restrained shadows, soft section/card geometry and pill controls.
- `signature-green.js`: one enhanced mobile-navigation owner, skip-link focus transfer and keyboard-operable horizontal gallery.
- `i18n.js`: Signature-specific Ukrainian/English product recaps, accessible action names, gallery labels and image alternatives.
- `tests/signature-green.spec.js`: test-first route, visual-token, responsive, localization, menu, modal, gallery, accessibility, asset/link and structural contracts.
- Existing Editorial, Avant Green, Flavoriz and Culinary Atelier routes remain available for comparison; `index_editorial.html` remains the current canonical preview and `index.html` remains rollback.

## Design Decision

Signature Green is the preferred synthesis because it uses the product's strongest proprietary visual asset — Liliia herself — while keeping the Bento launch commercially explicit. It combines Culinary Atelier's personal trust, Editorial's information hierarchy, Flavoriz's compact benefit communication and the existing site's truthful assisted-conversion behavior. It does not inherit another experimental stylesheet or imitate the louder poster/grid reference.

## Verification

- PASS: focused Signature contract 10/10 after a RED 404 baseline; all route, visual, responsive, interaction and asset checks pass.
- PASS: `npm test -- --workers=2 --reporter=dot` — 49/49 Playwright tests.
- PASS: 320 × 568 mobile first screen — author height 226 px, Bento product visible, CTA bottom 556.91 px, zero horizontal overflow.
- PASS: 390 × 844 Ukrainian and English mobile states; author, Bento proposition and CTA remain in the first screen.
- PASS: 900 px enhanced menu contract; focus entry, Escape and focus return.
- PASS: 1440 × 1024 desktop — zero overflow, broken images, duplicate IDs, console warnings or errors; one H1 and `noindex, nofollow` confirmed.
- PASS: keyboard gallery; ArrowRight moved the rail from 18 px to 330.5 px.
- PASS: lead modal intent behavior, localized product recap, focus trap/return, live feedback and mobile containment retained.
- PASS: `node --check` for `script.js`, `i18n.js` and `signature-green.js`; `git diff --check`.
- COVERAGE GAP: repository automation remains Firefox-only; Chromium/WebKit are future launch-QA candidates.
- NOT VERIFIED: production `/api/lead` delivery, payment, analytics/consent, legal approval, claim substantiation, canonical switch, indexation, deployment and deployed performance.

## Deliberate Deviations

- Bento price and date are shown as pending rather than invented.
- Mentorship uses a waitlist until the client supplies and approves the final programme text.
- Techcard and monthly-offer CTAs explicitly route through a manager because checkout is not defined.
- Only the five sourced techcards are shown plus one same-size `Soon` card; the still-missing seven-item manifest is not fabricated.
- The page is light warm ivory rather than literal white, preserving softness while meeting the client's light-background direction.
- Signature Green stays noindex and separate. No deploy or canonical switch was authorized.

## Public-Release Gates

1. Publish and link a reviewed Privacy Policy before collecting name and Telegram in production.
2. Approve Bento price, date, final offer and payment model.
3. Supply the complete ordered 12-techcard manifest, remaining assets and supported current/old prices.
4. Supply four missing Bento flavour photos, seven decor-technique photos, final mentorship content and remaining site photography.
5. Substantiate or remove statistics, income claims and crossed-out price anchors.
6. Configure and verify production `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` and end-to-end `/api/lead` delivery.
7. Complete analytics/consent, canonical/indexation, legal and deployment approval.

## Exact Next Action

Open `index_signature_green.html` with the client and approve or reject this visual direction. If approved, collect the Privacy Policy, Bento commercial terms, 12-techcard manifest/assets, mentorship content and claim evidence; then run a focused Phase 7 launch-readiness review before any canonical switch, indexing or deploy.

## Open Questions

- Does the client approve Signature Green as the future canonical Home direction?
- What are the approved Bento price, start date and payment terms?
- Which seven techcards complete the catalog, in what order, with which assets and prices?
- Is manager-assisted payment the official product flow, or will checkout be added?
- Which statistics, income statements and old-price anchors have documentary support?
- Who owns Privacy Policy approval, analytics consent and production lead verification?
