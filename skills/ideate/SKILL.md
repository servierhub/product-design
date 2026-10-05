---
name: ideate
description: For each of three multi-step variants, define the journey, generate one full-size image per traversed screen, then create one separate board page arranging those files. Single-screen work generates three directions for the same screen.
---

# Ideate

Use after product-design:index and product-design:get-context have established the brief and G1 is not blocked.

## Critical boundaries

- Do not build, scaffold, start an app server, call Goose Apps, or route to image-to-code before a variant and its complete screen set are approved.
- Never ask Image Gen to divide one canvas into several screens. Sprite sheets, contact sheets, storyboard images, miniature grids and multi-column composites are invalid.
- For each of exactly three variants: define the journey, generate every traversed screen as its own full-size image, then create one board page referencing and ordering those files.
- Multi-step work uses two decisions: select one complete variant board page, then approve its screen set.
- Follow ../../references/critical-overrides.md.

## State machine

1. brief-ready
2. variant-journeys-defined
3. variant-screen-plans-created
4. all-variant-screens-generated
5. variant-board-pages-created
6. journey-selected
7. screen-set-approved
8. ready-to-build

Record all three plans and exact image paths/IDs in .gates/03-screen-production-plan.md, selection in .gates/02-journey-selection.md, and approval in .gates/03-visual-selection.md. Follow [the deterministic ideation contract](references/deterministic-ideation-contract.md): freeze its canonical manifest before generation, record its SHA-256 fingerprint in G2/G3 and the active Beads task, and keep runtime evidence separate from the frozen manifest.

## Modes

Use multi-step mode for more than one meaningful state, decision, handoff or screen. Use the single-screen exception only for a genuinely isolated screen, component, modal, panel or static page.

## Common preflight

1. Freeze user/context, entry trigger, exact start and end, scenario/data, success criterion, evidence, design system, platform and viewport.
2. Inspect supplied visual references directly. Stop if a named source is inaccessible.
3. For multi-persona services, reconcile persona and backstage journeys in a service blueprint first.
4. Reuse exact dates and common data consistently.
5. Match image aspect ratio to the target using model capabilities. For desktop web at 3:2, use 1536 x 1024 for GPT Image 2 and 1152 x 768 for MAI Image 2.5 or Flash. An explicit override wins only when supported and same-ratio; otherwise fail with supported same-ratio alternatives. Unknown models require explicit capabilities. Use portrait only for mobile.
6. Request low quality when supported; otherwise omit it. Freeze enhancement on/off in the manifest and keep it identical in comparisons.

## Planning and phase status

For involved multi-phase work, apply [planning-aware routing and optional tracking](../../references/planning-and-tracking.md). At each transition, keep the epic/outcome, phase gate, acceptance criteria, dependencies, ready/blocked state, owner, evidence, and next task clear. Mirror this through `product-design:project-status` only for explicit tracking, an applicable existing `.beads/`, or a confirmed vocabulary-only offer. Never hold ideation on tracking bookkeeping.

# Multi-step workflow

## 1 — Define exactly three candidate journeys

Create three meaningfully different interaction strategies against the same frozen contract. For each define thesis, advantage, complete happy path, decisions, progressive disclosure, critical recovery, assumptions, risk, cheapest experiment, and a minimum ordered inventory of normally 3–6 screens. Do not vary only visual style.

For every screen record before generation: stable variant-local ID such as V1-S1, name, purpose, user question, entry state, journey moment, exact visible content/data, actions, material validation/error/recovery, exit and next screen, shared shell/components/assets, and required/optional/recovery status.

Write all three plans before generation. Do not wait for selection: every variant needs full visual evidence for comparison.

## 2 — Generate every variant screen separately

Every Image Gen call produces exactly one full-size screen image. Never generate a board or several screens in one result.

- Run up to three isolated variant workers concurrently: V1, V2 and V3 may progress in parallel. Inside each variant, generate screens strictly sequentially (S1 → S2 → …) so accepted prior screens anchor continuity.
- Give each worker a distinct output directory and variant-only plan. Workers must not edit shared board files or another variant directory.
- Use only the exact path returned by each generation call. Never scan for a latest file, infer a filename, or copy from a shared directory. Verify the path stays inside the assigned variant directory, inspect it, hash it, and persist the attempt before starting its successor.
- Reject duplicate hashes across screen IDs. Use bounded attempts from the manifest, and resume accepted screens from their persisted exact returned paths after interruption. Record provider timing, orchestration timestamps, and prompt provenance.
- After all workers finish, the parent verifies outputs and assembles pages in deterministic V1, V2, V3 order, never completion order.
- If delegation is unavailable, process V1 then V2 then V3 sequentially with the same per-variant contract.
- The first accepted screen anchors that variant. Later screens preserve its shell, typography, tokens, imagery, anatomy and exact common data.
- Inspect every saved result before continuing; regenerate only the conflicting screen.
- Never silently add, remove or reorder steps.
- Reject portrait or mobile-looking output for a frozen desktop-web target.

### Per-screen prompt

Create only full-size screen [VARIANT/SCREEN ID — NAME] for candidate [VARIANT NAME]. Generate one [TARGET SIZE/ASPECT] image matching [PLATFORM AND VIEWPORT]. Do not show another journey step or create a storyboard, sprite sheet, contact sheet, grid, columns, board, device frame or alternate direction.

