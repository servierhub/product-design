---
name: url-to-code
description: "Clone a live URL as a runnable frontend-only local app."
---

# URL To Code

If the user explicitly invokes this skill, continue.

Only continue when the user asks to clone or recreate the current site.

If the user says `like`, `better`, `redesign`, or `improve`, return to [`product-design:index`](../index/SKILL.md).

Clone `<target-url>` as a real interactive, frontend-only local app or website. The clone should look and interact like the source.

## Critical Overrides

- Refer to the Plugin router [`product-design:index`](../index/SKILL.md) before proceeding.
- Follow [../../references/critical-overrides.md](../../references/critical-overrides.md).

## User Context

Saved user context is optional. Load [`product-design:user-context`](../user-context/SKILL.md) only when the user asks to save or recall context, or when relevant saved context is known to exist.

Use saved product URLs, Figma files, screenshots, reference images, codebase paths, Storybook, tokens, design systems, brand assets, component refs, browser preferences, and share targets as grounding material when relevant.

Do not inspect every saved reference. Inspect only what the current task needs.

## Workflow

For an involved multi-phase clone, apply [planning-aware routing and optional tracking](../../references/planning-and-tracking.md). Keep epic/outcome, phase gate, acceptance criteria, dependencies, ready/blocked state, owner, evidence, and next task explicit. Use `product-design:project-status` for explicit tracking or an applicable existing `.beads/`; vocabulary alone requires an offer and confirmation before Beads changes. Tracking must not delay capture, build, or QA.

1. CRITICAL STEP: Warn the user that they must follow the target website's terms before proceeding. This workflow is only for apps and websites the user owns, or has permission to recreate.

2. Open the source URL using the Goose Capability Preflight rule in [`product-design:index`](../index/SKILL.md#goose-capability-preflight).

3. Check that the page is correct.

- Do not continue if it shows the wrong page, a blocked page, a login page, a promo page, a loading screen, an error page, an app-install page, or an unrelated redirect.
- If the page is wrong, try again with another available browser.
- If every browser shows the wrong page, stop and tell the user what you can see.

4. Capture the source page carefully.

- Start at the top of the page.
- Scroll down in small steps.
- At each step, capture what is visible.
- Note any new sections, controls, sticky elements, animations, or lazy-loaded assets.
- Continue until the full page has been seen.
- Scroll back to the top and check whether anything changed.
- Repeat on mobile at `390 x 844`.

5. Use the browser DOM tools to gather everything needed to recreate the source.

- Elements
- Components
- Text
- Links
- Buttons and controls
- States
- Images
- Icons
- Fonts
- Videos
- SVGs
- Style sheets
- Colors
- Spacing
- Layout sizes
- Responsive behavior

6. Find and test the page interactions.

- Use the screenshots and browser DOM tools to find visible controls.
- Include navigation, buttons, links, inputs, menus, drawers, modals, tabs, carousels, hover states, sticky elements, and anything else the user can interact with.
- Test one control at a time.
- Return to the starting state before testing the next control.
- Save the result when the page visibly changes or the browser tools show a state change.

7. Copy the real assets from the source page.

- If the page loads the asset, treat it as available unless the browser cannot access or save it.
- If an image, logo, icon, font, video, SVG, sprite, mask, cursor, or background image is used by the page, copy it locally.
- If an image asset cannot be copied, generate a replacement with ImageGen using a screenshot of the original.
- If a font file cannot be copied, use the closest open source font match.
- If an icon or glyph cannot be copied, use the closest matching open source icon set. Do not default to Lucide unless it is the closest match.
- Briefly note any asset, font, or icon you replaced and why.

8. Create the local app with [../../references/local-prototype-preflight.md](../../references/local-prototype-preflight.md).

9. Build only from what you captured, copied, or gathered from the source.

- Do not add new visual ideas.
- Do not use hotlinked source assets.
- Do not guess when source proof is available.

10. Run the local app.

### Previewing prototypes in Goose

Starting a development server is not verification. Use a browser-capable tool exposed in the current Goose session to open the URL returned by the local runtime, inspect the rendered page at the captured desktop and mobile viewports, test primary interactions, check console errors when supported, and capture evidence for design QA.

Do not substitute HTTP health, build success, preview-service status, Goose Apps creation, or deployment success for browser verification. Do not assume `sites-preview`, `terminal.local`, `@Browser`, or `@Sites` exists. If no browser-capable tool can capture both the source and prototype at comparable states, report verification as blocked.

11. Compare the local app against the original.

- Check desktop.
- Check mobile.
- Check every interaction you captured.
- Fix any obvious mismatch before running final QA.

12. Run [`product-design:design-qa`](../design-qa/SKILL.md) as the blocking build gate.

- Save the QA report as `design-qa.md` in the project root.
- Fix P0/P1/P2 issues, capture the app again, and repeat until the QA report says `final result: passed`.
- Do not keep looping on P3 polish. Include any remaining P3s as follow-up iteration notes.
- If source capture, prototype capture, or visual comparison is blocked, stop. `design-qa.md` must say `final result: blocked`.
- Do not hand off unless `design-qa.md` exists and says `final result: passed`.

13. Handoff the app or website

- Only hand off after [`product-design:design-qa`](../design-qa/SKILL.md) passes.
- Keep the prototype running locally.
- Provide a valid user-accessible local URL only when the active runtime returned one. Deploy only when the user asks to share, using `product-design:share`; Goose Apps creation alone is not deployment.
- After the prototype link, use the shared build handoff from `critical-overrides.md`. Do not add a different completion message.
- Include the post-build iteration and share nudge from [../../references/critical-overrides.md](../../references/critical-overrides.md#build-handoff).

## Hard Rules

- Capture source evidence first. Do not scaffold, write app code, start a server, or create the local prototype until desktop capture, mobile capture, key states, and every required asset, icon, control mark, and font is captured or replaced.
- Do not hand off until every single interaction and state is captured from the target.
- Do not build from memory, screenshots alone, guessed CSS, generic assets, or prior chats.
- Do not implement a saved state without source screenshot plus the available DOM/style/layout evidence for that state.
- Do not use hotlinked source assets in the final app.
- Do not create temporary CSS icons, text glyphs, emoji marks, placeholder blocks, or handmade SVGs while "waiting" to resolve assets. Resolve assets first, then build.
- If no approved browser can capture valid source and prototype evidence, stop and report the `product-design:design-qa` blocker.