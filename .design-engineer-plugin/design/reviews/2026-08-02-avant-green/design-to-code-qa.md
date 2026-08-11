# TORTOPANI Avant Green — Design QA

## Scope

- Optional visual direction: `index_avant_green.html` + `avant-green.css` + `avant-green.js`.
- Existing `index_editorial.html` remains unchanged and canonical preview status is unchanged.
- Source reference: `/Users/olena.domina/Desktop/Screenshot 2026-08-02 at 04.20.29.png` (616 × 1168 px).
- Status: implementation-complete, `noindex, nofollow`, not approved for public launch.

## Reference translation

- Retained: saturated cover, warped line field, oversized high-contrast serif, centered dessert photography, warm light editorial body, ledger rows, oversized catalog heading, compact framed product cards.
- Brand adaptation: red became cool emerald; the TORTOPANI Prata + Manrope pairing and existing real photography were retained.
- Deliberately omitted: a site-wide grid, outlined display words, sticker clutter and decorative doodles. These conflicted with the client's earlier request for a cleaner, lighter page.
- Geometry: controls use 17–20 px radii and cards use 22–26 px radii; no square CTA corners and no decorative shadows.

## Visual comparison

- Paired source/prototype comparison completed at 1280 × 720.
- Responsive comparison completed at 880, 768, 390 and 320 px using the local QA frame.
- Hero remains image-forward on mobile and does not collapse into a text-only first screen.
- Catalog was moved back onto the warm milk surface; dark emerald is reserved for the cover and individual product frames.

## Functional and accessibility checks

- PASS: no horizontal document overflow at 1280, 880, 768, 390 or 320 px.
- PASS: UA/EN switch, mobile burger, first-menu-link focus on open, Escape close, focus return and intent-specific lead modal.
- PASS: collapsed navigation is hidden from pointer, keyboard and accessibility interaction.
- PASS: all local images load; all images have `alt`; internal local references resolve.
- PASS: no duplicate IDs, empty links, Easter offer, blinking dots or pulse/blink animation.
- PASS: outline buttons retain a real 1.5 px border after the shared stylesheet reset.
- PASS: 44 × 44 px language and menu controls at 320 px.
- PASS: core color contrast — emerald/cream 7.31:1, deep forest/cream 11.33:1, muted text/cream 4.78:1.

## Known release inputs

- Only five approved techcard products have final assets/content; the sixth equal-size card is labelled `Soon`.
- The requested full 12-card manifest, remaining assets and prices are still required before a production catalog can be completed.
- Bento commercial terms, claim evidence, privacy/legal approval, production lead delivery and deployment remain outside this optional visual exploration.
