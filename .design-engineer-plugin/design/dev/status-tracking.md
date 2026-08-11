---
activity: home-launch-remediation
date: 2026-08-01
phase: phase_6_development
deliverable_type: status_update
component: project_status
status: complete
severity: critical
tags: [homepage, bento, conversion, accessibility, localization, trust, responsive, launch-readiness]
related_deliverables:
  - ".design-engineer-plugin/design/reviews/2026-08-01-home-direction-launch-readiness/review.md"
  - ".design-engineer-plugin/plans/2026-08-01-home-launch-remediation.md"
  - "index_editorial.html"
  - "bento.html"
  - "docs/STATUS.md"
tools_used: [codex-desktop, playwright]
decisions:
  - "Used a truthful lead-assisted conversion model because no checkout provider, approved Bento price, or payment integration exists; CTA copy therefore describes a manager-assisted request or waitlist instead of a completed purchase."
  - "Kept the editorial Home and Bento page noindex because privacy, production lead delivery, content, proof, canonical, and release decisions remain unresolved; implementation completion is not a public-launch claim."
  - "Kept the mobile product image before the long lead and CTA because the client explicitly rejected a text-only first screen; the tradeoff is that the primary CTA begins just below the first 320 px viewport."
failed_approaches:
  - "The full Bento product name inherited the shared nowrap marker. A first mobile-only override fixed 80 px of mobile overflow but left the desktop title able to cover the photo; moving the scoped wrap rule to the Bento hero at every width and allowing the grid child to shrink fixed both cases without changing the shared short-accent utility."
  - "The shared modal translate/scale animation temporarily extended the full-screen mobile dialog below the dynamic viewport; disabling that animation only below 560 px kept the dialog inside 100dvh."
  - "The Bento backlink and eyebrow both rendered inline and visually merged; making the eyebrow a block-level flex row restored a verifiable vertical hierarchy."
---

# Home launch remediation

## Outcome

The actionable implementation findings from the Product Director review are complete for the local preview. The recommended Home now opens with one combined brand+Bento hero followed by a compact Bento detail, the separate Bento prelaunch page exists, conversion language matches the actual lead flow, deceptive trust mechanics are removed, mobile and modal contracts are covered, and changed copy is bilingual.

This is a completed development phase, not a public release. `index_editorial.html` and `bento.html` remain `noindex`; `index.html` remains the rollback Home.

## Requirement traceability

| Approved requirement / evidence | Result | Implementation evidence |
|---|---|---|
| Merge the school proposition and Bento launch in one hero | Met | `index_editorial.html` has one brand-value `h1`; the same hero contains the Bento photo/caption, course choice and mentorship paths. |
| Mobile first screen is not only text | Met | Mobile order is eyebrow → title → Bento image → lead → CTA; 320 px screenshot verified. |
| Light, non-grid background | Met | Flat paper/sage semantic surfaces in `editorial.css`; no grid texture. |
| Compact Bento detail before monthly | Met | `#bento-launch` is the immediate sibling after `.ed-hero`; `#monthly` follows it and the DOM-order contract passes. |
| Keep approved numbers/About | Met with release evidence dependency | Blocks retained; claim substantiation remains a public-release gate. |
| Bento is first in `Обери свій курс` | Met | First `.ed-course` links to `bento.html`, without an invented price. |
| Temporarily remove Easter | Met | Home card is stored in `<template>`; Easter page remains `noindex`. |
| Separate Bento page from Google Doc | Met | `bento.html` covers 30+ videos, 9 flavours, 4 sponges, decor, bonuses, audience, format, certificate, author and waitlist. |
| Add separate techcard catalog/button | Met structurally | Five sourced cards render in a 4/3/2 grid; CTA is assisted-order. |
| Placeholder equals one card | Met | One-column placeholder contract and dedicated regression test pass. |
| Prepare for 12 techcards | Met structurally / blocked by content | Grid resolves 4×3 when 12 items exist; seven names/assets/prices remain unknown. |
| Explain consultation CTA behavior | Met | Generic ribbon removed; every remaining modal trigger declares its actual intent and product. |
| Mentorship block | Partial by authorized content | Section and intent-specific application exist; final client text/photo remain pending. |
| Lighter/cleaner green | Met in preview / needs client approval | Deep mass replaced with light sage; accessible `--action-primary` used for CTA. |
| Reorderable sections / monthly promotion | Met | Sections are independent DOM blocks; no coupled carousel or page builder. |

## Deliberate deviations

