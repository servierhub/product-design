#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const ok = (condition, message) => {
  if (!condition) failures.push(message);
};
const read = (relative) => readFileSync(path.join(root, relative), "utf8");

const ideate = read("skills/ideate/SKILL.md");
const index = read("skills/index/SKILL.md");
const build = read("skills/image-to-code/SKILL.md");
const qa = read("skills/design-qa/SKILL.md");
const gates = read("references/product-decision-gates.md");
const main = read("templates/prototype/src/main.jsx");
const vite = read("templates/prototype/vite.config.mjs");

ok(ideate.includes("Run up to three isolated variant workers concurrently"), "ideate must parallelize independent variants when possible");
ok(ideate.includes("generate screens strictly sequentially"), "ideate must preserve sequential screen generation inside each variant");
ok(ideate.includes("distinct output directory"), "ideate parallel workers must use isolated output directories");
ok(ideate.includes("deterministic V1, V2, V3 order"), "ideate must preserve deterministic variant ordering");
ok(ideate.includes("Define exactly three candidate journeys"), "ideate must define complete candidate journeys");
ok(ideate.includes("Every Image Gen call produces exactly one full-size screen image"), "ideate must generate one full-size image per screen");
ok(ideate.includes("one separate board page per variant"), "ideate must create one board page per variant");
ok(ideate.includes("Reject a page if images are cropped"), "ideate must repair invalid board-page layouts");
ok(ideate.includes("Never ask Image Gen to divide one canvas into several screens"), "ideate must prohibit multi-screen image composites");
ok(ideate.includes("screen-set-approved"), "ideate must require screen-set approval");
ok(ideate.includes("1024 x 768"), "ideate must define a supported landscape fallback");
ok(ideate.includes("relative image references"), "ideate HTML pages must use resolvable relative image references");
ok(!/1280 x 1024.*default|1536 x 1024.*default/.test(ideate), "ideate contains unsupported legacy default");
ok(index.includes("Never generate a multi-screen composite image"), "router must prohibit composite journey images");
ok(index.includes("Never interpret journey selection as permission to build"), "router must block premature build");
ok(build.includes("selected board page alone is not sufficient"), "image-to-code must reject board-page-only input");
ok(build.includes("every required screen"), "image-to-code must resolve complete screen set");
ok(qa.includes("each implemented state"), "design QA must compare each screen source");
ok(gates.includes("Multi-screen Image Gen composites"), "G2 must fail multi-screen composite outputs");
ok(gates.includes("board page or screenshot alone cannot pass G3"), "G3 must require individual screen sources");
ok(main.includes("lazy(") && !main.includes("await import"), "Vite template must avoid top-level await");
ok(vite.includes("strictPort: true"), "Vite template must use strict port");

const evalFiles = [];
function walk(directory) {
  for (const name of readdirSync(directory)) {
    const candidate = path.join(directory, name);
    if (statSync(candidate).isDirectory()) walk(candidate);
    else if (name === "evals.json") evalFiles.push(candidate);
  }
}
walk(path.join(root, "skills"));
evalFiles.push(path.join(root, "tests/evals/plugin-integration.json"));
let evalCases = 0;
for (const file of evalFiles) {
  const document = JSON.parse(readFileSync(file, "utf8"));
  ok(Array.isArray(document.evals) && document.evals.length >= 3, `${file} needs at least 3 evals`);
  for (const item of document.evals ?? []) {
    evalCases += 1;
    ok(item.id !== undefined && item.name && item.prompt && (item.expected_output || item.expected_sequence), `${file} has an incomplete eval`);
  }
}

if (failures.length) {
  console.error(failures.map((message) => `FAIL: ${message}`).join("\n"));
  process.exit(1);
}
console.log(JSON.stringify({ status: "passed", contractChecks: 22, evalFiles: evalFiles.length, evalCases }, null, 2));
