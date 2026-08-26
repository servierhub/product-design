# Deterministic ideation contract

Use this contract for every multi-screen ideation run. The canonical manifest is the source of truth; board manifests are presentation-only derivatives.

## Canonical manifest

Create one JSON manifest before image generation and link its path and SHA-256 fingerprint from the G2/G3 gate records and the active Beads task. Keep it in the work product, not in this plugin repository. Use schema version 1 and validate it with the exported `validateIdeationManifest` function in `scripts/ideation-contract.mjs`.

The manifest freezes:

- one comparison contract: service, user/context, start, end, scenario data, success criterion, platform, viewport, references, and visual contract;
- exactly `V1`, `V2`, and `V3`, each with a unique relative output directory;
- ordered `Vx-Sn` screens with purpose, user question, entry, journey moment, exact visible content, actions, recovery, exit, next screen, acceptance criteria, canonical prompt, and screen visual contract;
- generation model, resolved size, target aspect ratio, bounded attempt count, and enhancement setting.

Do not add timestamps, runtime paths, generated IDs, or results to the frozen manifest. Runtime evidence belongs in the execution state so the same canonical JSON and fingerprint can be reused across model runs.

## Model-aware dimensions

Resolve dimensions before freezing the manifest. Desktop 3:2 defaults are:

| Model family | Size | Ratio |
|---|---:|---:|
| GPT Image 2 | 1536 × 1024 | 3:2 |
| MAI Image 2.5 | 1152 × 768 | 3:2 |
| MAI Image 2.5 Flash | 1152 × 768 | 3:2 |

An explicit override wins only when the selected model supports it and it preserves the frozen ratio. Unknown models require an explicit capability list. On rejection, report same-ratio alternatives; never silently fall back to a different ratio.

## Three-lane execution

Run one lane per variant concurrently. Within a lane, use a strict `for` sequence: a successor starts only after its predecessor is inspected and accepted. The first accepted screen becomes the continuity anchor; pass its exact returned path to the next screen.

For every call:

1. Supply the manifest's canonical prompt, visual contract, references, model, resolved size, ratio, enhancement setting, isolated output directory, and bounded attempt number.
2. Read the path returned by that call. Do not scan a directory, sort by modification time, use a `latest` file, infer a filename, or copy another variant's output.
3. Verify that the returned path is inside that variant's directory.
4. Inspect the image against its acceptance criteria and predecessor anchor.
5. Compute and record SHA-256, provider timing, orchestration timestamps, prompt provenance, attempt, and verdict.
6. Persist state after every accepted or rejected attempt. Resume accepted screens from their recorded exact paths; never regenerate them merely to resume.

Reject duplicate hashes across screen IDs, paths outside the assigned directory, missing evidence, continuity violations, or exhausted attempts. Assemble boards only after all lanes finish, always in V1/V2/V3 order rather than completion order.

## Fair model benchmark

A benchmark unit is one screen manifest entry. Every compared run must use the identical canonical prompt, visual contract, references, target ratio, attempt count, and enhancement setting. Model-native pixel dimensions may differ only to preserve that ratio. Record model/deployment, exact returned path, dimensions, SHA-256, provider and end-to-end timings, prompt provenance, usage availability, cost availability, and side-by-side artifact location.

Set `claimAllowed: false` and make no model-quality, speed, or cost claim whenever any comparison condition or required evidence differs. Missing usage or cost values are allowed only when explicitly recorded as unavailable. Never mutate official artifacts during a benchmark; write all runs to isolated benchmark directories.

For the three-lane versus fifteen-wide experiment, retain provider timing, end-to-end timing, retry/rate-limit events, orchestration overhead, duplicate/collision checks, and a documented continuity score. Accept or reject fifteen-wide from measured evidence. The human-elapsed target is under 30 minutes when provider capacity allows; it is not evidence by itself.

### Live-evidence dependency

Live parallelism evidence is blocked on an **image-mcp release newer than `@bioinfornatics/image-mcp@0.2.1`** that returns the observability fields required by this contract for every generation: configured/requested/resolved/effective deployment and model, input and effective prompts, provider timing distinct from caller-measured end-to-end timing, explicit usage and cost availability, and the exact persisted output path. Version 0.2.1 does not expose that complete released interface. An unreleased checkout or inferred provider configuration is not acceptable evidence. Keep the live claim blocked until a published package version containing that interface is installed and recorded in the benchmark artifact.
