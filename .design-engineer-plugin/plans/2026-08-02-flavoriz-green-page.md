# Flavoriz Green — separate Home preview

## Objective

Translate the selected hero mockup at `/Users/olena.domina/.codex/generated_images/019fbde2-0274-75e0-8066-baf6c3a56705/hero-flavoriz-green-exact-logo-v2.png` into a responsive, interactive, separate Home-page preview without changing `index_editorial.html`, `index.html`, indexing, canonical routing, or deployment state.

## Scope

- Add `index_flavoriz_green.html` as `noindex, nofollow`.
- Add a page-scoped `flavoriz-green.css` theme over the existing shared and Avant-page component foundations.
- Reuse the approved TORTOPANI logo, real product photography, content, i18n keys, lead modal, and mobile-menu behavior.
- Create one project-bound wide Bento hero photo asset only if the existing crop cannot match the selected visual faithfully.
- Add focused Playwright coverage for the alternate page.
- Verify desktop/mobile layout, UA/EN, navigation, modal, overflow, focus, image loading, and console state.

## Phases

### 1. Baseline and dependencies

- Read project state, design system, alternate-page patterns, dirty-worktree state, shared JS/i18n, and existing tests.
- Confirm the selected mockup and source assets.
- Establish a failing focused test for the new route and its observable contracts before production files exist.

### 2. Asset preparation

- Use `assets/logo_hor.png` as the exact logo lockup.
- Use the real red Bento photo from `assets/gallery/gallery_14.jpg`.
- If needed, create a wide image-only hero derivative with the cake on the right and warm negative space on the left; no baked-in UI text.
- Use a real icon library or existing production icon source for cake, whisk, and gift icons; no handcrafted SVG/CSS art.

### 3. Frontend implementation

- Add the isolated alternate HTML route.
- Match the selected hero at 1536×1024: warm paper frame, exact logo, Manrope-led hierarchy, leaf green `#2E7D32`, pill CTAs, image-right layout, and three-item icon strip.
- Carry the clean light Flavoriz language into the existing Home sections while preserving content order, verified claims, links, modal intents, and `Soon` placeholder truthfulness.
- Preserve the existing canonical and rollback pages unchanged.

### 4. Verification and refinement

- Run focused Playwright tests, then the full suite.
- Run JS syntax checks and `git diff --check`.
- Capture same-state desktop implementation evidence against the selected visual, plus responsive captures at 900, 768, 390, and 320 px.
- Fix P0/P1/P2 visual, responsive, interaction, and accessibility issues until Design QA passes.
- Run an independent simplification/design-system audit and Design Engineer guardrails.

### 5. Documentation and handoff

- Preserve the prior Avant Green QA record and make the root `design-qa.md` describe the latest Flavoriz Green comparison.
- Update durable Design Engineer state to record the alternate preview without changing public-release gates.
- Keep the local static preview running and open the new route in the in-app browser.

## Acceptance checks

- `index_flavoriz_green.html` returns 200 and contains exactly one `h1`.
- The selected hero uses the real logo image, `#2E7D32` accent, pill controls, cake/whisk/gift icon language, and real Bento photography.
- Primary hero actions lead to `bento.html` and `#courses`.
- Shared lead modal and mobile menu retain keyboard behavior.
- No horizontal overflow at 320, 390, 768, 900, or 1536 px.
- UA/EN content stays contained; no Easter card, blinking dots, fabricated testimonials, countdown, or public-indexing change appears.
- All local images load and browser console reports no runtime errors.
- Root `design-qa.md` ends with `final result: passed` before handoff.

## Recovery

The change is additive. Rollback consists only of removing the new alternate page, its page-scoped CSS, its dedicated asset, and its focused test; existing Home/course files remain untouched.
