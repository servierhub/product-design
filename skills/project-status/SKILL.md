---
name: project-status
description: 'Optional: track a Product Design project''s phase (`product-design:get-context`, visual sourcing, build, `product-design:design-qa`, `product-design:share`) or annotation rounds as Beads (bd) issues, so status is queryable via `bd ready`/`bd show` instead of only living in conversation history. Triggers on two kinds of request: (1) explicit — the user names Beads, bd, issue tracking, or asks to track/plan progress; (2) vocabulary-based — the user talks in epic, gate, user story, success/acceptance criteria, task breakdown, ready/blocked, or backlog terms about a Product Design project. Never a gate — Product Design workflows run the same with or without this.'
---

# Project Status (Beads)

[Beads](https://github.com/steveyegge/beads) (`bd`) is an issue tracker with first-class dependency support. This skill wires up two optional formulas that mirror the Product Design plugin's own workflow order — the `product-design-build` Beads formula (`product-design:get-context` → visual source → build → `product-design:design-qa` → `product-design:share`) and the `annotate-cycle` Beads formula (install → collect → process → verify) — so a project's status becomes a `bd` query instead of something only reconstructable from chat history.

**This is purely additive.** Product Design workflows never depend on Beads being installed, configured, or used. Do not treat any step here as a blocking gate on `product-design:get-context`, `product-design:image-to-code`, `product-design:design-qa`, or any other skill — those run exactly the same whether or not this skill is ever invoked.

## When this applies

Two independent triggers — either is sufficient on its own, do not require both:

1. **Explicit.** The user names Beads, `bd`, issue tracking, or directly asks to track/plan/see status or progress on a Product Design project. The target repo already having `.beads/` is an existing-tracker signal: for related involved work, this skill may use that tracker without initializing another one; stay within the requested scope.
2. **Vocabulary-based.** The user describes involved multi-phase Product Design work with a planning cluster such as *epic*, *phase gate*, *acceptance criteria*, *dependencies*, *ready/blocked*, *owner*, *evidence*, or *next task*. Offer this skill, but confirm before initializing, creating, or updating Beads. This means "offer", not "silently start tracking." One isolated word is not enough.

Follow [planning-aware routing and optional tracking](../../references/planning-and-tracking.md). Do not mention tracking for a simple one-shot request, ordinary phase prose, or an incidental planning word without involved tracked-work context. Most Product Design work does not need issue tracking.

## Prerequisites

- `bd` must be installed and on `PATH` (`which bd`). If it isn't, say so and skip this skill — do not tell the user to install it unless they ask how.
- The target directory must be (or become) a `bd` project: check for `.beads/` first; if absent and the user wants tracking, run `bd init --non-interactive` in the project root.

## Formulas bundled with this skill

| Formula | Mirrors | Phase |
|---|---|---|
| `product-design-build` | `get-context → visual-source (ideate/url-to-code) → build (image-to-code) → design-qa → share` | Usually `pour` (persistent) — a real deliverable worth an audit trail |
| `annotate-cycle` | `annotate-inject (if needed) → collect → annotate → re-verify` | Usually `wisp` (ephemeral) — an operational, recurring loop without standalone audit value; `bd mol squash` promotes it to persistent if the user wants a record of a specific annotation round |

Both live in `../../assets/beads-formulas/*.formula.toml` and use `bd`'s real formula/molecule mechanism — verified end-to-end (formula recognized by `bd formula show`, instantiated by `bd mol pour`/`bd mol wisp`, dependencies enforced correctly by `bd ready`).

## Install workflow

1. Confirm `bd` is available and the target is (or should become) a `bd` project (see Prerequisites).
2. Copy the formula file(s) needed into the project's formula search path:
   ```bash
   mkdir -p .beads/formulas
   cp /absolute/path/to/plugins/product-design/assets/beads-formulas/product-design-build.formula.toml .beads/formulas/
   cp /absolute/path/to/plugins/product-design/assets/beads-formulas/annotate-cycle.formula.toml .beads/formulas/
   ```
3. Confirm `bd formula list` shows the new formula/formulas.
4. Instantiate when a project actually starts, not preemptively for hypothetical future work:
   ```bash
   bd mol pour product-design-build --var target="<what's being designed>" --var framework=<vite|nextjs|nuxt|astro|existing-codebase> --var visual_source=<ideate|url|provided>
   ```
   For an annotation round on an already-built project:
   ```bash
   bd mol wisp annotate-cycle --var target="<project>" --var needs_install=<true|false> --var framework=<...>
   ```
5. For each active phase, keep the issue or comment explicit about epic/outcome, phase gate, acceptance criteria, dependencies, ready/blocked state, owner, evidence, and next task. Avoid circular dependencies: Beads mirrors the Product Design decision; it does not decide it.
6. As the actual Product Design skills run (`product-design:get-context`, `product-design:ideate`, `product-design:image-to-code`, `product-design:design-qa`, `product-design:share`, `product-design:annotate`), close the matching bead step (`bd close <id> --reason "..."`) rather than leaving beads to drift from the real state. Do not batch-close several steps at once to "catch up" — close each as its real work finishes.

## Querying status

- `bd ready` — what can start right now (no unresolved dependency).
- `bd blocked` — what's waiting on something else.
- `bd show <root-id>` — full phase breakdown for one project.
- `bd list` — everything, grouped by parent.

Use these to answer "where are we on X" instead of re-deriving it from the conversation. If the user asks for status and beads exist for this project, prefer `bd show`/`bd ready` output over a memory-based summary.

## Design-QA's loop is not modeled as N beads

`product-design:design-qa` is inherently iterative (compare → fix → re-compare until passed). Do not create a new bead per QA iteration. Instead:

- Leave a comment on the `product-design:design-qa` step each time a pass returns `blocked`, citing the findings (`bd comment <id> "..."`).
- Reopen the step (`bd reopen <id>`) if new annotations require another QA pass after it was already closed.
- Close it once `design-qa.md` says `final result: passed`.

## What not to do

- Do not require the user to have `bd` installed, or install it for them unprompted, to do ordinary Product Design work.
- Do not pour a persistent mol for a one-off disposable prototype the user explicitly called throwaway — use `wisp`, or skip tracking entirely.
- Do not let bead bookkeeping become user-visible busywork — keep status updates to `bd close`/`bd comment` calls between the actual design work, not a parallel narration track.
- Do not invent additional formula steps beyond what's in the two bundled formulas without checking whether the plugin's own skills actually changed shape first — these formulas should stay in sync with `product-design:get-context`/`product-design:image-to-code`/`product-design:design-qa`/`product-design:annotate`'s real steps, not drift into their own workflow.
