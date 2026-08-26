#!/usr/bin/env node
import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { resolveAgentPluginsScript } from "./resolve-agent-plugins.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const validator = resolveAgentPluginsScript("skill-creator", "quick_validate.js");
const skillsRoot = path.join(root, "skills");
const skills = readdirSync(skillsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

for (const skill of skills) {
  const result = spawnSync(process.execPath, [validator, path.join(skillsRoot, skill)], { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.signal) throw new Error(`Skill validator terminated by ${result.signal}: ${validator}`);
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log(JSON.stringify({ status: "passed", skills }));
