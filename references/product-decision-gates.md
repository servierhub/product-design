# Product decision gates

Use these gates for Product Design work. They challenge product value without turning small edits into ceremony.

## Operating rules

- A gate has hard criteria, a weighted quality score, separate evidence confidence, and a verdict.
- A score never compensates for a missing hard criterion.
- Verdicts: pass, conditional, experiment, blocked.
- Confidence: very-low (intuition), low (anecdotes), medium (converging observations), high (structured tests/data), very-high (repeated behavioral evidence).
- Score dimensions from 0–5 and apply weights. Cite evidence; do not invent precision.
- For involved work, write gate records under project-root .gates/. Include verdict, criteria, score, confidence, evidence, assumptions, risks, success criteria, rejected alternatives, next step, and decision owner.
- Tiny static edits, audits, and exact clones use only relevant gates.

## G1 — Brief to journey/visual ideation

Hard criteria: problem/opportunity, target user and context, intended outcome, product/business value, one observable success criterion, material assumptions and constraints, accessible references, review framework, production destination, and design system.

Weights: problem clarity 20; user importance 15; outcome 15; product value 15; measurable success 15; evidence 10; constraints/risks 5; ideation scope 5. Pass at 75+, conditional at 60–74 only with all hard criteria, blocked below 60. An essential dimension below 2/5 blocks.

## Evidence labels

Every involved-work gate must identify whether its evidence is observed user behavior, internal operational data, stakeholder input, external research, inference, or assumption. A prototype walkthrough by the building agent proves execution, not usability or desirability. Stakeholder approval proves decision alignment, not user validation.

For multi-persona services, require a shared service boundary, persona lanes, backstage/system dependencies and handoffs before G2 can pass.

## G2 — End-to-end journey boards to selected journey

Compare exactly three journey hypotheses at the same boundary and outcome. Each must share user/context, scenario/data, start, end and success criterion, while differing as an interaction strategy. For every candidate, define its screen plan, generate every traversed screen as a separate full-size image, then assemble one board page from those files. Three candidates produce three pages. Multi-screen Image Gen composites, sprite sheets, miniature grids and N-column screen images fail.

Weights: need fit 25; success potential 20; friction/cognitive load 15; learnability/recovery 10; product value 10; feasibility 10; risks/assumptions 10. The user selects one complete board page. With insufficient evidence, label the choice as an experiment. Save the selected displayed option and board path in .gates/02-journey-selection.md.

## G3 — Selected journey to approved screen set

Before generation, require ordered plans for all three variants. Generate one full-size screen at a time for every variant. The first screen anchors each variant; later screens preserve shell, tokens, typography, imagery, anatomy and data continuity. Board pages reference these files without Image Gen recomposition.

Pass only when every required screen has a visible generated source, the set covers the selected journey end to end, contradictions have been repaired, and the user approves the ordered screen set. A board page or screenshot alone cannot pass G3; the selected variant must resolve to individual approved screen files. Save the plan and approval in .gates/03-screen-production-plan.md and .gates/03-visual-selection.md.

For a genuinely single-screen target, G3 instead compares three visual directions for that same screen using the same content, viewport, state and design-system constraints.

## G4 — Selected direction to prototype

Require a resolvable selected journey and visual target, hypothesis, evaluation slice, core states, realistic mock data, success criterion, out-of-scope behavior, design-system components, and framework rationale.

## G5 — Prototype to review/handoff

Two independent gates must pass: (1) execution quality: browser evidence, matching viewport/state, interactions, accessibility, responsiveness, no actionable P0/P1/P2; (2) product-test validity: stated hypothesis and success criterion are testable, primary task is clear, data/states are realistic enough, limitations and test scenario are explicit. Fidelity cannot compensate for testing the wrong journey.

## G6 — Validated prototype to industrialization

Assess desirability 20; usability 15; user/product value 20; feasibility 15; viability 10; risk readiness 10; evidence confidence 10. Pass at 75+ with at least medium confidence, no untreated critical risk, written acceptance criteria and product ownership. Otherwise experiment or block.

## G7 — Production readiness

Require applicable tests/checks, auth, data migrations, i18n, observability, secret handling, accessibility, performance, compliance, business acceptance, rollback and post-release measurement. Repository conventions remain authoritative.
