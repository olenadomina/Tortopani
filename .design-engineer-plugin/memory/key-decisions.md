# Key Decisions

## 2026-08-01 — Review before further development or Figma refresh

- Decision: select `review:home-direction-launch-readiness` as the next Design Engineer phase.
- Rationale: the repository contains two implemented Home directions, `docs/STATUS.md` leaves the canonical choice open, and the saved Figma capture plan predates substantial source changes. A focused comparison resolves the highest-leverage decision before downstream work.
- Evidence: `index.html`, `index_editorial.html`, `_compare_home.html`, `docs/STATUS.md`, git commit `67ac69d`, and `.design-engineer-plugin/plans/2026-06-18-magical-questing-eagle.md`.
- Affected artifacts: Design Engineer resume state; future Figma frames; any product assessment; subsequent implementation of the selected Home.

## 2026-08-01 — Editorial is the recommended Home direction, not launch-ready code

- Decision: use `index_editorial.html` as the canonical visual/compositional direction for the next development phase, while retaining `index.html` until launch blockers are closed and the canonical switch is explicitly implemented.
- Rationale: the editorial direction passes the Swap, Signature, and AI-Slop tests and better matches the requested light, distinctive presentation; it currently fails the overall Squint and Token tests because of mobile overflow and a parallel undocumented theme.
- Evidence: `.design-engineer-plugin/design/reviews/2026-08-01-home-direction-launch-readiness/review.md`, rendered Playwright evidence, and the 8/8 test run.
- Affected artifacts: future Home implementation, design-system tokens/docs, Figma frames, metadata, localization, and responsive tests.

## 2026-08-01 — Separate Home requirements from the Bento course document

- Decision: treat the pasted client comments as the Home requirement source and the Google Doc as the structure/content source for a dedicated Bento course-detail page.
- Rationale: the document describes a long curriculum, recipes, modules, bonuses, learning process, access, and reviews; placing that structure on Home would dilute the launch hierarchy. Home should contain a concise Bento teaser/offer and link to the detail page.
- Evidence: user clarification, Google Doc export, `index_editorial.html:127-146`, and the review traceability matrix.
- Affected artifacts: Home IA/copy, future Bento course page, course catalog naming, and launch plan.

## 2026-08-01 — No public launch before commerce and trust promises are truthful

- Decision: classify the current site as NO-GO for commercial launch until purchase CTA behavior, testimonials, urgency, refund/risk language, content dependencies, responsive/accessibility issues, and indexation are resolved.
- Rationale: a visually polished direction cannot compensate for a purchase flow that ends in generic consultation lead capture, visible placeholder proof, daily-reset urgency, or blocked indexing.
- Evidence: `api/lead.mjs`, `script.js`, `course.js`, `offer.html`, `robots.txt`, and the P0/P1 findings in the review.
- Affected artifacts: Home and course CTA copy, form/modal behavior, checkout or lead process, reviews, offer alignment, SEO/indexation, and release checklist.

## 2026-08-01 — Use honest intent-specific lead flows until commerce is defined

- Decision: implement `assisted-order`, `waitlist`, `mentorship`, and `consultation` as distinct modal intents; do not describe a submitted lead as a completed purchase or grant of access.
- Rationale: the repository has a Telegram lead relay but no checkout provider, approved Bento price, or verified production payment process. Intent-specific copy preserves useful conversion without inventing transaction behavior.
- Evidence: `script.js`, product triggers in `index_editorial.html`/`bento.html`/course pages, 16/16 Playwright suite, and `.design-engineer-plugin/design/dev/status-tracking.md`.
- Affected artifacts: all current/future product CTA labels, modal copy, success states, localization, analytics event naming, checkout requirements, and legal review.

## 2026-08-01 — Complete the preview while deferring the public release boundary

