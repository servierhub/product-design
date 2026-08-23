---
name: image-to-code
description: Build a selected visual target into a reviewable frontend after product-design:get-context. Trigger for screenshot/mock/Figma/ImageGen-to-code, including Servier/DIFA/DNA screens in an existing boilerplate. Default design-validation builds to mock data only (no new DB/auth/services/actions). Bundled templates include annotation by default; for an existing user project, offer annotation support and obtain confirmation before changing it. Start the app yourself, verify the review URL, then run `product-design:design-qa`. Never ask the user to launch the server manually.
---

# Image to Code

You're tasked with translating the visual target image into a high-quality, interactive website or web app.

## Critical Overrides

- Refer to the Plugin router [`product-design:index`](../index/SKILL.md) before proceeding.
- Follow [../../references/critical-overrides.md](../../references/critical-overrides.md).

## User Context

Use saved context only when relevant and available; missing saved context does not block a build with a complete brief and selected visual target.

Use saved product URLs, Figma files, screenshots, reference images, codebase paths, Storybook, tokens, design systems, brand assets, component refs, browser preferences, and share targets as grounding material when relevant.

Do not inspect every saved reference. Inspect only what the current task needs.

### Previewing prototypes in Goose

Build success, HTTP health, Goose Apps creation, and deployment success are not visual verification. Use a browser-capable tool exposed in the current Goose session to open the rendered implementation, inspect it at the target viewport, exercise primary interactions, check console errors when supported, and capture evidence for design QA.

If no browser-capable tool is available, record `final result: blocked` in `design-qa.md`; do not claim the prototype is visually verified. Do not assume `sites-preview`, `terminal.local`, `@Browser`, or `@Sites` exists. Use the local or Apps preview URL actually returned by the available runtime, and expose it to the user only when it is a valid user-accessible URL.

### Mobile prototypes

For a mobile app or phone prototype, build and verify at 390 × 844 unless the user names a device. Use the starter's `.mobile-prototype` wrapper. Do not use `min-height: 100vh` on the app shell. The app surface must end at the 390 × 844 frame. Every screen must fit 390px wide with no horizontal scroll, clipped text, clipped controls, or off-screen primary actions.

## Workflow

CRITICAL: THIS IS NOT GUIDANCE. THIS IS A CHECKLIST TO COMPLETE.

1. Do not start unless the visual source matches the target scope. For a multi-step journey, require the user-approved ordered detailed screen set produced after journey-board selection; a selected journey board alone is not sufficient. For a genuinely single-screen target, one selected image, screenshot, mockup, Figma frame or Image Gen result is sufficient. Apply G4 in [product decision gates](../../references/product-decision-gates.md): journey, evaluation slice, hypothesis, exact visual targets, states, realistic mock data, success criterion, out-of-scope behavior, design-system components and framework rationale must be resolvable. For involved work write `.gates/04-selection-to-prototype.md`.

2. Resolve the exact selected visual target or ordered screen set before building.

    - If multi-step ideation was used, read `.gates/02-journey-selection.md`, `.gates/03-screen-production-plan.md` and `.gates/03-visual-selection.md`; resolve every required screen to its exact displayed generated result. A bare journey-option number identifies the board, not the detailed build sources.
    - For the single-screen exception, resolve a numbered `product-design:ideate` option against the Nth displayed generated-image result from the most recent single-screen ideation set. Do not use submission order.
    - Use the concept-name list from `product-design:ideate` only when it was explicitly written in the same displayed-image order.
    - A generated-image result ID, selected image attachment, screenshot, mockup, or Figma frame is stronger than a bare ordinal. Prefer that exact reference when available.
    - If the selected result cannot be resolved unambiguously, stop before implementation and ask the user to name the concept or reattach/select the image. Never guess and build a nearby option.

3. Treat the resolved image as the design to recreate.

4. If the provided design is a mobile viewport, build a mobile app. If it's unclear, default to desktop.

5. Review the reference design, catalog every image asset in the design, and use the Image Gen tool to create individual images for each one. Zoom in so you can catch every asset that needs to be generated.

    Examples include:

    - Hero images including full bleed image backgrounds
    - Featured article imagery
    - Thumbnails
    - Decorative illustrations
    - Textures and background motifs
    - Logos
    - Product images
    - Avatars

    Rules:

    - CRITICAL RULE: Do not create custom div art, CSS art, inline SVGs, handcrafted SVGs, HTML element drawings, div/span shapes, CSS drawings, gradients, emoji, or text glyphs instead of real icons and image assets ever. Use an available image-generation tool for images and the closest matching icon library for icons.
    - If text is part of an image asset, keep it in the image asset. Examples include full bleed hero images, signs, posters, packaging, storefronts, article art, and illustrations where the type belongs to the visual itself. Do not crop the background image and recreate that text with transparent text boxes, HTML, CSS, or separate overlay layers unless the source clearly shows editable UI text sitting on top of the image.
    - Do not use generic placeholders where the reference implies custom visual content.
    - Generated assets must share the same art direction, palette, rendering style, and design language as the reference mockup.
    - Default every newly generated raster asset to a `1024 x 1024` source canvas and request `quality: low` when the model/provider supports it. Use a different size or aspect ratio only when the selected source visual, the exact rendered crop, or an explicit user request requires it; document that exception. If low quality is unsupported, omit the parameter or use automatic/default quality rather than failing. Never request 4K/high/HD by default. Preserve user-supplied source dimensions when fidelity requires them; raise quality only for a documented visible QA failure or explicit request.
    - This limit applies to newly generated raster assets, not user-supplied originals, vector logos/icons, or screenshots used as visual truth.
    - If the available image-generation tool lacks transparency support, post-process generated assets when transparency is required.

