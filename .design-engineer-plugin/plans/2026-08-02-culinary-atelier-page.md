# Culinary Atelier — separate Home preview

## Objective

Translate the user-selected first ImageGen direction at `/Users/olena.domina/.codex/generated_images/019fbde2-0274-75e0-8066-baf6c3a56705/exec-9d94d256-0703-46ca-b418-0c9d200da407.png` into a responsive, interactive, separate TORTOPANI Home-page preview. Preserve `index_editorial.html`, `index_flavoriz_green.html`, `index_avant_green.html`, canonical routing, indexing and deployment state.

## Scope

- Add `index_atelier_green.html` as `noindex, nofollow`.
- Add page-scoped `atelier-green.css` over the existing shared Home behavior.
- Reuse the exact `assets/logo_hor.png`, approved copy, i18n, lead modal and navigation behavior.
- Prepare a clean image-only hero asset derived from the selected direction and the supplied Lilia photography; no baked-in UI text.
- Keep the author visibly central on desktop and keep meaningful photography in the first mobile viewport.
- Add focused automated coverage for the alternate route.

## Visual contract

- Warm milk/ivory surface with clear botanical green, dark ink and a restrained lilac photographic accent.
- Original TORTOPANI logo, minimal navigation and compact language control.
- Large high-contrast editorial headline paired with a contemporary sans-serif body.
- Lilia in a white chef jacket with cakes as the primary visual proof.
- One pill primary CTA, one supporting text link and generous whitespace.
- Rounded photography and controls; no hard-corner buttons, grid wallpaper, card clutter, gradients, glassmorphism or fake proof.

## Implementation phases

1. Record the exact selected mock and measure its hierarchy, crop, spacing and responsive priorities.
2. Establish a failing focused test for `/index_atelier_green.html` before production files exist.
3. Generate and inspect the clean hero asset, then save an optimized project-bound derivative.
4. Build the alternate HTML/CSS route using existing content, interaction and accessibility foundations.
5. Verify desktop/mobile layout, UA/EN, menu, modal, local links, assets, console and overflow in the in-app browser.
6. Run same-viewport visual comparison, Design QA, independent audit and Design Engineer guardrails.

## Acceptance checks

- The separate route returns 200, contains exactly one live HTML `h1`, and stays `noindex, nofollow`.
- The logo is `assets/logo_hor.png`; the selected author-led composition and clear green accent are visibly preserved.
- Mobile is not text-only and has no horizontal overflow at 320, 390, 768 or 1440 px.
- Primary CTA, anchor links, UA/EN, burger focus/Escape and lead modal work.
- Local assets and links resolve and the browser console has no runtime errors.
- Root `design-qa.md` records `final result: passed` before handoff.

## Recovery

The change is additive. Rollback only removes the new Atelier route, its page-scoped CSS, its dedicated image asset and focused test.

## Completion evidence

- Selected source and revised implementation were normalized and compared at 1440 × 1024; focused hero and 390 × 844 mobile evidence are stored under `.design-engineer-plugin/design/reviews/2026-08-02-culinary-atelier-page/qa/`.
- Independent audit findings for contrast, gallery weight, mobile source width and menu ownership were fixed; re-audit passes the separate visual prototype with no P0/P1.
- `npm test`: 33/33 passed after final refinements.
- Atelier + Flavoriz focused regression: 12/12 passed.
- `node --check` for `script.js`, `avant-green.js`, `i18n.js` and `tests/atelier-green.spec.js`: passed.
- `git diff --check`: passed.
- Product Design QA: `design-qa.md` records `final result: passed`.
