---
name: annotate
description: Process pending browser annotations left on a running Product Design prototype or app, in any supported framework (Vite, Next.js, Nuxt, Astro, or another framework annotation was ported to via product-design:annotate-inject). Use when the user says they left/added annotations, marked up a region, drew a box, or asks to check/apply feedback from the annotate tool on a project that is currently running locally. Also check proactively, unprompted, whenever returning to a project with the annotation overlay and a running dev server, before other work on it.
---

# Annotate

Read pending annotation records left by the user through the in-app annotation overlay on a running local project, turn each into a scoped code edit, and clear the inbox.

This is the mechanism behind [`product-design:index`](../index/SKILL.md)'s "Browser Annotation Updates" section and the annotation-tool line in [../../references/critical-overrides.md](../../references/critical-overrides.md). Follow that section's editing discipline (preserve the project by default, ask before making an ambiguous change that would materially change it).

## Critical Overrides

Follow [../../references/critical-overrides.md](../../references/critical-overrides.md).

## When this applies

- Any prototype bootstrapped from this plugin's bundled templates (`scripts/bootstrap-prototype.mjs`, any framework — Vite, Next.js, Nuxt, Astro) already includes the dev-only annotation overlay wired in; no setup is required.
- Any other project — an existing codebase, a user-provided boilerplate, or a design-system-provided starter — only has this if `product-design:annotate-inject` was run on it first. If the project has no annotation mechanism installed, tell the user plainly and offer to run `product-design:annotate-inject`, or proceed with plain verbal feedback instead.
- Only while the project's local dev server is running, since the overlay posts to that same server.
- Detect what's installed rather than assuming Vite specifically: look for `.goose/annotations/` having ever been created, or a `goose-annotate` route/handler under the project's API/server routes (`vite-annotate-plugin.mjs` for Vite, `api/goose-annotate/route.ts` for Next.js, `server/api/goose-annotate.post.ts` for Nuxt, `src/pages/api/goose-annotate.ts` for Astro).

## Proactive checking

Do not treat this skill as invoke-only-when-asked. Silently check `<project-root>/.goose/annotations/inbox/` for a non-empty listing at the start of a turn whenever:

- the user's message is about a project that has the annotation overlay installed, or
- a dev server for such a project is currently running in this session, regardless of what the user's message is actually about.

If the inbox is empty, do not mention this skill or the check at all — proceed with whatever the user actually asked. Do not narrate "I checked and there's nothing" unless the user directly asked about annotations.

If the inbox has one or more pending records, process them per the workflow below before or alongside the user's other request, and lead with what you found and fixed rather than announcing that you checked a folder.

## Annotation record shape

Identical across every framework port — one JSON file per annotation under `<project-root>/.goose/annotations/inbox/*.json`:

```json
{
  "bbox": { "x": 120, "y": 240, "width": 340, "height": 96 },
  "viewport": { "width": 1440, "height": 900 },
  "route": "/",
  "components": ["SkillRow", "SkillRail", "App"],
  "note": "this padding feels too tight",
  "receivedAt": "2026-08-15T21:40:00.000Z"
}
```

- `components` is a best-effort list of component display names found under the selected region, most specific first — populated for React-based overlays (Vite, Next.js, Astro+React islands); empty for Vue (Nuxt) and non-React Astro pages, since there is no equivalent stable introspection API there (see `product-design:annotate-inject`). Treat non-empty values as a strong hint, not ground truth.
- `bbox`/`viewport`/`route` describe exactly what the user was looking at. Reproduce that same route, viewport, and state before capturing evidence.

## Workflow

1. List `<project-root>/.goose/annotations/inbox/`. If empty and the user explicitly asked about annotations, say so plainly and stop. If empty from a proactive/unprompted check, stop silently per Proactive Checking above. Never fabricate feedback.
2. For each record, oldest first:
   a. Open the project at `record.route`, sized to `record.viewport`. Use the running dev server; do not start a second one.
   b. Screenshot the full viewport, then crop to `record.bbox` (grow the crop by ~24px on each side for surrounding context). Downscale the crop so its longer edge is ~1024px before inspecting it, matching the project's standard image-size convention.
   c. Use `record.components` (when present) to locate the candidate source file(s). Prefer the most specific (first) component name that plausibly renders in that bbox; confirm by matching visible content/markup, not name alone. When `components` is empty, locate the source by route + visible content instead.
   d. Read the surrounding component and screen before editing, per [`product-design:index`](../index/SKILL.md)'s Browser Annotation Updates rule. Make the scoped edit `record.note` asks for. Do not redesign nearby UI. If a design system is in use for this project, keep the edit scoped to that component's existing props/variants rather than dropping to raw markup — see [../../references/existing-codebase-edits.md](../../references/existing-codebase-edits.md).
   e. If `record.note` is ambiguous and the natural reading would materially change the project (new layout, new section, different visual direction), stop and ask the user instead of guessing.
3. After editing, re-screenshot the same route/viewport/bbox and do a quick visual check that the change addresses the note (this is a scoped check, not a full [`product-design:design-qa`](../design-qa/SKILL.md) pass — run that separately before handoff if this was the last outstanding annotation).
4. Move each processed record from `inbox/` to `<project-root>/.goose/annotations/processed/`, keeping the filename, so it is not re-applied on a future pass.
5. Summarize what changed per annotation in plain language, per [../../references/communication-protocol.md](../../references/communication-protocol.md). Do not lead with file paths or JSON.

## Notes

- Never treat an annotation's `components` guesses, `bbox`, or `note` as a screenshot substitute. Capture and look at the actual rendered region yourself before editing, same discipline as `product-design:design-qa`.
- If multiple annotations target overlapping regions, apply them in received order and re-capture between edits so later annotations are judged against the latest state.
- Do not commit `.goose/` — it is project-local scratch space, already ignored by the bundled templates' `.gitignore`; confirm it's gitignored when `product-design:annotate-inject` installed the mechanism on an existing project.

## Complete edit-cycle receipt

After a real annotation is processed, update `<project-root>/.goose/annotations/annotation-verification.json` for that same project only. Preserve transport results and set `editCycleTested: true` only when exact route and viewport match and the receipt names before capture, component/content mapping, edit, after capture, processed record, and QA result. Validate with `validateAnnotationReceipt`. Proactive checks never scan unrelated repositories.
