#!/usr/bin/env node
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bootstrap = path.join(root, "scripts", "bootstrap-prototype.mjs");

const frameworks = {
  vite: ["package.json", "AGENTS.md", "index.html", "vite.config.mjs", "src/main.jsx"],
  nextjs: ["package.json", "AGENTS.md", "next.config.ts", "tsconfig.json", "src/app/page.tsx"],
  nuxt: ["package.json", "AGENTS.md", "nuxt.config.ts", "app/app.vue", "app/pages/index.vue"],
  astro: ["package.json", "AGENTS.md", "astro.config.mjs", "src/pages/index.astro", "src/layouts/Layout.astro"],
};

function runBootstrap(destination, framework) {
  return spawnSync(process.execPath, [bootstrap, "--root", destination, "--framework", framework], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, npm_config_offline: "true" },
  });
}

async function inTemporaryDirectory(callback) {
  const temporaryRoot = mkdtempSync(path.join(os.tmpdir(), "product-design-bootstrap-test-"));
  try {
    await callback(temporaryRoot);
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
    assert.equal(existsSync(temporaryRoot), false, "temporary directory was not removed: " + temporaryRoot);
  }
}

for (const [framework, expectedFiles] of Object.entries(frameworks)) {
  test("scaffolds the " + framework + " template without installing dependencies", async () => {
    await inTemporaryDirectory((temporaryRoot) => {
      const destination = path.join(temporaryRoot, "Sample " + framework + " App");
      const result = runBootstrap(destination, framework);

      assert.equal(result.status, 0, result.stderr || result.stdout);
      const output = JSON.parse(result.stdout);
      assert.deepEqual(output, { status: "created", root: destination, framework });

      const packageJson = JSON.parse(readFileSync(path.join(destination, "package.json"), "utf8"));
      assert.equal(packageJson.name, "sample-" + framework + "-app");
      assert.equal(packageJson.private, true);

      for (const relativePath of expectedFiles) {
        assert.equal(existsSync(path.join(destination, relativePath)), true, framework + " is missing " + relativePath);
      }
      assert.equal(existsSync(path.join(destination, ".npmrc")), true, framework + " is missing .npmrc");
      assert.equal(existsSync(path.join(destination, "node_modules")), false, framework + " unexpectedly installed dependencies");
      assert.equal(existsSync(path.join(destination, "package-lock.json")), false, framework + " unexpectedly created a lockfile");
    });
  });
}

test("refuses a non-empty destination without changing its contents", async () => {
  await inTemporaryDirectory((temporaryRoot) => {
    const destination = path.join(temporaryRoot, "occupied");
    const sentinel = path.join(destination, "keep.txt");
    mkdirSync(destination);
    writeFileSync(sentinel, "keep me\n", "utf8");

    const result = runBootstrap(destination, "vite");

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Destination exists and is not empty/);
    assert.equal(readFileSync(sentinel, "utf8"), "keep me\n");
    assert.equal(existsSync(path.join(destination, "package.json")), false);
  });
});

test("refuses an unknown framework without creating the destination", async () => {
  await inTemporaryDirectory((temporaryRoot) => {
    const destination = path.join(temporaryRoot, "unknown-framework");
    const result = runBootstrap(destination, "svelte");

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Unknown framework: svelte/);
    assert.equal(existsSync(destination), false);
  });
});
