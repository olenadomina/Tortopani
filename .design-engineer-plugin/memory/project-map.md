# Project Map

Living file tree of the project. Format per entry:
`path – description (≤10 words) | when to read`

Folders under `.design-engineer-plugin/design/` are created on-demand by the
skill that writes its first deliverable there. Add entries below as folders
appear; remove entries if a folder is deleted.

## .design-engineer-plugin/design/ (lazy – populated as skills run)
- foundation/ – core product definition deliverables | read at pipeline start
- research/ – research findings and analysis | read before positioning
- planning/ – MVP requirements and information architecture | read before design and dev
- exploration/ – bias audit, journey, references, story panels, image manifests | read before prototyping
- psychology/ – psychology audit results | read during design review
- reviews/ – design reviews and assessments | read for quality history
  - 2026-08-01-home-direction-launch-readiness/review.md – Home Product Director review | read before Home/Bento development
  - 2026-08-02-signature-green/design-qa.md – selected best-of Home QA | read before canonical choice
- dev/ – implementation status and development preparation | read before dev work
  - status-tracking.md – Home/Bento remediation evidence and release gates | read after review
- features/ – per-feature spec dirs (post-launch features) | read when iterating

## .design-engineer-plugin/prototype/ (committed; HTML prototypes)
- currently empty – product prototypes live in root HTML | inspect before adding canonical prototypes

## .design-engineer-plugin/plans/ (committed; implementation plans)
- 2026-06-18-magical-questing-eagle.md – unresolved responsive Figma capture plan | review after Home decision
- 2026-08-01-home-launch-remediation.md – completed Home/Bento implementation plan | read before related changes
- 2026-08-02-signature-home.md – completed best-of Home candidate plan | read before Signature changes
- archive/ – completed plans | reference history

## .design-engineer-plugin/memory/ (committed; durable workflow state)
- pipeline-state.md – current phase, evidence, checks, exact next action | read at task start
- key-decisions.md – append-only cross-cutting decisions | read before consequential choices
- stale-dependents.md – downstream refresh candidates | read before reusing older artifacts
- project-map.md – canonical project map | read for context recovery
- debug-solutions.md – verified environment fixes | read before debugging

## .design-engineer-plugin/temporary/ (GITIGNORED; auto-purged at phase boundaries)
- scratch/ – general throwaway | safe to delete anytime
- playwright/ – Playwright debug captures | safe to delete anytime
- intermediate/ – prep work + exploratory drafts | safe to delete anytime

## Project Root
- .design-engineer-plugin/config.yaml – plugin config and resume state | read by /design-engineer:launch
- .design-engineer-plugin/dependencies.yaml – deliverable dependency graph | read by hooks automatically
- index.html – rollback Home, not current preview direction | read before canonical switch
- index_editorial.html – remediated recommended Home preview | read for Home changes
- index_signature_green.html – selected best-of noindex Home candidate | read before Home direction choice
- signature-green.css, signature-green.js – scoped Signature visual/behavior layer | read with Signature Home
- editorial.css – isolated Home editorial theme | read with editorial Home
- bento.html, bento.css – Bento prelaunch page and scoped theme | read for Bento changes
- _compare_home.html – local side-by-side Home comparison | use for review evidence
- styles.css, course.css – shared tokens and page styles | read for design-system checks
- script.js, course.js, i18n.js – shared interactions and localization | read for behavior checks
- frozen_cake.html, la_kartople*.html, easter.html – legacy course pages | read for course changes
- docs/DESIGN-SYSTEM.md – verified design-system reference | read before UI decisions
- docs/STATUS.md – product status, open decisions, and launch risks | read at task start
- tests/editorial-placeholder.spec.js – one-card placeholder regression | run after catalog changes
- tests/home-launch-remediation.spec.js – launch remediation contracts | run after Home/course changes
- tests/signature-green.spec.js – Signature visual/interaction contracts | run after Signature changes
