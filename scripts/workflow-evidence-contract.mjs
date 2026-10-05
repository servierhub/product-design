#!/usr/bin/env node
import { createHash } from "node:crypto";

const fail = (message) => { throw new Error(message); };
const text = (value, label) => { if (typeof value !== "string" || !value.trim()) fail(`${label} is required`); };
const exactVerdicts = new Set(["pass", "conditional", "experiment", "blocked"]);
const phaseOrder = { ideation: 1, build: 2, industrialization: 3 };
export const sha256 = (value) => createHash("sha256").update(typeof value === "string" ? value : canonicalJson(value)).digest("hex");
export const canonicalJson = (value) => JSON.stringify(sort(value));
const sort = (value) => Array.isArray(value) ? value.map(sort) : value && typeof value === "object" ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, sort(value[key])])) : value;
const pathEvidence = (value, label) => { text(value, label); if (!value.startsWith("/") && !/^https?:\/\//.test(value)) fail(`${label} must be an exact absolute path or URL`); };

export function validateG1(record, targetPhase = "ideation") {
  if (record?.schemaVersion !== 1 || record.gate !== "G1") fail("G1 schemaVersion 1 record required");
  for (const field of ["owner", "timestamp", "problem", "targetUser", "outcome", "productValue", "successCriterion", "reviewFramework", "productionDestination", "designSystem"]) text(record[field], `G1.${field}`);
  if (!Number.isFinite(record.score) || record.score < 0 || record.score > 100) fail("G1.score must be 0..100");
  text(record.confidence, "G1.confidence");
  if (!exactVerdicts.has(record.verdict)) fail("G1.verdict is invalid");
  if (!Array.isArray(record.conditions)) fail("G1.conditions is required");
  for (const [i, condition] of record.conditions.entries()) {
    text(condition.boundary, `G1.conditions[${i}].boundary`); text(condition.disposition, `G1.conditions[${i}].disposition`);
    if (!(condition.boundary in phaseOrder)) fail(`G1.conditions[${i}].boundary is invalid`);
    if (!["resolved", "accepted-risk", "blocked"].includes(condition.disposition)) fail(`G1.conditions[${i}].disposition is invalid`);
    if (condition.disposition === "blocked" && phaseOrder[condition.boundary] <= phaseOrder[targetPhase]) fail(`unresolved G1 blocker at ${condition.boundary} boundary`);
  }
  if (record.verdict === "blocked") fail("G1 is blocked");
  return record;
}

export function validateGateRecord(record, { expectedGate, evidenceHash } = {}) {
  if (record?.schemaVersion !== 1) fail("gate schemaVersion must equal 1");
  if (!/^G[1-7]$/.test(record.gate) || (expectedGate && record.gate !== expectedGate)) fail("unexpected gate");
  for (const field of ["owner", "timestamp", "evidencePath", "evidenceHash"]) text(record[field], `gate.${field}`);
  pathEvidence(record.evidencePath, "gate.evidencePath");
  if (!/^[a-f0-9]{64}$/.test(record.evidenceHash)) fail("gate.evidenceHash must be sha256");
  if (evidenceHash && record.evidenceHash !== evidenceHash) fail("gate evidence hash diverges");
  if (!exactVerdicts.has(record.verdict)) fail("gate verdict is invalid");
  if (record.status !== "selected" && record.status !== "approved-for-build" && record.status !== "QA-passed" && record.status !== "validated") fail("gate status is not canonical");
  if (record.verdict !== "pass") fail(`${record.gate} does not pass`);
  return record;
}

export async function advanceGateTransaction({ evidence, gate, writeEvidence, writeGate, mirrorBeads, writeReadiness }) {
  for (const callback of [writeEvidence, writeGate, mirrorBeads, writeReadiness]) if (typeof callback !== "function") fail("all transaction callbacks are required");
  const evidenceHash = sha256(evidence); validateGateRecord(gate, { evidenceHash });
  await writeEvidence(evidence); // Nothing downstream may happen before durable evidence.
  await writeGate(gate);         // Gate file is authoritative.
  await mirrorBeads({ gate: gate.gate, status: gate.status, evidenceHash });
  await writeReadiness({ ready: true, gate: gate.gate, evidenceHash });
  return { ready: true, evidenceHash };
}

export function assertBeadsClosure({ gate, bead }) {
  validateGateRecord(gate);
  if (bead?.gate !== gate.gate || bead?.status !== gate.status || bead?.evidenceHash !== gate.evidenceHash) fail("Beads state diverges from authoritative gate; closure refused");
  return true;
}

export function validateIdeationEvidence(manifest) {
  if (manifest?.schemaVersion !== 1) fail("ideation evidence schemaVersion must equal 1");
  if (!["visual-and-copy", "composition-only"].includes(manifest.mode)) fail("ideation mode must be visual-and-copy or composition-only");
  if (!["lean", "full-evidence"].includes(manifest.evidenceMode)) fail("evidenceMode must be lean or full-evidence");
  if (!Array.isArray(manifest.candidates) || manifest.candidates.length !== 3) fail("exactly three candidates are required");
  const hashes = new Map();
  for (const [i, candidate] of manifest.candidates.entries()) {
    if (candidate.provenance !== "generated-candidate") fail(`candidate ${i + 1} cannot use source research or provided target provenance`);
    pathEvidence(candidate.path, `candidate ${i + 1}.path`); text(candidate.sha256, `candidate ${i + 1}.sha256`);
    if (hashes.has(candidate.sha256) && candidate.declaredDuplicateOf !== hashes.get(candidate.sha256)) fail(`undeclared duplicate candidate hash: ${candidate.sha256}`);
    hashes.set(candidate.sha256, candidate.id);
    if (candidate.criticalCopyReadable !== true) fail(`candidate ${i + 1} has unreadable critical copy`);
  }
  if (manifest.mode === "composition-only") {
    if (!manifest.copyManifest || !Array.isArray(manifest.copyManifest.entries) || !manifest.copyManifest.entries.length) fail("composition-only requires a copy manifest");
    for (const entry of manifest.copyManifest.entries) { text(entry.key, "copyManifest key"); text(entry.exactText, "copyManifest exactText"); }
  }
  return manifest;
}

export function selectIdeationMode({ materialRisk = false, regulatedCopy = false, journeyUncertainty = false } = {}) {
  return materialRisk || regulatedCopy || journeyUncertainty ? { mode: "full-evidence", relativeCost: 3 } : { mode: "lean", relativeCost: 1 };
}

export function validateDesignQaReport(report) {
  if (report?.schemaVersion !== 1) fail("design QA schemaVersion must equal 1");
  if (!Array.isArray(report.states) || !report.states.length) fail("design QA requires a state matrix");
  for (const [i, state] of report.states.entries()) {
    for (const field of ["id", "route", "state", "sourcePath", "renderedPath", "combinedComparisonPath"]) text(state[field], `states[${i}].${field}`);
    pathEvidence(state.sourcePath, `states[${i}].sourcePath`); pathEvidence(state.renderedPath, `states[${i}].renderedPath`); pathEvidence(state.combinedComparisonPath, `states[${i}].combinedComparisonPath`);
    if (!Number.isInteger(state.viewport?.width) || !Number.isInteger(state.viewport?.height)) fail(`states[${i}].viewport is required`);
    for (const surface of ["typography", "spacing", "colors", "images", "copy"]) text(state.surfaces?.[surface], `states[${i}].surfaces.${surface}`);
    if (state.console?.checked !== true || !Array.isArray(state.console.errors)) fail(`states[${i}].console check is required`);
    if (state.console.errors.length) fail(`states[${i}] has reproducible runtime console errors`);
  }
  if (!Array.isArray(report.history)) fail("design QA comparison history is required");
  for (const [i, item] of report.history.entries()) { if (!["P0", "P1", "P2"].includes(item.severity)) fail(`history[${i}].severity is invalid`); for (const field of ["finding", "fix", "beforePath", "afterPath"]) text(item[field], `history[${i}].${field}`); }
  if (report.openP0P1P2 !== 0) fail("actionable P0/P1/P2 remain");
  if (report.g5?.execution !== "pass" || report.g5?.productTestValidity !== "pass") fail("both G5 gates must pass");
  if (report.finalResult !== "passed") fail("design QA finalResult must be passed");
  return report;
}

export function validateAnnotationReceipt(receipt) {
  if (receipt?.schemaVersion !== 1) fail("annotation receipt schemaVersion must equal 1");
  for (const field of ["projectRoot", "route", "timestamp"]) text(receipt[field], `annotation.${field}`);
  if (!Number.isInteger(receipt.viewport?.width) || !Number.isInteger(receipt.viewport?.height)) fail("annotation viewport is required");
  for (const field of ["overlay", "post", "inboxWrite", "productionGuard"]) if (receipt.transport?.[field] !== true) fail(`annotation transport.${field} was not verified`);
  if (typeof receipt.editCycleTested !== "boolean") fail("annotation editCycleTested boolean is required");
  if (receipt.editCycleTested) for (const field of ["beforeCapture", "mapping", "edit", "afterCapture", "processedRecord", "qaResult"]) text(receipt.editCycle?.[field], `annotation.editCycle.${field}`);
  return receipt;
}

export function validateArtifactIndex(index) {
  if (index?.schemaVersion !== 1 || !Array.isArray(index.artifacts) || !index.artifacts.length) fail("artifact index is required");
  const canonical = new Map();
  for (const item of index.artifacts) {
    for (const field of ["id", "path", "purpose", "status", "sha256", "sourceManifest"]) text(item[field], `artifact.${field}`);
    if (!["accepted", "rejected", "history"].includes(item.status)) fail("artifact status is invalid");
    if (typeof item.canonical !== "boolean") fail("artifact canonical flag is required");
    if (item.canonical && item.status !== "accepted") fail("only accepted artifacts may be canonical");
    if (item.canonical && canonical.has(item.purpose)) fail(`multiple canonical artifacts for ${item.purpose}`);
    if (item.canonical) canonical.set(item.purpose, item.id);
    if (!item.canonical && item.status === "accepted") text(item.supersededBy, `artifact.${item.id}.supersededBy`);
  }
  return { ...index, resolve(purpose) { const id = canonical.get(purpose); if (!id) fail(`no canonical artifact for ${purpose}`); return index.artifacts.find((item) => item.id === id); } };
}

export function validateBuildHandoff(handoff) {
  if (handoff?.schemaVersion !== 1 || handoff.gate !== "G4") fail("G4 build handoff schemaVersion 1 is required");
  for (const field of ["canonicalRoot", "targetType", "scaffoldProvenance", "dependencyReadiness", "designSystem", "designSystemVersion", "productPath", "frameworkPath", "owner", "timestamp", "evidenceHash"]) text(handoff[field], `handoff.${field}`);
  pathEvidence(handoff.canonicalRoot, "handoff.canonicalRoot");
  if (!Array.isArray(handoff.gates) || !["G1", "G2", "G3"].every((gate) => handoff.gates.some((item) => item.gate === gate && item.status === "pass"))) fail("G1/G2/G3 must pass before G4 handoff");
  if (handoff.targetType === "durable-servier" && (handoff.designSystem.toLowerCase() === "none" || handoff.dependencyReadiness !== "ready")) fail("durable Servier handoff requires a ready, versioned design system");
  return handoff;
}
