---
name: annotate-inject
description: Install and verify browser annotation in an existing/user-provided boilerplate (Next.js, Nuxt, Astro, Vite, or port) after the user explicitly requests it or confirms the proposed non-trivial codebase change. Bundled Product Design templates already include annotation. The agent starts/reuses the dev server, verifies toggle + POST + inbox write, keeps it running, and returns the URL; never delegate startup commands to the user.
---

# Annotate Inject

The bundled prototype templates (`product-design:get-context` → any framework via `bootstrap-prototype.mjs`) already ship the annotation overlay wired in. This skill is for the other case: the user has their own boilerplate, an existing codebase, or a design-system-provided starter (see `existing-codebase-edits.md`), and wants the same draggable-rectangle-plus-note annotation loop available there.

## Critical Overrides

- Refer to the Plugin router [`product-design:index`](../index/SKILL.md) before proceeding.
- Follow [../../references/critical-overrides.md](../../references/critical-overrides.md) and [../../references/existing-codebase-edits.md](../../references/existing-codebase-edits.md).

## Consent and early blockers

- Bundled templates already include annotation; never inject a second copy.
- In an existing or user-provided project, inspect only enough to identify the runtime and explain the route, overlay, and ignore-rule changes. Obtain explicit confirmation **before editing**. An explicit request to install annotation counts as confirmation; a generic build or handoff request does not.
- If framework signals conflict, ask which runtime is canonical before editing.
- For static Astro, report that a server/hybrid adapter is required and ask before making that architectural change. Do not install a route that will 404.
- While consent is pending, the parent workflow may hand off an otherwise verified local build, but must say annotation is not installed. Never claim annotation success until toggle, POST, inbox write, and production behavior have all been checked.

## How the mechanism works, regardless of framework

Every port shares the same contract:

