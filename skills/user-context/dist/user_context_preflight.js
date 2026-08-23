#!/usr/bin/env node
// Read local Product Design context and print compact JSON.
import { existsSync, statSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { homedir } from "node:os";
import { createHash } from "node:crypto";
import { parseArgs } from "node:util";
const PLUGIN_STATE_DIR = join(".local", "state", "product-design");
const DEFAULT_MAX_CONTEXT_BYTES = 2_000_000;
function resolveStateDir(gooseHome, stateDir) {
    if (stateDir !== undefined) {
        return resolve(stateDir.replace(/^~(?=$|\/)/, homedir()));
    }
    const home = gooseHome ?? process.env.GOOSE_HOME ?? "~/.config/goose";
    const expandedHome = home.replace(/^~(?=$|\/)/, homedir());
    return resolve(join(expandedHome, PLUGIN_STATE_DIR));
}
function fileMtime(path) {
    try {
        return new Date(statSync(path).mtimeMs).toISOString();
    }
    catch {
        return null;
    }
}
function sha256Text(text) {
    return createHash("sha256").update(text, "utf-8").digest("hex");
}
function parseResourceName(line) {
    const linkMatch = /^\[(.+?)\]\((.+?)\)\s*$/.exec(line);
    if (linkMatch) {
        return { name: linkMatch[1].trim(), url: linkMatch[2].trim() };
    }
    const urlMatch = /^(https?:\/\/\S+)\s*$/.exec(line);
    if (urlMatch) {
        return { name: urlMatch[1].trim(), url: urlMatch[1].trim() };
    }
    return { name: line.trim() };
}
function summarizeUserContext(markdown) {
    const entries = [];
    const unresolvedCategories = [];
    let category = null;
    let inSavedContext = false;
    let currentEntry = null;
    function flushEntry() {
        if (currentEntry) {
            entries.push(currentEntry);
            currentEntry = null;
        }
    }
    for (const rawLine of markdown.split("\n")) {
        const line = rawLine.trim();
        if (!line || line.startsWith("<!--") || line.startsWith("-->")) {
            continue;
        }
        const categoryMatch = /^# ([^#].*?)\s*$/.exec(line);
        if (categoryMatch) {
            flushEntry();
            category = categoryMatch[1].trim();
            inSavedContext = false;
            continue;
        }
        if (line === "## Saved Links And Context") {
            flushEntry();
            inSavedContext = true;
            continue;
        }
        if (!category || !inSavedContext) {
            continue;
        }
        const lowered = line.toLowerCase();
        if (lowered === "status: not provided" || lowered === "status: not provided.") {
            flushEntry();
            unresolvedCategories.push(category);
            continue;
        }
        if (!line.startsWith("- ")) {
            flushEntry();
            currentEntry = { category, ...parseResourceName(line) };
            continue;
        }
        if (!currentEntry) {
            continue;
        }
        const bullet = line.slice(2).trim();
        const prefixes = [
            ["Date Added:", "date_added"],
            ["File:", "file"],
            ["Useful Context:", "useful_context"],
            ["Future Use:", "future_use"],
        ];
        let matched = false;
        for (const [prefix, key] of prefixes) {
            if (bullet.startsWith(prefix)) {
                currentEntry[key] = bullet.slice(prefix.length).trim().replace(/\.$/, "");
                matched = true;
                break;
            }
        }
        if (!matched) {
            if (!currentEntry.notes)
                currentEntry.notes = [];
            currentEntry.notes.push(bullet);
        }
    }
    flushEntry();
    return { entries, unresolved_categories: unresolvedCategories };
}
function missingPayload(stateDir, contextPath) {
    return {
        plugin: "product-design",
        state_dir: stateDir,
        user_context: {
            path: contextPath,
            exists: false,
            status: "missing",
            entries: [],
            unresolved_categories: [],
        },
    };
}
function main() {
    const { values } = parseArgs({
        args: process.argv.slice(2),
        options: {
            "goose-home": { type: "string" },
            "state-dir": { type: "string" },
            "max-context-bytes": { type: "string", default: String(DEFAULT_MAX_CONTEXT_BYTES) },
        },
    });
    const stateDir = resolveStateDir(values["goose-home"], values["state-dir"]);
    const contextPath = join(stateDir, "user-context.md");
    const maxContextBytes = Number(values["max-context-bytes"]);
    if (!existsSync(contextPath)) {
        console.log(JSON.stringify(missingPayload(stateDir, contextPath), null, 2));
        return 0;
    }
    const size = statSync(contextPath).size;
    if (size > maxContextBytes) {
        console.log(JSON.stringify({
            plugin: "product-design",
            state_dir: stateDir,
            user_context: {
                path: contextPath,
                exists: true,
                status: "too_large",
                size_bytes: size,
                max_context_bytes: maxContextBytes,
                entries: [],
                unresolved_categories: [],
            },
        }, null, 2));
        return 0;
    }
    const markdown = readFileSync(contextPath, "utf-8");
    const summary = summarizeUserContext(markdown);
    console.log(JSON.stringify({
        plugin: "product-design",
        state_dir: stateDir,
        user_context: {
            path: contextPath,
            exists: true,
            status: "present",
            sha256: sha256Text(markdown),
            modified_at: fileMtime(contextPath),
            ...summary,
        },
    }, null, 2));
    return 0;
}
process.exit(main());
