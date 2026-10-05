# Visual artifact index

For involved visual work, `artifact-index.json` is the canonical machine-readable inventory. Each entry records an ID, exact path, purpose, status (`accepted`, `rejected`, or `history`), `canonical` boolean, SHA-256, source-manifest path, and `supersededBy` when an accepted artifact is replaced. Keep rejected and history evidence; do not overwrite it.

Exactly one accepted artifact may be canonical for a purpose. Consumers resolve that entry through `validateArtifactIndex`; names such as `corrective`, `final`, and `latest` carry no lifecycle meaning and must never select build or QA input.
