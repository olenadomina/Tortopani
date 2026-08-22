# Design Engineer Pipeline State

## Last Updated

2026-08-22T18:09:17+02:00 — Popup routing regression fixed: only standalone techcard purchases bypass the lead modal.

## Project

- Type: existing product
- Mode: autopilot
- Orchestration depth: full
- Product: Ukrainian static TORTOPANI marketing site and course pages
- Canonical implementation: `index.html`, shared `styles.css` / `green-hub.css`, and `script.js`
- Branch: `main`

## Current Activity

Standalone maintenance — complete.

- Restored the lead modal for the Home monthly offer and every paid course page, including offers that carry a `data-pay` URL.
- Added the explicit `data-direct-checkout` contract only to techcard purchase buttons on `index.html` and `techcards.html`.
- Updated the shared script cache key on every page that loads `script.js` so browsers receive the corrected behavior.
- Added regression coverage for paid course modals, the Home offer modal, scroll preservation, direct techcard checkout, and both popup pixel events.

## Decision

`data-pay` identifies the payment destination but does not by itself bypass the lead modal. Only a trigger with both a valid HTTPS `data-pay` value and the explicit `data-direct-checkout` attribute may navigate directly to checkout.

## Verification

- PASS: popup/direct-checkout regression suite — 7/7 Playwright tests.
- PASS: all four paid course pages open the modal without jumping the page.
- PASS: the Home monthly course CTA opens the modal and preserves its product context.
- PASS: the techcard CTA navigates directly to its intercepted WayForPay URL.
- PASS: bundle popup emits `InitiateCheckout` on both configured pixels, then `Purchase` on both after successful lead submission, preserving the 499 UAH payload and WayForPay destination.
- PASS: `node --check script.js` and `git diff --check`.
- PARTIAL: full Playwright suite — 12/15 before adding the passing pixel regression. Three observed failures are outside this change: Home mobile hero fold, 320 px horizontal overflow, and Escape not closing the mobile menu.
- NOT RUN: production checkout, lead delivery, deployment, or analytics verification.

## Public-Release Gates

1. Configure and verify production lead delivery.
2. Publish the referenced Privacy Policy.
3. Approve the Bento price/date and complete the techcard catalog.
4. Make an explicit indexation and deployment decision.

## Exact Next Action

No further code change is required for this popup fix. Commit and deploy it through the normal release flow when authorized; treat the three unrelated full-suite failures as separate follow-up work.

## Open Questions

- None for the popup-routing fix.
