#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cwd = mkdtempSync(path.join(tmpdir(), "product-design-npm-prefix-"));
function checked(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", ...options });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, [command, ...args, result.stdout, result.stderr].filter(Boolean).join("\n"));
  return result;
}
try {
  const missing = spawnSync(path.join(cwd, "definitely-missing-executable"), [], { encoding: "utf8" });
  assert.ok(missing.error, "a missing subprocess executable must surface as result.error");
  const npm = process.env.npm_execpath;
  assert.ok(npm, "npm_execpath is required when this check runs through npm");
  const result = checked(process.execPath, [npm, "--prefix", root, "run", "test:ideation-contract"], { cwd });
  assert.match(result.stdout, /(?:#|ℹ)\s+pass\s+\d+/u);
  assert.match(result.stdout, /(?:#|ℹ)\s+fail\s+0/u);
  const brokenDependency = spawnSync(process.execPath, [npm, "--prefix", root, "run", "validate:skills"], {
    cwd, encoding: "utf8", env: { ...process.env, HOME: cwd, AGENT_PLUGINS_ROOT: path.join(cwd, "missing-agent-plugins") },
  });
  if (brokenDependency.error) throw brokenDependency.error;
  assert.notEqual(brokenDependency.status, 0, "a missing validator dependency must fail the npm command");
  assert.match(brokenDependency.stderr, /Unable to find agent-plugins/);
  console.log("npm entrypoints: --prefix and subprocess failure checks passed");
} finally { rmSync(cwd, { recursive: true, force: true }); }
