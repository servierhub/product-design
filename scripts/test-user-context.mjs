#!/usr/bin/env node
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILL_ROOT = join(REPO_ROOT, "skills", "user-context");
const DIST = join(SKILL_ROOT, "dist");
const INIT = join(DIST, "init_user_context.js");
const PREFLIGHT = join(DIST, "user_context_preflight.js");
const GENERATED_FILES = ["init_user_context.js", "user_context_preflight.js"];
const workspace = mkdtempSync(join(tmpdir(), "product-design-user-context-"));

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: REPO_ROOT,
    encoding: "utf8",
    ...options,
  });
  if (result.error) throw result.error;
  assert.equal(
    result.status,
    0,
    [command, ...args, result.stdout, result.stderr].filter(Boolean).join("\n")
  );
  return result;
}

function runJson(script, args) {
  return JSON.parse(run(process.execPath, [script, ...args]).stdout);
}

try {
  // Packaging contract: emitted entry points are present, runnable, and not ignored by Git.
  for (const file of GENERATED_FILES) {
    const path = join(DIST, file);
    assert.equal(existsSync(path), true, `missing packaged artifact: dist/${file}`);
    assert.match(readFileSync(path, "utf8"), /^#!\/usr\/bin\/env node\n/);
    if (process.platform !== "win32") {
      assert.notEqual(statSync(path).mode & 0o111, 0, `dist/${file} is not executable`);
    }
    const ignored = spawnSync("git", ["check-ignore", "--quiet", path], { cwd: REPO_ROOT });
    assert.equal(ignored.status, 1, `dist/${file} must not be ignored by Git`);
  }

  // Reproducibility contract: clean TypeScript emission is byte-for-byte identical.
  const generated = join(workspace, "generated");
  const tsc = join(SKILL_ROOT, "node_modules", ".bin", process.platform === "win32" ? "tsc.cmd" : "tsc");
  assert.equal(existsSync(tsc), true, "run npm ci in skills/user-context before this test");
  run(tsc, ["-p", join(SKILL_ROOT, "tsconfig.json"), "--outDir", generated], { cwd: SKILL_ROOT });
  for (const file of GENERATED_FILES) {
    assert.equal(
      readFileSync(join(generated, file), "utf8"),
      readFileSync(join(DIST, file), "utf8"),
      `dist/${file} does not match its TypeScript source`
    );
  }

  // Init behavior: create, preserve, then overwrite from the bundled template.
  const stateDir = join(workspace, "state");
  let result = run(process.execPath, [INIT, "--state-dir", stateDir]);
  assert.match(result.stdout, /user-context\.md: created/);
  const contextPath = join(stateDir, "user-context.md");
  assert.equal(existsSync(join(stateDir, "assets")), true);
  assert.match(readFileSync(contextPath, "utf8"), /^<!--\nProduct Design context\./);
  writeFileSync(contextPath, "keep me\n", "utf8");
  result = run(process.execPath, [INIT, "--state-dir", stateDir]);
  assert.match(result.stdout, /user-context\.md: preserved/);
  assert.equal(readFileSync(contextPath, "utf8"), "keep me\n");
  result = run(process.execPath, [INIT, "--state-dir", stateDir, "--overwrite"]);
  assert.match(result.stdout, /user-context\.md: overwritten/);
  assert.notEqual(readFileSync(contextPath, "utf8"), "keep me\n");

  // Preflight behavior: missing, parsed content, and size guard.
  const missingDir = join(workspace, "missing");
  const missing = runJson(PREFLIGHT, ["--state-dir", missingDir]);
  assert.deepEqual(missing.user_context, {
    path: join(missingDir, "user-context.md"),
    exists: false,
    status: "missing",
    entries: [],
    unresolved_categories: [],
  });

  const markdown = `# Product URLs

## Saved Links And Context

[Dashboard](https://example.test/dashboard)
- Date Added: 2026-08-24.
- Useful Context: Primary product surface.
- Future Use: Ground dashboard work.

# Figma Sources

## Saved Links And Context

status: not provided
`;
  writeFileSync(contextPath, markdown, "utf8");
  const present = runJson(PREFLIGHT, ["--state-dir", stateDir]);
  assert.equal(present.user_context.status, "present");
  assert.equal(present.user_context.sha256, createHash("sha256").update(markdown).digest("hex"));
  assert.deepEqual(present.user_context.entries, [{
    category: "Product URLs",
    name: "Dashboard",
    url: "https://example.test/dashboard",
    date_added: "2026-08-24",
    useful_context: "Primary product surface",
    future_use: "Ground dashboard work",
  }]);
  assert.deepEqual(present.user_context.unresolved_categories, ["Figma Sources"]);
  assert.match(present.user_context.modified_at, /^\d{4}-\d{2}-\d{2}T/);

  const tooLarge = runJson(PREFLIGHT, ["--state-dir", stateDir, "--max-context-bytes", "1"]);
  assert.equal(tooLarge.user_context.status, "too_large");
  assert.equal(tooLarge.user_context.max_context_bytes, 1);
  assert.deepEqual(tooLarge.user_context.entries, []);

  console.log("user-context packaging and behavior tests: ok");
} finally {
  rmSync(workspace, { recursive: true, force: true });
}
