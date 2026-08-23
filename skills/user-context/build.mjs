#!/usr/bin/env node
import { chmodSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, "dist");
const tsc = join(root, "node_modules", ".bin", process.platform === "win32" ? "tsc.cmd" : "tsc");

rmSync(dist, { recursive: true, force: true });
const result = spawnSync(tsc, ["-p", join(root, "tsconfig.json")], { stdio: "inherit" });
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

for (const file of readdirSync(dist)) {
  if (file.endsWith(".js")) chmodSync(join(dist, file), 0o755);
}