- Decision: consider the Home/Bento remediation development phase complete, while keeping `index_editorial.html` and `bento.html` noindex and retaining `index.html` as rollback until content, privacy, lead environment, proof, payment and canonical decisions are resolved.
- Rationale: UI and interaction defects can be safely closed without silently authorizing deployment or presenting missing commercial/legal inputs as finished.
- Evidence: `.design-engineer-plugin/plans/2026-08-01-home-launch-remediation.md`, `docs/STATUS.md`, final visual QA, and the explicit public-release gates in `.design-engineer-plugin/design/dev/status-tracking.md`.
- Affected artifacts: canonical Home, robots/indexation, deployment, Figma refresh, release checklist, Privacy Policy, payment integration and production lead verification.

## 2026-08-01 — Preserve visual truth when course photography is incomplete

- Decision: render a full-size, clearly labelled photo slot for each missing Bento flavour or decor technique; never repurpose or relabel an image from another product merely to complete the grid.
- Rationale: the curriculum is approved, but the repository contains only five high-confidence flavour images and no trustworthy seven-image decor set. A consistent placeholder preserves the intended visual IA without misleading the client or future customer about the represented recipe or technique.
- Evidence: asset audit, `bento.html`, `bento.css`, UA/EN Playwright visual-card contracts and independent visual QA.
- Affected artifacts: Bento photography brief, future asset manifest/CMS mapping, Figma refresh, accessibility alt text and any subsequent course-card implementation.

## 2026-08-02 — One Home hero must carry both the school proposition and Bento launch

- Decision: keep one Home `h1` for the school-level value proposition; express Bento in the same first screen through product photography and a compact launch caption, then provide one compact Bento detail block before the monthly offer.
- Rationale: a Bento-only `h1` made the Home read like a single-course landing page, while a second full hero would duplicate hierarchy. The merged structure preserves brand context, launch salience and two clear Home paths without stacking first screens.
- Evidence: explicit owner approval in the active task, UA/EN browser screenshots at 390/1280, 21/21 Playwright tests and independent simplification/design-system review.
- Affected artifacts: `index_editorial.html`, `editorial.css`, Home localization and metadata, Home opening-order tests, design-system documentation and future Figma Home frames.

## 2026-08-02 — Explore the author-led Culinary Atelier direction as a separate page

- Decision: implement the user's selected concept 1 as `index_atelier_green.html`, keeping Lilia and her cakes as the central hero image, light atelier surfaces, botanical green accents, Prata editorial type and fully rounded controls; preserve all earlier Home variants and the canonical route.
- Rationale: the supplied author photography supports a personal expert brand more credibly than a generic food-catalog treatment, while the selected concept directly resolves the concerns about a cheap-looking, overly simple or blue-green interface and a text-only mobile hero.
- Evidence: user selection `1`, selected concept image, paired 1440 × 1024 visual comparison, mobile 390 × 844 capture, 33/33 Playwright suite and independent Design QA.
- Affected artifacts: `index_atelier_green.html`, `atelier-green.css`, `assets/atelier/`, Atelier localization/test coverage, current `design-qa.md`, future client visual approval and any later canonical/Figma decision.

## 2026-08-02 — Use Signature Green as the preferred noindex consolidation direction

- Decision: make `index_signature_green.html` the preferred local Home candidate by combining Culinary Atelier's author trust, Editorial's launch hierarchy, Flavoriz's compact product-benefit communication and the existing site's truthful conversion model; keep it independent from every earlier experimental stylesheet and leave the canonical route unchanged.
- Rationale: Liliia is the strongest distinctive brand asset, Bento is the immediate launch product, and a light ivory/botanical-green system with rounded controls feels more credible and personal than either the generic catalog direction or the high-concept grid/poster direction. A dedicated page makes the choice reviewable and reversible without destabilizing the current site.
- Evidence: comparative visual review of the production, Vercel, Editorial, Avant Green and Atelier variants; supplied author photography; 320 × 568 and 1440 × 1024 in-app browser evidence; focused Signature tests and the 49/49 full Playwright suite.
- Affected artifacts: `index_signature_green.html`, `signature-green.css`, `signature-green.js`, `tests/signature-green.spec.js`, current Design QA, future client approval, Figma refresh and any later canonical/indexation/deployment decision.