- The approved stats block sits after the monthly offer and before techcards. This follows the remediation plan’s proof sequence while keeping the client-approved numbers; it is not a claim that the client approved the final order.
- Editorial uses warm near-white paper (`#FDFBF5`) instead of literal `#FFFFFF`. It satisfies the request for a light, flat background while preserving the selected editorial direction; final palette approval is still external.
- On 320 px Home and Bento, the primary CTA starts below the initial viewport because the product photo is intentionally shown before the longer explanatory copy. This directly addresses the client’s text-only-mobile complaint. A future conversion experiment may test a compact sticky or earlier CTA after launch analytics exist.
- Missing price/date, the seven missing techcards, mentorship content, photography, testimonials and proof were not fabricated.
- No checkout, canonical switch, indexing, analytics mutation or deployment was performed.

## Implemented system changes

- Home: combined brand+Bento hero, compact Bento launch ledger before monthly, explicit 4/3/2 techcard grid, one-card placeholder, Bento-first course list, hidden Easter and external Instagram proof.
- Bento: dedicated responsive UA/EN prelaunch detail page, source-based programme and honest waitlist with no price, countdown or testimonial quote.
- Modal: intent copy, localized product recap, focus trap, focus return, inert background, live feedback, input retention, Telegram fallback and viewport-safe mobile layout.
- Legacy courses: assisted-order CTA contract, no daily countdown, no placeholder review quotes, softened unsupported absolutes, user-controlled media and editorial Home return links.
- Localization: new/changed visible text, `data-product`, alt and aria labels have UA/EN coverage.
- Documentation: `docs/STATUS.md` and `docs/DESIGN-SYSTEM.md` now describe the implemented system rather than the superseded review state.

## Verification evidence

| Check | Result | Coverage |
|---|---|---|
| Targeted combined-hero matrix | PASS, 4/4 | hierarchy, UA/EN, mentorship intent, mobile overflow and desktop containment |
| Full Playwright suite | PASS, 21/21 | Home, Bento, four courses, offer links and no-jump behavior |
| JS syntax | PASS | `script.js`, `course.js`, `i18n.js` |
| Diff hygiene | PASS | `git diff --check` |
| Visual matrix | PASS | UA/EN at 320, 390, 768 and 1280; no clipping or document overflow |
| Browser runtime | PASS | no console/page/request failures in the Home/Bento matrix |
| Modal keyboard | PASS | focus entry/trap, Escape, focus return, inert background and live regions |
| Asset requests | PASS | 41 Home and 5 Bento image URLs returned HTTP 200 |
| Public lead delivery | NOT VERIFIED | production Telegram variables are unavailable in local preview |
| Checkout | NOT IMPLEMENTED | deliberately remains lead-assisted |

## Guardrails

| Guardrail | Result | Evidence |
|---|---|---|
| Safety | PASS | scoped, reversible local edits; no credentials, deploy or destructive command |
| Scope | PASS | changes trace to client comments, review findings and the approved remediation plan |
| TDD | PASS | baseline/red contracts preceded hierarchy/trust work; mobile dialog and Bento hierarchy each demonstrated red → green |
| Design grounding | PASS | editorial review, existing tokens/components, client comments and Bento source document; screenshots only supplementary |
| Paths | PASS | plan, review, status note and temporary screenshots use canonical project paths |
| Evidence | PASS | observed behavior, external unknowns and coverage limits are separated here and in `docs/STATUS.md` |
| Dependencies | PASS | downstream candidates recomputed in `memory/stale-dependents.md` |
| Verification | PASS | executable suite, syntax, DOM/keyboard, responsive, console and visual checks completed |
| Completion | PASS for development phase | implementation roles, independent simplification and final visual QA finished; public-release blockers remain explicit |

## Public-release gates

Before canonical switch or deploy: approve Bento price/date/offer, complete 12-card content, supply mentorship/photos, substantiate claims and price anchors, publish Privacy Policy, configure/test `/api/lead`, choose checkout versus official manager-assisted payment, and complete legal/release approval.

## Follow-up — combined brand + Bento Home hero (2026-08-02)

The owner confirmed that the Home must not lose its school-level proposition when Bento becomes the launch focus. The former Bento-only cover was therefore replaced by one combined first screen rather than stacking two heroes.

- Hero: the single `h1` is `Навчаю заробляти на десертах вдома — навіть з нуля`; Bento remains visible through the existing product photograph and a compact non-clickable `Новинка · передзапис` caption.
- Conversion: Home hero routes to `Обрати курс` and the existing mentorship intent dialog. The direct Bento programme/waitlist action is consolidated in the immediately following `#bento-launch` block.
- Launch detail: the sage ledger truthfully summarizes 30+ video lessons, 9 signature flavours and 7 decor techniques, then hands off to `Пропозиція місяця`.
- Localization: UA inline copy and EN dictionary were updated together; the shared rollback Home English hero was reconciled with its existing Ukrainian brand copy.
- RED evidence: the combined-hero contract first failed because the current `h1` contained only `Онлайн-курс «Бенто торти від А до Я»`. A first mobile pass also exposed 71 px of overflow from the launch-detail title’s inherited nowrap marker.
- GREEN evidence: the targeted UA/EN/intent/responsive matrix passes 4/4; the full Playwright suite passes 21/21; visual evidence covers UA/EN at 390 and UA at 1280.
- Independent simplification: the full-width clickable caption was reduced to a compact non-clickable product label so the programme CTA exists in one place only. Independent design-system/craft QA reports no blocking finding.