Include the candidate thesis, start/end context, purpose, entry, exact content/data, primary action, supporting/recovery state and exit. Preserve the accepted visual anchor and design-system language. For desktop web, preserve a landscape desktop composition, desktop navigation and content density; never reinterpret it as a narrow mobile layout.

## 3 — Create exactly three journey-board pages

After every screen for every variant exists, create one separate board page per variant. These are presentation artifacts, not generated UI images or product prototypes.

Prefer: (1) the requested collaborative board tool when available; (2) available Figma/FigJam, Miro or equivalent capability; (3) three standalone local HTML pages requiring no app scaffold or product server.

Every page must:

- reference the separate full-size image files; never redraw or composite them through Image Gen;
- arrange one journey in an unambiguous numbered flow with stable IDs, short labels and connectors;
- preserve native aspect ratios and enough width/zoom to inspect each web screen;
- use a wide scrollable canvas or spacious wrapped flow, never N equal narrow columns;
- place thesis, assumptions, risk, advantage and recovery notes outside images;
- remain comparable with the other pages.

For the HTML fallback, write a JSON manifest matching `scripts/build-journey-board.mjs` and run it with `--input <manifest> --output <review-dir>`. The dependency-free generator creates an index plus journey-1.html, journey-2.html and journey-3.html, copies the separate images with relative image references, and provides zoom, drag-to-pan and full-screen image inspection. Do not handcraft pages when this bundled generator is available. For local review, run `scripts/serve-journey-board.mjs --root <review-dir>`, verify the returned URL, and open it with the available browser. This is a browser preview, not proof of an embedded Goose Desktop WebView. Do not claim native in-chat rendering unless such a viewer tool is explicitly exposed.

Reject a page if images are cropped, stretched, tiny, reordered, missing or presented as narrow mobile-like columns. Fix page layout, not source images, unless an image violates its own contract.

## 4 — Present pages and stop

Number variants by displayed page order. Link every board page and provide full-size access to its individual screen images. Save G2 scoring and ask: Which complete journey should I develop: 1, 2, or 3? Or tell me what to change in the flows.

Do not build or route to image-to-code.

## 5 — Approve the selected screen set

When the user selects N:

1. Resolve N against displayed board pages.
2. State: Journey N selected. I will verify its ordered screen set for final approval.
3. Record selected page path/URL, image paths/IDs, confidence and assumptions.
4. Verify end-to-end coverage and continuity of shell, data, actions, terminology and states.
5. Present and embed every selected screen once at full readable size.
6. Ask only: Do you approve this complete screen set for build, or which screen IDs should I revise?

Do not regenerate merely because the journey was selected. For one-screen feedback, regenerate only that image and update its board reference. For a changed journey, explicitly revise its plan, required images and page.

After approval, route to image-to-code.

## Fair cross-model benchmark

Benchmark one canonical screen entry at a time in isolated directories. Send identical canonical prompt, visual contract, references, target ratio, attempts, and enhancement setting to every model. Pixel dimensions may differ only through the model-aware same-ratio mapping. Record exact returned path; configured, requested, resolved, and effective deployment and model; explicit width, height, and ratio; input and effective prompt provenance; SHA-256; separate provider and end-to-end timings; explicit usage and cost availability; and the shared side-by-side artifact location. If any condition or required evidence differs, record `claimAllowed: false` and make no comparative claim. Do not mutate official artifacts. Live parallelism evidence remains blocked on a published image-mcp version newer than `@bioinfornatics/image-mcp@0.2.1` that exposes every required observability field; see the deterministic contract for the exact release dependency.

For a three-lane versus fifteen-wide experiment, compare measured provider and end-to-end timings, orchestration overhead, rate-limit/retry events, collisions, and continuity scores. Explicitly accept or reject fifteen-wide from evidence; target under 30 human minutes when capacity allows.

# Single-screen exception

Generate three independent directions for the exact same screen, content, state, viewport and constraints. Each result contains one direction only. Use the target platform aspect ratio, wait for selection, then route the selected result.

# Shared rules

- Stop and name the blocker if image generation is unavailable.
- Parallelize independent variants when delegation is available, but keep image calls sequential within each variant because continuity depends on accepted prior results.
- Attach only references actually sent.
- Never substitute generated imagery for design-system controls.
- Preserve constraints, dates and realistic readable product sizing.

Done means three journeys and plans exist, every screen for every variant was generated separately, exactly three board pages were assembled from those files, one journey was selected, its screen set was approved, and G2/G3 records resolve every source.

## Evidence mode, provenance, and copy contract

Choose `lean` by default: compare exactly three hypotheses using one representative anchor screen each, then generate the complete selected journey. Use `full-evidence` before selection when material journey uncertainty, regulated/critical copy, high-risk interaction, or evidence needs make anchors insufficient; it costs approximately three lanes of full-screen production versus one anchor lane. After lean selection, an additional approval is required only if completing the journey materially changes the selected hypothesis, boundary, critical copy, or design-system direction.

Every ideation evidence manifest declares `evidenceMode` and `mode`. `visual-and-copy` judges generated visuals and their visible copy. `composition-only` judges composition while exact words come from a required machine-readable copy manifest; it does not waive readability. Classify inputs as `source-research`, `provided-target`, or `generated-candidate`. Candidate slots accept only `generated-candidate`: source captures and provided targets may ground generation but may never be presented as generated alternatives. Hash every exact output, reject undeclared duplicate hashes, and fail when safety, dosage, consent, eligibility, or other critical product/medical copy is illegible. Validate with `validateIdeationEvidence` before presentation.
