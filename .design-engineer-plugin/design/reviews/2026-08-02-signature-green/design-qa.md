---
activity: signature-green-home
date: 2026-08-02
phase: phase_7_review
deliverable_type: visual_review
component: ui_visual
status: complete
severity: medium
tags: [homepage, bento, author-brand, conversion, accessibility, responsive, localization, launch-readiness]
related_deliverables:
  - ".design-engineer-plugin/plans/2026-08-02-signature-home.md"
  - "index_signature_green.html"
  - "signature-green.css"
  - "signature-green.js"
  - "tests/signature-green.spec.js"
tools_used: [codex-desktop, playwright, design-engineer]
decisions:
  - "Selected an author-led Bento launch as the strongest synthesis: Liliia provides personal trust, the real Bento image makes the product concrete, and the warm ivory/botanical-green system keeps the presentation premium without becoming cold or generic."
  - "Kept the candidate noindex and independent from earlier experimental stylesheets; a public canonical switch requires explicit approval plus commercial, privacy and delivery inputs."
failed_approaches:
  - "The first 320 × 568 composition left the primary CTA too close to the viewport edge. Tightening only the smallest hero media/copy spacing retained meaningful author and product imagery while moving the complete 52 px CTA to 556.91 px."
  - "The initial gallery looked like a clipped desktop strip on mobile. Giving the rail explicit horizontal overflow, keyboard focus and ArrowLeft/ArrowRight behavior made the same visual pattern discoverable and operable."
---

# Signature Green — final design QA

## Outcome

`index_signature_green.html` is the recommended local Home direction for TORTOPANI. It combines the strongest verified qualities of the reviewed versions instead of extending any one concept literally:

- Culinary Atelier: Liliia is the primary trust signal and the site feels like a personal expert brand.
- Editorial: Bento, monthly offer, techcards and the full course choice have a clear commercial order.
- Flavoriz: the hero communicates product benefits compactly through 30+ lessons, 9 flavours, 7 techniques and three simple icon benefits.
- Existing product: real imagery, original logo, bilingual content, internal routes and intent-specific lead flows remain intact.

The selected expression is warm ivory, botanical green, Prata + Manrope, fine borders, restrained shadows and rounded controls. It deliberately excludes grid wallpaper, sharp CTA corners, gradients, pink/orange UI accents, blinking dots and generic SaaS decoration.

## Product and conversion hierarchy

`Bento hero → programme facts → monthly offer → techcards → proof of method → courses → author + mentorship waitlist → outcomes gallery → external reviews → consultation`.

The hero resolves the earlier conflict between a school-level identity and a launch product by showing both the author and a real Bento product crop while giving Bento the single dominant first-screen action. Unknown price and date are stated as pending. Commerce actions say they go through a manager; mentorship remains a waitlist until the programme copy is approved.

## Independent review findings and fixes

- Replaced a speculative generated product visual with the real `assets/hero-bento.png`.
- Removed the sticker-like product treatment and retained a quiet 1 px rounded inset.
- Moved techcards directly after the monthly offer so the user reaches the requested catalog before abstract proof.
- Aligned enhanced mobile navigation through 980 px and verified focus entry, Escape and focus return at 390 and 900 px.
- Made the gallery horizontally scrollable, focusable and keyboard-operable; ArrowRight moved the rail from 18 px to 330.5 px in manual QA.
- Added product-specific accessible names and explicit old/current price semantics to techcard actions.
- Added programmatic focus transfer for the skip link target.
- Localized the remaining English product recaps, image alternatives and gallery labels.
- Kept language targets at 44 × 44 px and moved the 320 × 568 CTA fully inside the first screen.

## Verification evidence

| Check | Result | Coverage |
|---|---|---|
| Focused Signature contract | PASS, 10/10 | route/noindex, hero, palette, 320–1440 responsive states, short phone, UA/EN, menu, modal, gallery, links/assets |
| Full Playwright regression | PASS, 49/49 | Home variants, Bento, course pages and shared behavior |
| Mobile first screen | PASS | 320 × 568: author 226 px high, product visible, CTA bottom 556.91 px, zero horizontal overflow |
| Desktop visual/runtime | PASS | 1440 × 1024: one H1, zero overflow, zero broken images, zero duplicate IDs, no console warnings/errors |
| Intermediate navigation | PASS | 900 px enhanced menu ownership and keyboard contract |
| Localization | PASS | Ukrainian and English at 320, 390, 768, 900 and 1440 px |
| Conversion behavior | PASS for local preview | direct Bento route plus assisted-order, waitlist and consultation modal intents |
| Public lead delivery | NOT VERIFIED | production Telegram environment and end-to-end delivery remain external |
| Automated engines | COVERAGE GAP | repository Playwright configuration remains Firefox-only |

## Design Engineer guardrails

1. Safety — PASS. The route is additive and reversible; no deploy, canonical switch, indexing change, credential access or destructive repository action occurred.
2. Scope — PASS. The work implements the requested best version from the reviewed directions and leaves unrelated pages intact.
3. TDD — PASS. `tests/signature-green.spec.js` first failed on the absent route (HTTP 404), then passed after implementation and regression fixes.
4. Design grounding — PASS. The comparative review, user-supplied references and author photography, original logo, verified project assets and existing interaction patterns anchor the result.
5. Paths — PASS. Plan, review and durable state use canonical Design Engineer locations; the product route follows the repository's existing root-page structure.
6. Evidence — PASS. Measured browser geometry, executable tests, design judgment and externally unknown launch inputs are separated.
7. Dependencies — PASS. Canonical/SEO, Figma, content, privacy and analytics candidates were recomputed in `memory/stale-dependents.md`.
8. Verification — PASS. Responsive UA/EN, keyboard navigation, gallery, modal, console, assets, syntax, diff hygiene and full regression coverage were exercised.
9. Completion — PASS for the requested internal noindex prototype. Public release remains NO-GO until the gates below close.

## Public-release gates

1. Publish and link a reviewed Privacy Policy before collecting name and Telegram in production.
2. Approve Bento price, date, payment model and the full ordered 12-techcard manifest with supported prices/old-price anchors.
3. Supply missing Bento and decor photography plus final mentorship content.
4. Substantiate statistics, income claims and crossed-out price anchors or remove them.
5. Configure and verify production lead delivery, analytics/consent, canonical/indexation and deployment.

## Final classification

PASS as the preferred local noindex Home candidate. NO-GO for public launch until privacy, commercial content, proof, lead delivery and release approval are complete.
