---
name: index
description: Primary Product Design router. Load this exact skill first whenever the user explicitly names Product Design or the product-design plugin, including requests that also name Goose Apps. Also route design exploration, UX research/audit, visual-source cloning, prototype QA, and sharing here; ordinary UI implementation stays outside unless Product Design is explicit.
---

# Skill Purpose

Route Product Design requests to the right Product Design skill. Use this plugin for an `@Product Design` mention, a direct Product Design request, or a request mainly about design exploration, faithful source cloning, audits, research, critique, or sharing. A request is not Product Design just because it mentions UI, a prototype, or visual style.

# Plugin Purpose

The Product Design plugin helps designers and other non-coders close the gap between product ideas and working software.

The Product Design plugin equips you with the following set of skills to:

- Research ideas and pain points related to your product.
- Conduct product-flow audits.
- Generate distinctly new ideas for your product with ImageGen.
- Clone existing product apps into lightweight prototypes.
- Build lightweight or interactive prototypes to share with your team.

## Communication Style

Speak to the user in a warm, fun, and collaborative way, prioritizing pithy explanations over long walls of text and numerous bullet points. Refer to the [communication-protocol](../../references/communication-protocol.md) for relaying Product Design plugin progress updates and handoff.

## Critical Overrides

- Follow [$critical-overrides](../../references/critical-overrides.md).

## Router Only

The `product-design:index` skill (loaded as `product-design:index` once the plugin is installed) chooses the next focused Product Design skill. It does not do that skill's work. An explicit `Product Design`, `product-design`, or Product Design plugin mention always enters through `product-design:index`, even when Goose Apps or another tool is named in the same request. After the router is loaded, load the focused skill by its full qualified name, such as `product-design:get-context`.

If the user names a focused Product Design skill, load `product-design:index` first and then that exact focused skill. Do not replace it with a related skill.

Goose prefixes every skill in this plugin with `product-design:` once installed via `goose plugin install`. Anticipate this: cross-skill references in this plugin's documentation and prose use the qualified form (`product-design:get-context`, `product-design:ideate`, ...). Skill directory names and `SKILL.md` frontmatter `name:` stay unqualified (e.g. `name: get-context`), per the Agent Skills specification — only the runtime-exposed, loadable name is plugin-qualified.

When a request matches `product-design:user-context`, `product-design:get-context`, `product-design:research`, `product-design:ideate`, `product-design:image-to-code`, `product-design:url-to-code`, `product-design:audit`, `product-design:design-qa`, `product-design:share`, or `product-design:project-status`, load the focused skill and follow it.

## Planning-aware routing

Apply [planning-aware routing and optional tracking](../../references/planning-and-tracking.md) to involved multi-phase work. Explicit Beads/`bd`/tracking requests route to `product-design:project-status` and may activate tracking. An existing target-project `.beads/` may also activate tracking for related involved work. Planning vocabulary alone—an epic, phase gate, acceptance criteria, dependencies, ready/blocked state, owner, evidence, or next task—routes to an **offer** of `product-design:project-status`; obtain confirmation before creating or updating Beads, and continue the focused workflow while waiting.

Do not keyword-match isolated words. Simple one-shot work, ordinary phase prose, and incidental uses such as “the button is ready” or “the card owner” do not trigger or offer tracking. Tracking is additive and never a mandatory gate.

For requests to audit, review, critique, inspect, assess, analyze, evaluate, or give feedback on an existing product experience, load `product-design:audit` directly; do not load `product-design:get-context` first. If the same request also asks to build, fix, redesign, or implement afterward, run `product-design:audit` first, then continue through the appropriate normal workflow.

For visual ideation, `product-design:ideate` is the focused workflow. Use `product-design:get-context` to resolve the minimum brief and play back any defaults before `product-design:ideate` starts. Multi-step work uses two approvals: select one of three board pages assembled from separately generated full-size screens, then approve the selected screen set. Never interpret journey selection as permission to build.

For clone or recreation of a live URL, load `product-design:url-to-code` directly.

For a redesign, improvement, or new site based on a URL, use `product-design:get-context` to confirm the redesign brief. `Like <URL>` means redesign, not clone. Capture the current site with screenshots, attach those screenshots to the `product-design:ideate` Image Gen calls, then execute `product-design:ideate`.

## Goose Capability Preflight

Do not assume Codex Desktop, ChatGPT Work Mode, `@Browser`, `@Sites`, a cloud browser, or `terminal.local` exists in Goose. Before a workflow needs capture, image generation, app rendering, or deployment:

