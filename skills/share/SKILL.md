---
name: share
description: "Focused Product Design deployment handoff. Use only after a runnable prototype exists and the user requests sharing; require a chosen available hosting target and return a verified working URL. Goose Apps creation alone is not deployment."
---

# Share

Deploy the user's runnable prototype so they can share it with others.

## Critical Overrides

- Refer to the Plugin router [`product-design:index`](../index/SKILL.md) before proceeding.
- Follow [../../references/critical-overrides.md](../../references/critical-overrides.md).

## User Context

Use a saved share-target preference only when Product Design user context is configured and relevant; otherwise ask for the target.

Use saved product URLs, Figma files, screenshots, reference images, codebase paths, Storybook, tokens, design systems, brand assets, component refs, browser preferences, and share targets as grounding material when relevant.

Do not inspect every saved reference. Inspect only what the current task needs.

## Workflow

For involved multi-phase work, follow [planning-aware routing and optional tracking](../../references/planning-and-tracking.md). At handoff state epic/outcome, release phase gate, acceptance criteria, dependencies, ready/blocked state, owner, deployment evidence, and next task. Mirror through `product-design:project-status` only for explicit tracking, an applicable existing `.beads/`, or a confirmed vocabulary-only offer. Tracking is optional and never a deployment gate.

1. Confirm the prototype directory and the user's preferred deployment target.
2. If the user names Sites, Vercel, or another deployment tool, treat it as the selected hosting target only if that capability is exposed in the current Goose session.
3. If the user did not choose a target, ask one question:

> Which available hosting target should I use to deploy this prototype?

4. Use the selected deployment tool when it is available.
5. If the selected tool is not available, say that clearly and ask whether to use another target.
6. Run the deployment when possible. Do not give setup instructions if you can complete the deployment directly.
7. Return the shareable URL.
8. State any misses or manual follow-up the user still needs to do.

## Rules

- Do not deploy before the user chooses or confirms the target.
- Do not claim the prototype is shared until you have a working URL.
- If the selected tool is not available, say that clearly and ask whether to use another target.