### Parallel asset production

After cataloging and measuring the reference assets, spawn up to three asset subagents while the main agent builds the app structure.

Give each subagent one raster asset task at a time with its reference crop, exact dimensions, focal point, style, output path, and consuming component. Asset subagents generate, inspect, save, and report the asset path only. They must not edit source code, run the browser, or deploy.

Prioritize critical above-the-fold assets first, then reuse agents for supporting assets. Do not delegate standard UI icons or supplied brand logos.

6. Define all sections of the page. For each section, meticulously measure the layout, spacing between elements, and the size and space of the elements themselves.

7. Find freely available fonts that match the target design.

8. Find a freely available icon library that matches the target design. Do not default to Lucide icons. Search for the best match.

    Rules:

    - CRITICAL RULE: Do not create custom inline SVGs, handcrafted SVGs, HTML element drawings, div/span shapes, CSS drawings, gradients, emoji, or text glyphs. Use an available image-generation tool to generate assets and use the closest matching icon library for icons.

9. Build the app starting with [../../references/local-prototype-preflight.md](../../references/local-prototype-preflight.md), using the framework `product-design:get-context` resolved (Vite by default, or Next.js/Nuxt/Astro when named or already in use — pass `--framework <name>` to `bootstrap-prototype.mjs` for a new scaffold). If a design system was identified in `product-design:get-context`, build with its real components per that skill's own guidance instead of generic HTML/CSS. Unless the user asks for a static mock, full production behavior, or a different scope, bring the app or website to life with:

    - Working navigation, links, tabs, menus, and primary CTAs.
    - Functional inputs, filters, toggles, selections, and forms shown in the main experience.
    - Visible UI states: hover, focus, selected, open/closed, loading, empty, and success where relevant.
    - The main task, conversion path, or user journey working from start to finish when the product has one.

    Controls outside the core experience may be visual-only. Do not build auth, persistence, backend/API calls, integrations, or exhaustive edge cases unless requested.

    Rules:

    - Place every image asset you generated into its position before proceeding. I repeat, replace all placeholders, including CSS/SVG placeholders, before proceeding.
    - Do not leave controls in the core experience as static chrome. Do not create new pages or routes unless the user asks for them.

10. Prepare the review loop and run the local app. For a bundled template, the annotation overlay is already present. For an existing project or external boilerplate where annotation is absent, offer `product-design:annotate-inject` and obtain explicit confirmation before it adds a route, component, or ignore rule. Do not block the ordinary local handoff while awaiting that optional consent, and do not claim annotation is installed or verified unless injection and its checks actually completed. Start or reuse the documented dev server yourself in a persistent/background process, wait for a healthy HTTP response, and keep it running. Do not ask the user to open a terminal or run `npm run dev`, `pnpm dev`, `make start-dev`, or equivalent. If startup fails, investigate it; report blocked only after actionable diagnosis.

11. Capture the local app using the Goose Capability Preflight rule in [`product-design:index`](../index/SKILL.md#goose-capability-preflight).

12. Run [`product-design:design-qa`](../design-qa/SKILL.md) as the blocking build gate.

    Steps:

    - Open the reference image and the latest prototype screenshot before writing the QA report.
    - Compare the same viewport and the same interaction state. If they do not match, capture the missing view first.
    - Save the QA report as `design-qa.md` in the project root.
    - Fix P0/P1/P2 issues, capture the app again, and repeat until the QA report says `final result: passed`.
    - Do not keep looping on P3 polish. Include any remaining P3s as follow-up iteration notes.
    - If source capture, prototype capture, or visual comparison is blocked, stop. `design-qa.md` must say `final result: blocked`.
    - Do not hand off unless `design-qa.md` exists and says `final result: passed`.

13. Handoff the app or website.

    - Only hand off after [`product-design:design-qa`](../design-qa/SKILL.md) passes.
    - Keep the prototype running locally; the agent owns startup and lifecycle for the review handoff.
    - Confirm annotation is usable and tell the user how to enter annotation mode in the running UI; do not give terminal setup steps.
    - Provide a valid user-accessible local or deployed URL only when the active Goose runtime returned one. Goose Apps creation alone is not a deployment; use `product-design:share` for requested hosting.
    - After the prototype link, use the shared build handoff from `critical-overrides.md`. Do not add a different completion message.
    - Include the post-build iteration and share nudge from [../../references/critical-overrides.md](../../references/critical-overrides.md#build-handoff).
