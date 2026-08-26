#!/usr/bin/env node
import { cpSync, existsSync, mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { resolveAgentPluginsScript } from "./resolve-agent-plugins.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const temp = mkdtempSync(path.join(tmpdir(), "product-design-plugin-"));
const stage = path.join(temp, "product-design");
mkdirSync(stage);
const entries = ["plugin.json", "README.md", "LICENSE", "AGENTS.md", "assets", "docs", "references", "scripts", "skills", "templates", "tests", "package.json"];
for (const entry of entries) {
  const source = path.join(root, entry);
  if (existsSync(source)) cpSync(source, path.join(stage, entry), { recursive: true, filter: (p) => !p.includes("node_modules") && !p.includes("__pycache__") && !p.endsWith(".pyc") && !p.includes("/evaluations/") });
}

try {
  for (const [script, args] of [
    ["validate_agent_plugin_schema.js", [stage, "--format", "json"]],
    ["validate_goose_plugin.js", [stage]],
  ]) {
    const validator = resolveAgentPluginsScript("plugin-creator", script);
    const result = spawnSync(process.execPath, [validator, ...args], { stdio: "inherit" });
    if (result.error) throw result.error;
    if (result.signal) throw new Error(`Plugin validator terminated by ${result.signal}: ${validator}`);
    if (result.status !== 0) process.exitCode = result.status ?? 1;
  }
} finally {
  rmSync(temp, { recursive: true, force: true });
}