### Combined-hero guardrails

| Guardrail | Result | Evidence |
|---|---|---|
| Safety | PASS | Scoped local source/test/documentation edits; no credentials, destructive action, deploy or production mutation. |
| Scope | PASS | Changes implement the explicitly approved combined hero, compact Bento detail, two Home actions and no second oversized hero. |
| TDD | PASS | The new brand-H1 contract failed against the Bento-only title before production edits; the 320 px overflow check caught the nowrap regression before completion. |
| Design grounding | PASS | Existing editorial grid, Lora/Montserrat hierarchy, paper/sage/action tokens, product photo, buttons and intent modal are reused. |
| Paths | PASS | Product edits use existing source files; durable updates remain in canonical `design/dev`, `plans`, `memory` and `docs` paths. |
| Evidence | PASS | Browser screenshots, measured overflow, executable tests, independent review and external release unknowns remain distinct. |
| Dependencies | PASS | Figma/capture artifacts remain the visual downstream refresh candidate; canonical/SEO release state is unchanged. |
| Verification | PASS | UA/EN browser evidence, 320–390 overflow, 861–1536 containment, mentorship dialog, JS syntax, full Playwright and diff hygiene pass. |
| Completion | PASS | Context/test roles, implementation, simplification, independent visual audit and documentation are complete; release gates remain explicit. |

## Follow-up — desktop hero title containment (2026-08-01)

The client screenshot exposed a remaining desktop regression: the green Bento phrase still inherited `white-space: nowrap` above the 860 px mobile breakpoint and crossed from the copy column onto the product image.

- RED evidence: the new Playwright contract measured `121.67 px` of Ukrainian title overflow at a 1024 px viewport.
- Implementation: the long marker may wrap only inside `.ed-hero .ed-display`; `.ed-hero__copy` uses `min-width: 0`; the global short-accent marker remains unchanged; the Home cache key is `editorial.css?v=20260801-ed28`.
- GREEN evidence: UA and EN titles remain within the copy column at 861, 1024, 1280 and 1536 px; the breakpoint-edge review at 861 px has zero document overflow.
- Verification: targeted remediation 9/9, full Playwright 17/17, JS syntax and diff hygiene PASS; visual checks cover UA/EN at 390 and 1554 px plus UA at 861 and 1024 px.
- Independent simplification: PASS; both wrap declarations and the grid-child shrink rule are necessary, and no image-overlap assertion is needed because the copy-column boundary is the stricter contract.

### Follow-up guardrails

| Guardrail | Result | Evidence |
|---|---|---|
| Safety | PASS | Explicit local files only; no secret, destructive, deploy or production action. |
| Scope | PASS | Product changes are limited to Bento hero wrapping, grid-item shrinkability, one cache key and its regression contract. |
| TDD | PASS | The containment test failed at `+121.67 px` before the CSS edit and passed afterward, including the 861 px breakpoint edge. |
| Design grounding | PASS | Existing hero, marker utility, typography and breakpoint are reused; the supplied screenshot is supplementary evidence. |
| Paths | PASS | Product edits use existing source paths; durable Design Engineer updates remain in canonical `design/dev` and `memory` paths. |
| Evidence | PASS | Measured geometry, screenshots, test results and unverified release inputs are kept distinct. |
| Dependencies | PASS | Figma remains the only newly relevant visual downstream candidate; `stale-dependents.md` was recomputed. |
| Verification | PASS | UA/EN geometry, mobile/desktop screenshots, targeted/full Playwright, JS syntax and diff hygiene pass. |
| Completion | PASS | Independent simplification finished; the requested local defect is closed while unrelated public-release gates remain explicit. |

## Follow-up — Google Doc programme authority (2026-08-01)

The client clarified that the supplied Google Doc already contains the Bento programme. The page now treats that document as the approved curriculum source instead of implying that a “final programme” still awaits approval.

- Source reconciliation: the hero now says `9 author recipes`; it explicitly includes downloadable/printable tech cards, useful confectionery tips and worldwide unlimited access.
- Curriculum correction: the decor ledger contains all 7 Google Doc topics; the previously folded lettering-stability topic is restored as its own item.
- Commercial boundary: only the start date and price remain pending in the waitlist and modal copy. Purchase/immediate-access language remains excluded because checkout and commercial terms are not approved.
- RED evidence: the new programme contract expected 7 decor topics and observed 6 before the product edit.
- GREEN evidence: targeted remediation 9/9 and full Playwright 17/17 pass; `node --check i18n.js` and `git diff --check` pass.
- Responsive/localization evidence: UA and EN at 320, 390, 768 and 1280 px have zero document overflow, render 7 decor topics and contain no pending-programme wording.
- Independent simplification: PASS; the correction is limited to Bento source copy, its EN dictionary, cache key and regression contracts.

