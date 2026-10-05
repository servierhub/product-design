# Planning-Aware Routing and Optional Tracking

Use this contract for involved, multi-phase Product Design work. It adds consistent planning vocabulary without making project tracking a prerequisite.

## Signals and activation

- **Explicit tracking signal:** the user names Beads, `bd`, `product-design:project-status`, issue tracking, or asks to track status/progress. Route to `product-design:project-status`; this permits tracking within the requested scope.
- **Existing tracker signal:** the target project already contains `.beads/`. For related involved work, route to `product-design:project-status` and use the existing tracker. Do not initialize another tracker or create unrelated issues.
- **Planning-vocabulary signal only:** involved work uses a cluster such as *epic*, *phase gate*, *acceptance criteria*, *dependencies*, *ready*, *blocked*, *owner*, *evidence*, or *next task*, without explicitly requesting tracking and with no known `.beads/`. Offer `product-design:project-status` once and obtain confirmation before initializing Beads or creating/updating issues. Continue the design workflow while confirmation is pending.
- **No signal:** do not mention or invoke tracking. A simple one-shot request, ordinary phase prose, one acceptance criterion, or an incidental word such as “ready” or “owner” is not enough.

Vocabulary is a contextual cluster, not a keyword trap. Require involved multi-phase intent plus planning structure; never activate tracking from one isolated word.

## Phase checklist

For involved work, keep a lightweight phase record in conversation or artifacts whether or not Beads is active:

- **Epic or outcome:** larger deliverable served.
- **Current phase and phase gate:** work underway and the decision needed to advance.
- **Acceptance criteria:** observable completion conditions.
- **Dependencies:** prerequisites and downstream work, without circular dependencies.
- **State:** `ready`, `blocked`, or completed, with a concrete blocker when blocked.
- **Owner:** person or agent responsible for the current decision or action.
- **Evidence:** artifact paths, URLs, captures, gate records, or test results supporting state.
- **Next task:** smallest useful next action.

When Beads is active, mirror these fields in the relevant issue or comment. Otherwise, concise prose or existing `.gates/` artifacts suffice.

## Non-circular flow

Product-design gates decide design readiness; Beads mirrors status and dependencies. Never make a Product Design phase wait for a Beads update, and never make a Beads task depend on proof that can only be produced after that same task closes. Missing Beads, declined tracking, or pending confirmation must not block design, build, QA, or sharing.

## Gate and Beads consistency

Gate evidence is authoritative; Beads is an optional mirror. Use the transaction order **evidence → `.gates/` record → Beads mirror → readiness**. Mirror the canonical gate status and evidence SHA-256. If any write fails, stop and leave downstream state untouched. Before closing a tracked phase, compare its gate, canonical status, and hash using `assertBeadsClosure`; divergence is a blocker, not a warning.