1. Inspect the tools currently exposed by Goose. Tool names vary by installed extension, so route by capability rather than a hard-coded vendor name.
2. A browser-capable tool must be able to open or capture the required source or rendered implementation. A hosting-capable tool must return a working URL. Goose Apps can create or iterate a sandboxed app, but it is not evidence that a browser comparison or deployment occurred.
3. Recommend a Figma-capable plugin or MCP server when the workflow needs direct Figma access. Recommend [image-mcp](https://github.com/bioinfornatics/image-mcp) when image generation is needed and no equivalent provider is available. Treat both as companion capabilities: do not imply that this plugin installs them automatically.
4. If a required capability is absent, name the missing capability and use a fallback only when the workflow permits it. Never claim visual verification, publishing, or sharing from build success or app creation alone.

## Product Design + Goose Apps Contract

When the request explicitly combines Product Design and Goose Apps, preserve this order:

1. Load `product-design:index`.
2. Load `product-design:get-context`, resolve the design target and intended user outcome, and play back the brief.
3. Load and complete the focused design workflow. For a new multi-step interface without a selected visual target, `product-design:ideate` defines three journeys, generates every screen of every variant separately, assembles one board page per variant, then waits for journey selection and selected screen-set approval. For a genuine single-screen target, wait for one selected visual option.
4. Only then use Goose Apps as the rendering target (`listApps` to inspect existing apps, then `createApp` or `iterateApp` as appropriate). Do not call Apps in parallel with skill loading or use Apps to skip context, visual selection, or design decisions.
5. Capture the rendered result with an available browser-capable tool and run `product-design:design-qa` before handoff. If capture is unavailable, report QA as blocked.
6. Load `product-design:share` only when the user requests a shareable deployment; Apps creation is not a deployment URL.

A conceptual question such as “how do you see it?” may stop after the brief, workflow recommendation, and explicit next question. Do not create or mutate an app unless the user asked to proceed or the brief clearly requests an implementation now.

## No Visual Target, No Build

For new app, prototype, redesign, or UI build requests without a URL, screenshot, Figma frame, mockup, source image, or existing code target:

- `product-design:ideate` is the focused workflow.
- Use `product-design:get-context` to resolve the minimum brief.
- Once the target and intended user outcome are clear, play back the assumptions and run `product-design:ideate` in the same turn.
- For a multi-step workflow, define exactly three journeys, generate one full-size image for every screen in every variant, then assemble one board page per variant. Never generate a multi-screen composite image. Wait for the user to choose a page.
- Plan all three screen inventories before generation. After selection, present that variant's existing screen set for approval. Individual screen files—not a board rendering—are build sources.
- For a genuinely single-screen target with no journey, show exactly three comparable visual options for that same screen and wait for selection.
- Do not scaffold, edit files, or start a server before the journey and its detailed screen set, or the single-screen visual option, are selected.

`Full working version`, `no refs`, `go for it`, `make an assumption`, or a complete brief do not waive this.

## User Context

Use [`product-design:user-context`](../user-context/SKILL.md) when the user asks to:

- Set up Product Design
- Get started with Product Design
- Onboard with Product Design
- Save product or design sources
- See what Product Design remembers
- Update saved product or design context
- Remember a Product Design preference
- Setup my plugin

Adjust the context-gathering request to match the user's request. First-time setup differs from updating existing context.

For setup-only requests, do not inspect the workspace, install dependencies, scaffold a prototype, generate images, run audits, or start implementation.

When answering "what can you do?", "how do I get started?", or similar broad Product Design questions, load `product-design:user-context` and follow its persistence availability check before offering saved-context onboarding.

Saved user context is optional in Goose. Load `product-design:user-context` only when the user asks to save/recall context or when relevant saved context is known to exist; do not make its preflight a mandatory gate for every workflow.

## Browser Annotation Updates

Treat annotations as scoped edits to the current prototype.

Read the annotation, its target, and the surrounding screen before changing code. Preserve the existing prototype by default: layout, style, content, routes, assets, interactions, and working behavior stay the same unless the annotation asks to change them.

Do not redesign nearby UI or rebuild the prototype just because an annotation touches that area. If the annotation is ambiguous and the choice would materially change the prototype, ask first.

For every locally reviewable Product Design build, the agent—not the user—starts/reuses and verifies the local server and returns the URL; never ask the user to run a terminal command themselves. Bundled templates already include annotation, so it's available automatically once the server is running. For an existing/user-provided project without the mechanism, offer `product-design:annotate-inject` rather than installing it automatically — it edits the user's own codebase (a new API route, a mounted overlay component), so treat it like any other non-trivial change to existing code: confirm before doing it, per [../../references/existing-codebase-edits.md](../../references/existing-codebase-edits.md). Do not block or delay handoff on the user's answer; hand off the build first, then offer annotation as a follow-up.

Route here to `product-design:annotate` when the user says they left, drew, marked, or added annotations on a running local project, or asks to check/apply annotation feedback. This works out of the box for prototypes scaffolded from any bundled template (Vite, Next.js, Nuxt, Astro). For an existing/user-provided project that doesn't have the mechanism yet, route to `product-design:annotate-inject` first to install it, then `product-design:annotate` to process what comes in.

Do not wait to be told annotations exist. For any project with the annotation mechanism installed and a dev server currently running, opportunistically check `.goose/annotations/inbox/` for that project at the start of a turn and whenever returning to that project's context, even if the user's message is about something else. If the inbox has pending records, route to `product-design:annotate` before other work on that project.

## Skills

Use this as the root routing guidance for Product Design plugin work. If several focused skills apply, sequence them in the order that creates the most useful design workflow. Keep this index as a router; do not perform focused workflow logic here.

### `product-design:user-context`

Preflight, save, or answer from Product Design setup context. Route here before Product Design workflows to load saved product and design sources, and for direct setup, get-started, onboarding, save, remember, recall, inspect, or customization requests. This skill owns Product Design plugin-scoped context and preference policy.

### `product-design:get-context`

Route here first for design, build, prototype, redesign, extend, or UI exploration work. Require only a clear design target and intended user outcome. Ask one targeted question only when one of those is missing; otherwise play back the brief and defaults, then continue without waiting for approval.

### `product-design:research`

Run fast, source-grounded UX research on current user problems for a named digital product. Route here for researching user pain, UX friction, onboarding issues, docs/help problems, developer experience friction, support pain, product workflow issues, or current user complaints.

### `product-design:audit`

Capture and review a product flow, journey, screen, or multi-step product experience from screenshots. Route here for user-facing audit, review, critique, inspect, assess, analyze, evaluate, or feedback requests. It reports UX, design, and accessibility findings tied to captured evidence; do not use `product-design:design-qa` for user-facing audits.

### `product-design:ideate`

Generate image-based visual alternatives, remixes, or concept directions for a component, screen, feature, workflow, or product idea. Route here after `product-design:get-context` has played back the minimum brief and the user needs visual exploration, design variants, alternatives to an existing design, or idea discovery before choosing a visual target. Prefer this over prose-only ideation unless the user asks for prose.

### `product-design:url-to-code`

Clone a live URL as a runnable frontend-only local app using the Browser Choice rule above. Load this alongside `product-design:get-context` when the user provides a production URL for a faithful local prototype or clone, but do not execute it until the minimum brief has been played back. It should not modify production code; stay in `product-design:get-context` when source selection is still unclear.

### `product-design:image-to-code`

Implement a selected visual target as a faithful, responsive, interactive frontend. Route here after `product-design:get-context` has played back the minimum brief and the user has chosen an ImageGen mock, screenshot, Figma frame, mockup, reference image, or other visual source. Do not start here when no visual target has been selected; use `product-design:get-context` and `product-design:ideate` first.

### `product-design:share`

Deploy a runnable prototype and return a shareable URL using the user's preferred target when available. Route here when the user asks to share, deploy, publish, host, create a link, or make a prototype shareable with an available hosting tool.

### `product-design:design-qa`

Compare a coded Product Design prototype against its source visual target before handoff. Route here only as an internal helper after a prototype, `product-design:url-to-code` build, or `product-design:image-to-code` build has both a source visual and rendered implementation. Do not route broad UX critiques, audits, or product-flow reviews here; use `product-design:audit` instead.

### `product-design:annotate`

Process pending in-app annotations left on a running local project (drawn regions plus notes) and turn them into scoped code edits. Route here when the user says they left/added annotations, marked up a region, or asks to check or apply annotation feedback on a project with the mechanism installed (any bundled template, or an existing project after `product-design:annotate-inject`).

### `product-design:annotate-inject`

Install the browser annotation mechanism into a user-provided or existing project that doesn't have it yet (a boilerplate, an existing codebase, or a design-system-provided starter) — supports Next.js, Nuxt, Astro, Vite, and gives a porting path for other frameworks. Route here before `product-design:annotate` whenever the target isn't one of this plugin's own bundled templates.

### `product-design:project-status`

Optional Beads (`bd`) tracking for a Product Design project's phases or annotation rounds. Route and activate for an explicit Beads/`bd`/tracking request; an existing target-project `.beads/` may activate tracking for related involved work. For planning vocabulary alone—epic, phase gate, acceptance criteria, dependencies, ready/blocked, owner, evidence, or next task—route to an offer and require confirmation before mutating Beads. Never a gate on another skill; simple one-shot requests and isolated vocabulary do not trigger.
