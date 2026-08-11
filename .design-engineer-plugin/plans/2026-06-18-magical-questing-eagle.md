# Plan — Tablet & Mobile versions of all 5 pages in Figma

## Context
The Figma file **Tortopani — Redesign** (`GNcWDht9sjxLh6dQokY8fp`, page `0:1`) already holds desktop captures (1440px) of all 5 redesigned pages: Home `11:2`, Заморожені торти `14:2`, «Картопля» `12:2`, «Картопля» 2.0 `13:2`, «Твоя ідеальна паска» `15:2`.

The user added two reference frames defining the target widths: **`20:13` "Tablet" = 800px** and **`20:103` "Mobile" = 375px**, and asked for tablet + mobile versions of **each** page. The redesigned pages are already responsive, so the cleanest path is to capture each page at 800px and 375px viewport widths (same code→design capture used for desktop) → **10 new frames**.

## What already exists (reuse — do NOT rebuild)
- Local site at project root, served with `python3 -m http.server 8753`: `index.html`, `frozen_cake.html`, `la_kartople.html`, `easter.html`, `la_kartople_new.html` + `styles.css`, `course.css`, `script.js`, `assets/`.
- Responsive breakpoints (confirmed in `styles.css` + `course.css`):
  - **≤1024px**: 4-col grids → 2-col; 3-col grids (cards-3/menu/steps/aud/why) → 2-col.
  - **≤860px**: nav → **burger**; hero/chero → **1 column (stacked)**; stats 4→2-col; home `reviews-grid` & course `rev-grid` → 1-col; about → 1-col.
  - **≤560px**: course-grid/why/cards/menu/steps/aud → **1 column**; stats → 1-col; seal shrinks 108→92px; sticky-buy title hidden; container padding 24→18px.
  - **→ Tablet @800px** = burger nav, stacked hero, mostly **2-column** card grids, 1-col reviews/about.
  - **→ Mobile @375px** = burger nav, **everything 1-column**, compact seal/sticky bar.

## Approach
Capture each page twice (800px and 375px viewport) into the same Figma file via `generate_figma_design`, controlling the viewport width with **Playwright `browser_resize`** (the `open`/desktop method can't set a narrow width). Then arrange + rename the 10 frames into a **Tablet row** and a **Mobile row** with `use_figma`.

### Capture recipe per page/width (lessons already learned this session)
For each (page, width) — one at a time:
1. `generate_figma_design(fileKey)` → new `captureId` + endpoint.
2. `browser_resize(width, 1200)` then `browser_navigate(http://localhost:8753/<page>)`.
3. `browser_evaluate` (keep each step small to avoid the Firefox crash seen earlier — split if needed):
   - inject `<style>.reveal{opacity:1!important;transform:none!important}</style>` (defeats scroll-reveal blanking — the #1 capture bug);
   - set all `img.loading='eager'`, scroll through to force-load, scroll top, await images;
   - inject capture.js via **`<script src="https://mcp.figma.com/mcp/html-to-design/capture.js">`** (script-src avoids the CORS issue a `fetch()` hits);
   - call `window.figma.captureForDesign({ captureId, endpoint, selector:'body' })`.
4. Poll `generate_figma_design(fileKey, captureId)` until `completed`.

Capturing via Playwright at runtime means **no source-file edits, no browser-cache problem, no background-tab throttling** (the three issues that derailed the desktop round).

### Arrange & label (after all 10 complete) — one `use_figma` call
- Identify the 10 new frame node-ids from the capture results.
- Place them in two labeled rows below the desktop row (which sits at `y=0`):
  - **Tablet row** (5 × 800px): rename `Tablet / Home`, `Tablet / Заморожені торти`, `Tablet / «Картопля»`, `Tablet / «Картопля» 2.0`, `Tablet / «Твоя ідеальна паска»`, spaced left→right.
  - **Mobile row** (5 × 375px): same naming with `Mobile /` prefix.
- Leave the user's reference frames `20:13`/`20:103` as-is (or note they can be deleted).

## Critical files / targets
- Capture source: the 5 local HTML files (already final, no edits needed).
- Figma file: `GNcWDht9sjxLh6dQokY8fp`, page `0:1`. New frames appended here.
- Tools: `generate_figma_design`, Playwright `browser_resize`/`browser_navigate`/`browser_evaluate`, `use_figma` (arrange), `get_screenshot` (verify).

## Risks & fallbacks
- **Playwright Firefox crashed once** mid-evaluate. Mitigate: split the evaluate into small steps; retry on crash (re-navigate). If Playwright stays unstable, fallback to resizing the real browser window via AppleScript (`set bounds of front window to {0,0,800,1200}`) + the `open`+hash capture method — captured width ≈ inner width (~785 / ~360); layout is identical since it stays within the same breakpoints.
- Heavy pages (9–12 images) take longer to serialize → poll patiently (`processing` is normal).

## Verification
1. After capture, `get_screenshot` on **one tablet** frame and **one mobile** frame (e.g. a course page) — confirm: burger nav present, hero stacked, grids at 2-col (tablet) / 1-col (mobile), and **no blank sections** (the reveal/​«Про мене» content is visible).
2. Confirm 10 new frames exist, correctly named, in Tablet/Mobile rows; total frames in file = 5 desktop + 10 = 15 (+ the 2 user reference frames).
3. Report the file link + node-ids of the new frames.