1. A dev-only server endpoint at `/api/goose-annotate` (or framework-equivalent path) accepts `POST` with a small JSON body (`bbox`, `viewport`, `route`, `components`, `note`) — no screenshots, no binary payloads.
2. It writes each record as its own file under `<project-root>/.goose/annotations/inbox/*.json`.
3. A client-side overlay component lets a reviewer drag a rectangle, add a note, and POST it there.
4. `product-design:annotate` (this plugin's processing skill) picks up pending records on a later turn: screenshots the same route/viewport, crops to the bbox, edits, and moves the record to `processed/`.

**The endpoint must be excluded from production**, but the exclusion mechanism differs by runtime:

| Runtime | Structural exclusion? | What to do instead |
|---|---|---|
| Vite (`configureServer` middleware) | Yes — Vite only registers dev middleware for `vite dev`; absent from `vite build` output entirely | Nothing extra needed |
| Next.js, Nuxt, Astro, and most others | No — a route/handler under the app ships in the production build unless guarded | Every asset below has an explicit `NODE_ENV !== "development"` → 503 (or equivalent) runtime guard. Treat this as best-effort; recommend deleting the installed files entirely before a production deploy that needs a hard guarantee. |

## Detecting the target framework

Before installing, identify what the existing project actually is — do not assume from the user's description alone:

- Next.js: `next.config.*` + `src/app` or `app/` directory (App Router) at the project root.
- Nuxt: `nuxt.config.*` at the project root.
- Astro: `astro.config.*` at the project root. Check whether `output` is `"server"`/`"hybrid"` — a fully static (`output: "static"`) Astro build has no server, so the annotation endpoint cannot exist there at all until the user opts into a server/hybrid adapter. Say this plainly rather than installing a route that will silently 404.
- Vite (non-bundled, user's own Vite app): `vite.config.*` at the project root, no Next/Nuxt/Astro config present.
- Anything else (Remix, SvelteKit, plain Express, etc.): the wire protocol (record shape, `.goose/annotations/inbox/` path) is framework-agnostic — port the two pieces (server endpoint, client overlay) following the closest example in `assets/annotate/`, adapting only the routing/handler syntax for that framework. Tell the user this is an unverified port and confirm the endpoint actually registers before relying on it.

## Install workflow

1. Detect the framework per above. If ambiguous, ask rather than guess — installing the wrong port wastes the user's time confirming it doesn't work. Apply the consent and early-blocker rules above, and stop before edits until confirmation exists.
2. Copy the matching assets from `../../assets/annotate/<framework>/` into the target project, adapting destination paths to that project's actual conventions (don't force a foreign convention onto an existing codebase):

   | Framework | Assets to copy | Typical destination |
   |---|---|---|
   | Next.js | `route.ts`, `AnnotationOverlay.tsx`, `DevAnnotationOverlay.tsx`, `annotate.css` | `src/app/api/goose-annotate/route.ts`, `src/app/_components/annotate/*` (or wherever shared components live in this project) |
   | Nuxt | `goose-annotate.post.ts`, `AnnotationOverlay.vue`, `annotate.css` | `server/api/goose-annotate.post.ts`, `app/components/*` |
   | Astro | `goose-annotate.ts`, `AnnotationOverlay.tsx`, `annotate.css` | `src/pages/api/goose-annotate.ts`, `src/components/*` |
   | Vite (user's own, not the bundled template) | `vite-annotate-plugin.mjs`, `AnnotationOverlay.jsx`, `annotate.css` | project root, `src/annotate/*` |

3. **Never name the server route/folder with a leading underscore** (e.g. `__goose-annotate`). This was verified against a real build: Next.js App Router treats `_`-prefixed folders as private and excludes them from routing entirely — a route under `__goose-annotate/` silently never registers. Use `goose-annotate` (no underscore) for the URL path across all frameworks for consistency.
4. Mount the overlay once, client-side only, near the app's root (root layout for Next.js/Astro, `app.vue` for Nuxt) — guarded so it never renders outside development. Do not replace or reorganize anything already there; add alongside existing providers/wrappers.
5. Add `.goose/` to the project's `.gitignore` if not already present.
6. Verify by actually running both modes, not by reading the code:
   - Start the dev server, confirm the toggle button appears and a test annotation POST returns 200 and writes a file under `.goose/annotations/inbox/`.
   - Build for production and start that build; confirm the same endpoint now returns 503 (or is entirely absent for Vite).
   - If either check fails, do not tell the user annotation is installed — report what's blocked.
7. Start or reuse the project's dev server yourself in a persistent/background process and keep it running for review. Return the verified URL and explain the in-app annotation toggle. Never replace this with instructions for the user to open a terminal and run the server. If the parent build workflow already started the server, reuse it rather than starting a second instance.
8. Tell the user annotation is installed and how to use it. A verification POST may be moved to `processed/` after the check so it is not mistaken for user feedback.

## Processing pending annotations

Once installed, pending annotations are processed by `product-design:annotate` exactly the same way regardless of framework — the record format is identical everywhere. `product-design:annotate`'s "When this applies" check for `vite-annotate-plugin.mjs` presence should be read as "the installed annotation mechanism for this project's framework", not literally Vite-only, when this skill was used to install it elsewhere.

## Notes

- If the target project already has some other annotation/feedback mechanism, ask before installing a second one.
- Component-name guessing (via framework internals like React fiber traversal) is only meaningfully portable to React-based UI (Next.js, Astro+React islands). Vue (Nuxt) and non-island Astro pages have no equivalent stable introspection API; those ports omit it and rely on `bbox`/`viewport`/`route` alone — say this if the user asks why Nuxt annotations don't show component names.

## Verification receipt and claim boundary

Injection verifies transport only: overlay, POST, inbox write, and production guard. Persist `<project-root>/.goose/annotations/annotation-verification.json` with schema version, exact project root, route, viewport, timestamp, those four transport booleans, and `editCycleTested: false`; validate it with `validateAnnotationReceipt`. Do not claim the edit cycle was tested from installation checks.
