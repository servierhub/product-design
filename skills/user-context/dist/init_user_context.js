#!/usr/bin/env node
// Create the local Product Design context file.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve, relative } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
const HERE = dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = resolve(HERE, "..");
const TEMPLATE_PATH = join(SKILL_ROOT, "plugin-author-config", "user-context-template.md");
const PLUGIN_STATE_DIR = join(".local", "state", "product-design");
const CONTEXT_NOTE = `<!--
Product Design context. This file is user-editable.
Unresolved \`status: not provided\` entries are setup prompts, not saved facts.
Saved references should include Date Added, Useful Context, and Future Use when available.
-->

`;
function resolveStateDir(gooseHome, stateDir) {
    if (stateDir !== undefined) {
        return resolve(stateDir.replace(/^~(?=$|\/)/, homedir()));
    }
    const home = gooseHome ?? process.env.GOOSE_HOME ?? "~/.config/goose";
    const expandedHome = home.replace(/^~(?=$|\/)/, homedir());
    return resolve(join(expandedHome, PLUGIN_STATE_DIR));
}
function main() {
    const { values } = parseArgs({
        args: process.argv.slice(2),
        options: {
            "goose-home": { type: "string" },
            "state-dir": { type: "string" },
            overwrite: { type: "boolean", default: false },
        },
    });
    const stateDir = resolveStateDir(values["goose-home"], values["state-dir"]);
    const contextPath = join(stateDir, "user-context.md");
    if (!existsSync(TEMPLATE_PATH)) {
        console.error("Missing Product Design context template.");
        console.error(`- ${relative(SKILL_ROOT, TEMPLATE_PATH)}`);
        return 1;
    }
    mkdirSync(stateDir, { recursive: true });
    mkdirSync(join(stateDir, "assets"), { recursive: true });
    const existed = existsSync(contextPath);
    let result;
    if (existed && !values.overwrite) {
        result = "preserved";
    }
    else {
        const template = readFileSync(TEMPLATE_PATH, "utf-8");
        writeFileSync(contextPath, CONTEXT_NOTE + template, "utf-8");
        result = existed ? "overwritten" : "created";
    }
    console.log(`Product Design state directory: ${stateDir}`);
    console.log(`user-context.md: ${result}`);
    return 0;
}
process.exit(main());