### Programme-reconciliation guardrails

| Guardrail | Result | Evidence |
|---|---|---|
| Safety | PASS | Scoped local edits only; no credentials, destructive action, deploy or production mutation. |
| Scope | PASS | Product changes are limited to correcting the supplied Bento programme and its regression coverage. |
| TDD | PASS | The new 7-topic contract failed at 6 before implementation and passed afterward. |
| Design grounding | PASS | The client Google Doc is the curriculum source; existing Bento components and tokens are reused. |
| Paths | PASS | Product and durable documentation edits use existing canonical project paths; screenshots remain temporary QA evidence. |
| Evidence | PASS | Approved programme content, unknown price/date and deliberately unsupported purchase/testimonial claims are kept distinct. |
| Dependencies | PASS | Figma/capture artifacts remain the relevant visual downstream candidate and were recomputed in `memory/stale-dependents.md`. |
| Verification | PASS | UA/EN DOM and visual matrices, targeted/full Playwright, JS syntax and diff hygiene pass. |
| Completion | PASS | Context audit and independent simplification are complete; the programme-source defect is closed while release gates remain explicit. |

## Follow-up — Bento visual curriculum, palette and badge (2026-08-01)

The client clarified that the recipe and decor syllabus must be visually represented, the unsourced pink theme must be removed, the blinking dots must disappear everywhere, and the circular experience badge needs a more distinctive shape.

- Visual curriculum: the 9 flavours and 7 decor techniques now use equal-size course-card media slots. Five flavour cards use exact source-matched project photos; four flavour slots and all seven decor slots explicitly await the new shoot.
- Asset truth: images from other products were not relabelled as missing Bento flavours or decor techniques. The page exposes the real production dependency instead of fabricating completeness.
- Responsive rhythm: flavours render 3/3/1 and decor 3/2/1 at the tested desktop/tablet/mobile widths.
- Palette: Bento now inherits the editorial paper, sage and action-green semantics. Computed-style scans found no former pink UI values; small placeholder text uses the darker green and measures above the 4.5:1 WCAG AA threshold.
- Motion cleanup: `.eyebrow__dot` markup, CSS and i18n reinsertion logic were removed from all marketing pages, not merely hidden.
- Badge: `4+` is an asymmetric, rotated label with chamfered irregular edges. Its UA/EN label and transformed outline stay contained at 320, 390, 861 and 1280 px.
- RED evidence: visual-card counts were 0; the decor grid had 2 desktop columns instead of the intended 3; `index.html` retained 10 dot nodes; placeholder contrast measured 4.159:1; and the previous UA/EN badge label overflowed its inner column.
- GREEN evidence: targeted remediation 12/12 and full Playwright 20/20 pass; JS syntax and `git diff --check` pass.
- Browser evidence: UA/EN at 320, 390, 768, 861 and 1280 px have zero document overflow, zero runtime/request errors, 5 loaded flavour images, correct card counts/columns, no pink UI style hits and a contained badge.
- Independent simplification and final visual QA: PASS after fixing the English badge overflow and the 861 px left-edge clipping found by the independent reviewers.

### Visual-follow-up guardrails

| Guardrail | Result | Evidence |
|---|---|---|
| Safety | PASS | Scoped local source/test/documentation edits; no secrets, destructive action, deploy or production mutation. |
| Scope | PASS | Every product change maps to the client’s photo, palette, dot and badge comments; no new commercial behavior was added. |
| TDD | PASS | Card, grid, dot, contrast and badge contracts each demonstrated a failing state before their corresponding production correction. |
| Design grounding | PASS | Existing course cards, editorial semantic tokens, Google Doc syllabus and verified project assets are reused; screenshots remain supplementary. |
| Paths | PASS | Product edits use existing files and durable notes remain in canonical `design/dev` and `memory` paths; QA captures stayed under `/tmp`. |
| Evidence | PASS | Source-matched photos, missing photography, measured runtime behavior and external release unknowns are explicitly separated. |
| Dependencies | PASS | Figma/capture references and the photography/content manifest are recorded as downstream refresh candidates. |
| Verification | PASS | Playwright, JS syntax, diff hygiene, UA/EN responsive DOM/runtime matrix, contrast and independent visual QA pass. |
| Completion | PASS | Implementation, independent simplification, final visual QA and documentation are complete; only external content/release inputs remain. |
