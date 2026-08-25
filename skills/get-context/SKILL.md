---
name: get-context
description: Product Design brief gate. After `product-design:index`, load before `product-design:ideate`, `product-design:image-to-code`, redesign, Product Design + Goose Apps, or product UI build work; require a clear design target and intended user outcome, play back the brief, then hand off to the named focused workflow before any rendering tool.
---

# Get Context


Run this skill at the start of Product Design requests that ask to design, build, prototype, clone, redesign, extend, or generate product UI directions.

Use question mode to clarify the following:

- what product, site, feature, workflow, component, or screen is being designed, redesigned, or extended
- what the feature, change, app, or website should help the user do

Do not re-ask answered questions. When both are clear, play back the brief and defaults in one pithy note, name the next workflow, and continue in the same turn. Playback is not a request for approval. The user can course-correct style, scope, or interactivity at any point.

Hard boundary: do not implement UI, scaffold a prototype, start a server, or create files while the design target or intended user outcome is still missing.

## Framework and Design System Detection

Resolve these two before handing off to `product-design:ideate`/`product-design:image-to-code`/`product-design:url-to-code`, alongside the design target and outcome — do not leave them implicit and default to the bundled Vite template without checking.

**Framework.** If the target is a new prototype:

- If an existing project is already present (an existing codebase, not a fresh empty folder), detect its framework from config files (`next.config.*`, `nuxt.config.*`, `astro.config.*`, `vite.config.*`) and build within it — do not scaffold a separate template. Follow [../../references/existing-codebase-edits.md](../../references/existing-codebase-edits.md).
- If there is no existing project, distinguish the **review prototype framework** from the **production destination**. Ask which framework to scaffold only if the context makes it ambiguous. Otherwise default to bundled Vite + React for disposable review, including Servier/DNA work whose accepted production destination will later be Next.js via `difa-web-framework`; this minimizes startup and iteration overhead. Name both targets in the brief playback. Treat the later Next.js implementation as a deliberate reimplementation, not an automatic code migration. If SSR, routing, middleware, auth, server actions, or App Router behavior is itself under test, prototype directly in Next.js. Supported bundled frameworks: Vite (default), Next.js, Nuxt, Astro.

**Design system.** Ask or check, in this order, before build starts:

1. **Is there an existing design system?** Check saved user context (`product-design:user-context`) for a recorded design system, codebase paths, Storybook, or component refs. If a plugin exposes one, use its real components. For Servier/DIFA, load `servier-webapp:dna-in-prototypes`, then the required qualified tier skills (`servier-webapp:dna-atoms`, `servier-webapp:dna-molecules`, `servier-webapp:dna-organisms`, `servier-webapp:dna-tokens`). Honor its React compatibility gate before accepting the framework choice.
2. **If no design system is in use, are there tokens or a palette to use?** Ask for existing design tokens, a brand palette, a Figma file, or brand assets before generating anything from scratch. Use whatever is provided as grounding for `product-design:ideate`'s Image Gen calls and for any hardcoded colors/spacing/type in the build.
3. **If neither exists,** say so plainly and generate visual directions with distinctly different palettes as part of `product-design:ideate` — this is the fallback, not the default. Do not silently invent a single palette and skip ideation.

Do not skip straight to build with an assumed framework or an assumed palette when the project is new; a wrong assumption here is expensive to undo (rewritten components, mismatched brand colors). A quick check or one targeted question is worth it.

## Evidence and UX-research gate

Before journey ideation, classify every important input as one of: observed user evidence, stakeholder input, inference, or assumption. Never describe stakeholder approval, an LLM-generated journey, a polished mock, or a successful usability walkthrough by the agent as UX research.

For a new service or a request spanning several personas, roles, or backstage operations:

- Define the shared service boundary and the cross-role outcome.
- Load product-design:research when user problems, terminology, policies, handoffs, or current workflows are not evidenced and suitable sources are available.
- When source access is unavailable, proceed only as an explicit hypothesis/experiment and include a research plan; do not label the resulting persona or journey as validated.
- Create one service blueprint covering user-facing and backstage lanes before selecting a single prototype slice.
- A stakeholder may choose the first slice, but that choice does not validate unmet needs, desirability, or usability.

## Product Value Gate

Before ideation, apply G1 in [product decision gates](../../references/product-decision-gates.md). For involved work establish problem/opportunity, target user/context, intended outcome, product value, observable success criterion, confidence, assumptions, constraints, review framework, production destination and design system; write `.gates/01-brief-to-ideation.md`. Score cannot compensate for missing hard criteria. Weak evidence leads to `conditional` or `experiment`; a missing outcome or success criterion is `blocked`. When blocked, ask **exactly one** focused question in the current turn: choose the question with the highest expected information value, combining problem, context, outcome and observable success into one compact answer frame when several are missing. Do not emit a questionnaire or several numbered questions.

## Critical Overrides

- Refer to the Plugin router [`product-design:index`](../index/SKILL.md) before proceeding.
- Follow [../../references/critical-overrides.md](../../references/critical-overrides.md).

## User Context

Saved user context is optional. Load [`product-design:user-context`](../user-context/SKILL.md) only when the user asks to save/recall context or a configured Product Design state directory is known to contain relevant context.

Use saved product URLs, Figma files, screenshots, reference images, codebase paths, Storybook, tokens, design systems, brand assets, component refs, browser preferences, and share targets as grounding material when relevant.

Do not inspect every saved reference. Inspect only what the current task needs.

## Handoff To The Next Workflow

1. When the next workflow is already clear, read that skill before sending the brief playback. Do not only name a skill you have not read.

2. Before executing `product-design:ideate`, `product-design:url-to-code`, or `product-design:image-to-code`, play back the minimum brief and any defaults in one pithy user-visible note.

3. If the target and intended user outcome are clear, continue to the next workflow in the same turn. Do not wait for explicit confirmation. If the user provides feedback, incorporate it and course-correct.

4. Before starting an involved app, prototype, clone, redesign, or build, send one short expectation-setting note and continue. Example:

```text
This kind of build usually takes about 10-15 minutes, and ambitious ones can take longer. Good moment to grab coffee or tend to something else; I’ll keep moving and bring the prototype back when it is ready.
```

Do not send this note for tiny static changes, quick audits, simple research, setup-only, or share-only requests.

For multi-step work, the brief playback must also state the exact journey start boundary, end outcome, common scenario/data, and whether the next output is three candidate journeys, separate full-size images for every screen in every candidate, and one board page per candidate. Never propose composite multi-screen images.

Done means target user/context, problem, outcome, product value, observable success criterion, framework/design-system decisions, assumptions and confidence are explicit; G1 has a verdict; the journey comparison boundary and shared scenario are frozen when applicable; defaults have been played back; and the next skill has been read.
