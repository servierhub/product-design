#!/usr/bin/env node
import { createHash } from "node:crypto";
import path from "node:path";

const MODEL_PROFILES = [
  { pattern: /gpt-image-2/i, name: "gpt-image-2", desktop: "1536x1024", sizes: ["1024x1024", "1536x1024", "1024x1536"] },
  { pattern: /mai-image-2\.5-flash/i, name: "MAI-Image-2.5-Flash", desktop: "1152x768", sizes: ["1152x768"], mai: true },
  { pattern: /mai-image-2\.5/i, name: "MAI-Image-2.5", desktop: "1152x768", sizes: ["1152x768"], mai: true },
];
function fail(message) { throw new Error(message); }
function dimensions(size) { const match = /^(\d+)x(\d+)$/.exec(String(size)); if (!match) fail(`Invalid image size: ${size}`); return { width: Number(match[1]), height: Number(match[2]) }; }
function gcd(a, b) { while (b) [a, b] = [b, a % b]; return a; }
export function ratioOf(size) { const { width, height } = dimensions(size); const divisor = gcd(width, height); return `${width / divisor}:${height / divisor}`; }
function profileFor(model) { return MODEL_PROFILES.find(({ pattern }) => pattern.test(String(model))); }
export function selectImageDimensions({ model, aspectRatio = "3:2", override, capabilities } = {}) {
  if (!model) fail("model is required");
  const profile = profileFor(model); const allowed = capabilities?.sizes ?? profile?.sizes;
  const candidate = override ?? (aspectRatio === "3:2" ? profile?.desktop : undefined);
  if (!candidate) fail(`No registered ${aspectRatio} size for model ${model}; provide capabilities or an explicit supported override`);
  const actualRatio = ratioOf(candidate); if (actualRatio !== aspectRatio) fail(`Size ${candidate} has ratio ${actualRatio}, not required ratio ${aspectRatio}`);
  const { width, height } = dimensions(candidate); const maiCompatible = !profile?.mai || (width >= 768 && height >= 768 && width * height <= 1_048_576);
  if ((allowed && !allowed.includes(candidate)) || !maiCompatible) { const alternatives = (allowed ?? [profile?.desktop]).filter(Boolean).filter((size) => ratioOf(size) === aspectRatio); fail(`Size ${candidate} is unsupported by ${model}. Same-ratio alternatives: ${alternatives.join(", ") || "none registered"}`); }
  return { model: profile?.name ?? model, size: candidate, aspectRatio, width, height, source: override ? "override" : "model-default" };
}
function requireText(value, label) { if (typeof value !== "string" || !value.trim()) fail(`${label} is required`); }
function requireStringArray(value, label, allowEmpty = false) { if (!Array.isArray(value) || (!allowEmpty && !value.length) || value.some((item) => typeof item !== "string" || !item.trim())) fail(`${label} must be ${allowEmpty ? "an" : "a non-empty"} array of strings`); }
function isInside(candidate, directory) { return candidate === directory || candidate.startsWith(directory + path.sep); }
export function validateIdeationManifest(manifest) {
  if (!manifest || manifest.schemaVersion !== 1) fail("schemaVersion must equal 1"); requireText(manifest.manifestId, "manifestId");
  const contract = manifest.comparisonContract; if (!contract || typeof contract !== "object") fail("comparisonContract is required");
  for (const field of ["service", "userContext", "start", "end", "scenarioData", "successCriterion", "platform", "visualContract"]) requireText(contract[field], `comparisonContract.${field}`);
  if (!contract.viewport || !Number.isInteger(contract.viewport.width) || !Number.isInteger(contract.viewport.height)) fail("comparisonContract.viewport requires integer width and height");
  requireStringArray(contract.references, "comparisonContract.references", true);
  if (!Array.isArray(manifest.variants) || manifest.variants.length !== 3) fail("manifest must contain exactly three variants");
  const seenDirectories = new Set(), seenScreens = new Set();
  manifest.variants.forEach((variant, variantIndex) => {
    const expectedVariant = `V${variantIndex + 1}`; if (variant.id !== expectedVariant) fail(`variant ${variantIndex + 1} must be ${expectedVariant}`);
    requireText(variant.title, `${variant.id}.title`); requireText(variant.thesis, `${variant.id}.thesis`); requireText(variant.outputDirectory, `${variant.id}.outputDirectory`);
    if (path.isAbsolute(variant.outputDirectory) || variant.outputDirectory.split(/[\\/]+/).includes("..")) fail(`${variant.id}.outputDirectory must be a safe relative path`);
    if (seenDirectories.has(variant.outputDirectory)) fail("variant output directories must be isolated"); seenDirectories.add(variant.outputDirectory);
    if (!Array.isArray(variant.screens) || !variant.screens.length) fail(`${variant.id}.screens must not be empty`);
    variant.screens.forEach((screen, screenIndex) => {
      const expectedScreen = `${variant.id}-S${screenIndex + 1}`; if (screen.id !== expectedScreen) fail(`screen ${screenIndex + 1} in ${variant.id} must be ${expectedScreen}`);
      if (seenScreens.has(screen.id)) fail(`duplicate screen id: ${screen.id}`); seenScreens.add(screen.id);
      for (const field of ["title", "purpose", "userQuestion", "entryState", "journeyMoment", "visibleContent", "actions", "recovery", "exit", "nextScreen", "canonicalPrompt", "visualContract"]) requireText(screen[field], `${screen.id}.${field}`);
      if (screen.visualContract !== contract.visualContract) fail(`${screen.id}.visualContract must exactly match comparisonContract.visualContract`);
      requireStringArray(screen.acceptanceCriteria, `${screen.id}.acceptanceCriteria`); if (!screen.target?.aspectRatio) fail(`${screen.id}.target.aspectRatio is required`);
      const selected = selectImageDimensions({ model: screen.generation?.model, aspectRatio: screen.target.aspectRatio, override: screen.generation?.size, capabilities: screen.generation?.capabilities });
      if (screen.generation.size !== selected.size) fail(`${screen.id}.generation.size must be the resolved model-aware size`);
      if (!Number.isInteger(screen.generation.attempts) || screen.generation.attempts < 1) fail(`${screen.id}.generation.attempts must be a positive integer`);
      if (typeof screen.generation.enhancement !== "boolean") fail(`${screen.id}.generation.enhancement must be boolean`);
    });
  }); return manifest;
}
export function canonicalManifestJson(manifest) { validateIdeationManifest(manifest); const sort = (value) => Array.isArray(value) ? value.map(sort) : value && typeof value === "object" ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, sort(value[key])])) : value; return JSON.stringify(sort(manifest), null, 2) + "\n"; }
export function manifestFingerprint(manifest) { return createHash("sha256").update(canonicalManifestJson(manifest)).digest("hex"); }
function exactConfinedPath(value, outputDirectory, label) { requireText(value, label); if (value !== path.resolve(value)) fail(`${label} must be the exact absolute path`); if (!isInside(value, outputDirectory)) fail(`${label} is outside its isolated variant directory`); return value; }
function validateInspection(review, screen, returnedPath, anchorPath, persistedSha256) {
  if (!review?.accepted) fail(`${screen.id} image reinspection rejected the output`);
  if (review.inspectedPath !== returnedPath) fail(`${screen.id} inspection must identify the exact returned path`);
  requireText(review.sha256, `${screen.id} inspected sha256`);
  if (persistedSha256 && review.sha256 !== persistedSha256) fail(`${screen.id} persisted sha256 does not match reinspection`);
  if (review.visualContractAccepted !== true) fail(`${screen.id} missing or mismatched visual contract`);
  if (anchorPath && review.continuityAccepted !== true) fail(`${screen.id} continuity with its accepted predecessor was not verified`);
  return review.sha256;
}
export async function executeThreeLanes({ manifest, workspaceRoot, generate, inspect, persist = async () => {}, resume = {}, now = () => Date.now() }) {
  validateIdeationManifest(manifest); if (typeof generate !== "function" || typeof inspect !== "function") fail("generate and inspect callbacks are required"); requireText(workspaceRoot, "workspaceRoot");
  const root = path.resolve(workspaceRoot), state = structuredClone(resume), hashes = new Map(); let persistQueue = Promise.resolve();
  const persistState = () => { const snapshot = structuredClone(state); persistQueue = persistQueue.then(() => persist(snapshot)); return persistQueue; };
  for (const variant of manifest.variants) {
    const outputDirectory = path.resolve(root, variant.outputDirectory); if (!isInside(outputDirectory, root)) fail(`${variant.id} output directory escapes workspace`);
    for (const screen of variant.screens) { const record = state[screen.id]; if (record?.status !== "accepted") continue;
      if (record.screenId !== screen.id || record.variantId !== variant.id) fail(`${screen.id} persisted identity mismatch`);
      exactConfinedPath(record.returnedPath, outputDirectory, `${screen.id} persisted returnedPath`); requireText(record.sha256, `${screen.id} persisted sha256`);
      if (hashes.has(record.sha256)) fail(`duplicate persisted output hash for ${screen.id} and ${hashes.get(record.sha256)}`); hashes.set(record.sha256, screen.id);
    }
  }
  const lane = async (variant) => { const outputDirectory = path.resolve(root, variant.outputDirectory); let anchorPath;
    for (const screen of variant.screens) {
      const previous = state[screen.id];
      if (previous?.status === "accepted") { const returnedPath = exactConfinedPath(previous.returnedPath, outputDirectory, `${screen.id} persisted returnedPath`); const review = await inspect({ screen, returnedPath, anchorPath, acceptanceCriteria: screen.acceptanceCriteria, resumed: true }); validateInspection(review, screen, returnedPath, anchorPath, previous.sha256); anchorPath = returnedPath; continue; }
      let accepted = false;
      for (let attempt = 1; attempt <= screen.generation.attempts; attempt++) {
        const startedAt = now(); const result = await generate({ variantId: variant.id, screenId: screen.id, canonicalPrompt: screen.canonicalPrompt, visualContract: screen.visualContract, model: screen.generation.model, size: screen.generation.size, aspectRatio: screen.target.aspectRatio, enhancement: screen.generation.enhancement, references: manifest.comparisonContract.references, outputDirectory, anchorPath, attempt });
        requireText(result?.path, `${screen.id} exact returned path`); const returnedPath = exactConfinedPath(result.path, outputDirectory, `${screen.id} returned path`);
        const review = await inspect({ screen, returnedPath, anchorPath, acceptanceCriteria: screen.acceptanceCriteria, resumed: false });
        const record = { screenId: screen.id, variantId: variant.id, status: review?.accepted ? "accepted" : "rejected", returnedPath, sha256: review?.sha256, attempt, startedAt, completedAt: now(), providerTiming: result.timing ?? null, promptProvenance: result.promptProvenance ?? null };
        if (review?.accepted) { const sha256 = validateInspection(review, screen, returnedPath, anchorPath); const duplicateOf = hashes.get(sha256); if (duplicateOf) { record.status = "collision"; record.duplicateOf = duplicateOf; state[screen.id] = record; await persistState(); fail(`duplicate output hash for ${screen.id} and ${duplicateOf}`); } hashes.set(sha256, screen.id); anchorPath = returnedPath; accepted = true; }
        state[screen.id] = record; await persistState(); if (accepted) break;
      } if (!accepted) fail(`${screen.id} exhausted its bounded attempts`);
    }
  };
  const orchestrationStartedAt = now(); await Promise.all(manifest.variants.map(lane)); return { state, variantOrder: ["V1", "V2", "V3"], orchestrationStartedAt, orchestrationCompletedAt: now() };
}
function benchmarkText(run, field, reasons) { if (typeof run[field] !== "string" || !run[field].trim()) reasons.push(`run missing ${field}`); }
export function assessBenchmarkContract(benchmark) {
  if (!benchmark || benchmark.schemaVersion !== 1 || !Array.isArray(benchmark.runs) || benchmark.runs.length < 2) fail("benchmark requires schemaVersion 1 and at least two runs");
  const reasons = [], comparable = ["canonicalPrompt", "visualContract", "aspectRatio", "attempts", "enhancement"];
  for (const field of comparable) if (benchmark.runs.some((run) => JSON.stringify(run[field]) !== JSON.stringify(benchmark.runs[0][field]))) reasons.push(`mismatched ${field}`);
  if (benchmark.runs.some((run) => JSON.stringify(run.references ?? []) !== JSON.stringify(benchmark.runs[0].references ?? []))) reasons.push("mismatched references");
  for (const [index, run] of benchmark.runs.entries()) {
    const label = `run ${index + 1}`;
    for (const field of ["canonicalPrompt", "visualContract", "configuredDeployment", "configuredModel", "requestedDeployment", "requestedModel", "resolvedDeployment", "resolvedModel", "effectiveDeployment", "effectiveModel", "returnedPath", "sha256", "sideBySideArtifact"]) if (typeof run[field] !== "string" || !run[field].trim()) reasons.push(`${label} missing ${field}`);
    if (!Array.isArray(run.references) || run.references.some((reference) => typeof reference !== "string" || !reference.trim())) reasons.push(`${label} missing references provenance`);
    if (!Number.isInteger(run.attempts) || run.attempts < 1) reasons.push(`${label} missing attempt count`);
    if (typeof run.enhancement !== "boolean") reasons.push(`${label} missing enhancement setting`);
    if (!Number.isInteger(run.dimensions?.width) || run.dimensions.width <= 0 || !Number.isInteger(run.dimensions?.height) || run.dimensions.height <= 0) reasons.push(`${label} missing explicit dimensions`);
    else { const size = `${run.dimensions.width}x${run.dimensions.height}`; if (ratioOf(size) !== run.aspectRatio) reasons.push(`${label} dimensions do not preserve ratio`); }
    if (typeof run.aspectRatio !== "string" || !/^\d+:\d+$/.test(run.aspectRatio)) reasons.push(`${label} missing explicit aspectRatio`);
    if (typeof run.promptProvenance?.inputPrompt !== "string" || !run.promptProvenance.inputPrompt.trim()) reasons.push(`${label} missing input prompt provenance`);
    if (typeof run.promptProvenance?.effectivePrompt !== "string" || !run.promptProvenance.effectivePrompt.trim()) reasons.push(`${label} missing effective prompt provenance`);
    if (run.promptProvenance?.inputPrompt !== run.canonicalPrompt) reasons.push(`${label} input prompt differs from canonicalPrompt`);
    if (!Number.isFinite(run.timing?.providerMs) || run.timing.providerMs < 0) reasons.push(`${label} missing provider timing`);
    if (!Number.isFinite(run.timing?.endToEndMs) || run.timing.endToEndMs < 0) reasons.push(`${label} missing end-to-end timing`);
    if (typeof run.usage?.available !== "boolean") reasons.push(`${label} missing usage availability`);
    if (typeof run.cost?.available !== "boolean") reasons.push(`${label} missing cost availability`);
  }
  if (benchmark.runs.some((run) => run.promptProvenance?.effectivePrompt !== benchmark.runs[0].promptProvenance?.effectivePrompt)) reasons.push("mismatched effective prompt");
  if (benchmark.runs.some((run) => run.sideBySideArtifact !== benchmark.runs[0].sideBySideArtifact)) reasons.push("mismatched side-by-side artifact location");
  return { fair: reasons.length === 0, claimAllowed: reasons.length === 0, reasons: [...new Set(reasons)] };
}
