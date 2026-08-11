# TORTOPANI Signature Home — best-of preview

## Objective

Create a separate, noindex Home-page candidate that combines the strongest verified qualities of the existing directions: Culinary Atelier's author-led visual trust, Editorial's product hierarchy, Vercel's compact responsive UX and the shipped site's commercial specificity. Preserve every existing preview, canonical route and deployment state.

## Product decision

- Visual base: warm ivory culinary atelier with botanical green, original TORTOPANI identity, rounded controls and Liliia as the primary trust signal.
- Hero job: sell the current Bento launch first, not a generic income promise. Show the author and product in the same first-screen composition.
- Information architecture: `Bento hero → programme facts → monthly offer → tech cards → proof of method → course catalogue → author + mentorship → outcomes gallery → external reviews → final contact`.
- Conversion hierarchy: one filled primary action per decision block; secondary actions are outline or text links.
- Claims: do not add new guarantees, urgency or unsupported proof. Bento price/date remain explicitly pending; the page stays noindex until release inputs are approved.

## Scope

- Add `index_signature_green.html` as an independent preview route.
- Add `signature-green.css` as the only page-specific visual layer over shared `styles.css`; do not depend on `avant-green.css`, `atelier-green.css` or `editorial.css`.
- Reuse approved local images, the original logo, shared bilingual content, lead modal and real internal product routes.
- Add `signature-green.js` only for the focused accessible mobile-navigation behavior that the shared legacy controller does not provide.
- Add an executable Playwright contract for the new route.

## Visual contract

- Warm paper and quiet sage surfaces; clear botanical action green; dark warm ink.
- Prata display paired with Manrope UI/body typography.
- Liliia occupies the photographic half of the desktop hero; a real Bento product crop identifies the launch without baking text into imagery.
- Asymmetric but calm editorial composition, generous whitespace, fine rules and selective soft radii.
- No grid wallpaper, hard-corner buttons, gradients, glass effects, glowing blobs, generic SaaS cards, fake badges, blinking dots or decorative clutter.
- Mobile first screen must contain author photography, the Bento proposition and the primary action without horizontal overflow.

## Acceptance checks

- Route returns 200 and stays `noindex, nofollow` with exactly one live HTML `h1`.
- Hero contains the approved author image, Bento product image, launch label, programme facts and a direct `bento.html` CTA.
- Original `assets/logo_hor.png` is used in the header.
- All internal links and local images resolve.
- UA/EN remain contained at 320, 390, 768 and 1440 px.
- Mobile menu supports focus transfer, Escape and focus return; the lead modal retains the shared accessibility contract.
- Primary actions have pill geometry and at least 4.5:1 text contrast.
- No horizontal overflow, duplicate IDs, broken images, runtime errors or unexpected pink/orange UI accents.
- Existing test suite and `git diff --check` pass.

## Recovery

The implementation is additive. Rollback removes only `index_signature_green.html`, `signature-green.css`, `signature-green.js`, the focused test and its new review/state records.
