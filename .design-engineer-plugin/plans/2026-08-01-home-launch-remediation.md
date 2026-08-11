---
activity: home-launch-remediation
date: 2026-08-01
phase: phase_6_development
deliverable_type: development_plan
component: project_planning
status: complete
severity: critical
tags: [homepage, bento, conversion, accessibility, responsive, trust, performance]
related_deliverables:
  - ".design-engineer-plugin/design/reviews/2026-08-01-home-direction-launch-readiness/review.md"
  - ".design-engineer-plugin/design/dev/status-tracking.md"
  - "index_editorial.html"
  - "editorial.css"
tools_used: [codex-desktop, playwright]
decisions:
  - "Use a reversible lead-assisted prelaunch flow because no checkout integration or approved course price exists; all CTA copy must describe the actual next step."
  - "Keep the editorial page as a noindex preview and defer the canonical switch until missing client content, payment, proof, and release inputs are supplied."
  - "Prioritize a product image before the long mobile lead to resolve the client’s text-only first-screen concern; accept that the CTA starts just below the initial 320 px viewport."
---

# Home launch remediation plan

## Authorized outcome

Implement the actionable corrections from the completed Product Director review. Do not invent missing products, prices, testimonials, photography, legal commitments, payment behavior, or production credentials.

## Working assumptions

- New Bento is the dominant Home launch offer.
- The generic income proposition becomes supporting copy inside the Bento hero.
- Monthly offer follows the hero; verified stats may follow monthly.
- Until checkout exists, commerce actions are lead-assisted and say so.
- The Google Doc informs a separate Bento prelaunch/detail page; unknown price and proof remain explicitly pending.
- Editorial remains a client preview (`noindex`) during this remediation.

## Phase 1 — Red tests

Files: new/updated Playwright specs under `tests/`.

Acceptance contracts:

1. The first Home `h1` names Bento and the monthly section precedes stats.
2. Home has no horizontal document overflow at 320, 375, or 390 px.
3. Techcard layout resolves to four desktop columns and the placeholder is one card wide.
4. Product CTA opens an intent-specific dialog; focus remains inside until closed; error/success regions are announced.
5. Placeholder testimonial quotes and active daily countdown are not exposed.
6. `bento.html` exists, has one `h1`, honest prelaunch CTA, and no fabricated price/reviews.

## Phase 2 — Home IA and editorial system

Files: `index_editorial.html`, `editorial.css`, `docs/DESIGN-SYSTEM.md`.

- Merge Bento novelty and brand proposition into the hero.
- Remove the duplicate novelty section.
- Order the opening flow `Bento hero → monthly offer → stats → techcards`.
- Use explicit 4/3/2 techcard columns so 12 items form 4×3 when supplied.
- Fix min-content/nowrap overflow at 320–390 px.
- Replace raw editorial surface colors with semantic aliases while preserving the approved review direction.
- Replace placeholder testimonials with a truthful external-proof invitation; keep no invented quotes.

## Phase 3 — Honest conversion and accessibility

Files: `script.js`, `styles.css`, relevant Home/course HTML, `i18n.js`.

- Add `data-intent` semantics for waitlist, assisted order, and mentorship.
- Render intent-specific title, lead, submit label, loading state, product recap, and success next step.
- Trap focus, restore focus, make the background inert while open, and expose status/error through live regions.
- Keep a visible, viewport-safe close control on mobile.
- Remove `Ви нічим не ризикуєте`; describe factual data use and link to the public offer without creating unreviewed legal policy.
- Preserve user input on errors and provide a direct Telegram fallback.

## Phase 4 — Bento page and trust remediation

Files: `bento.html`, optional scoped `bento.css`, course pages, `course.js`, `course.css`, `i18n.js`.

- Build a responsive Bento prelaunch/detail page from the approved document structure: value, 30+ lessons, 9 recipes/flavours, decor modules, bonuses, learning process, support/access, author, and CTA.
- Do not add a price, countdown, earnings guarantee, or testimonial quote without source data.
- Remove/reset daily countdown UI and misleading urgency from existing course pages.
- Hide/remove placeholder testimonial quotes on Home and course pages.
- Change autoplay loops to user-controlled, metadata-preloaded media with posters when available.

## Phase 5 — Localization, QA, and documentation

- Complete UA/EN for new/changed text, product values, prices, and alt text.
- Run targeted Red/Green tests, the full test suite, DOM/keyboard checks, viewport screenshots, console checks, and `git diff --check`.
- Run an independent simplification pass and Design Engineer guardrails.
- Update Design Engineer state, dependency candidates, project map, design-system/status docs, and this plan to `complete`.

## Deferred dependencies

- Exact checkout/payment provider and production payment flow.
- Final price for new Bento.
- Full approved list/assets for 12 techcards.
- Final About/gallery/mentorship photography and copy.
- Real testimonials and substantiation for income/student/price-anchor claims.
- Privacy/legal review, production analytics, deployment, canonical Home switch, and search indexing.

## Recovery

- All new behavior remains isolated to the editorial preview or shared components with executable tests.
- Existing `index.html` remains available as rollback until the canonical decision is explicitly implemented.
- No deploy, publish, external message, payment action, or production data mutation is authorized.

## Completion record — 2026-08-01

All five planned phases are complete for the local preview:

- Home opens with one combined brand+Bento hero, a compact Bento detail follows, then monthly and stats; the 4/3/2 techcard grid supports the eventual 12-item catalog.
- Intent-specific modal behavior, keyboard containment, live feedback and Telegram fallback are implemented.
- `bento.html` is a source-based UA/EN prelaunch page without invented price, urgency or testimonials.
- Legacy course countdowns, placeholder quotes, auto-loop media and misleading purchase claims were removed or corrected.
- UA/EN, mobile, visual, console, asset, syntax and diff checks passed.

Verification: targeted remediation 8/8; full Playwright suite 16/16; JS syntax and `git diff --check` pass; final UA/EN visual matrix passes at 320/390/768/1280. Full evidence and deliberate deviations are in `.design-engineer-plugin/design/dev/status-tracking.md`.

Public release remains blocked by the deferred dependencies above. Plan completion therefore means implementation complete, not launch complete.
