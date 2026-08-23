// Dev-only Vite middleware for the Product Design annotation overlay.
// configureServer is only invoked by the Vite development server.
import { mkdirSync, openSync, closeSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const MAX_BODY_BYTES = 64 * 1024;
const MAX_INBOX_FILES = 500;

function sendJson(res, status, value) {
  if (res.writableEnded) return;
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(value));
}

export function gooseAnnotatePlugin() {
  return { name: "goose-annotate", configureServer(server) {
    const root = server.config.root || process.cwd();
    const inboxDir = path.join(root, ".goose", "annotations", "inbox");
    server.middlewares.use("/__goose-annotate", (req, res) => {
      if (req.method !== "POST") return sendJson(res, 405, { ok: false, error: "Method Not Allowed" });
      const host = req.headers.host || "";
      const site = req.headers["sec-fetch-site"];
      const origin = req.headers.origin;
      let sameOrigin = !site || site === "same-origin" || site === "none";
      if (origin) { try { sameOrigin = sameOrigin && new URL(origin).host === host; } catch { sameOrigin = false; } }
      if (!sameOrigin) return sendJson(res, 403, { ok: false, error: "Cross-origin annotation request rejected" });
      if (req.headers["content-type"]?.split(";", 1)[0].trim().toLowerCase() !== "application/json")
        return sendJson(res, 415, { ok: false, error: "Content-Type must be application/json" });
      const declared = req.headers["content-length"];
      if (declared !== undefined && (!/^\d+$/.test(declared) || Number(declared) > MAX_BODY_BYTES)) {
        req.resume();
        return sendJson(res, /^\d+$/.test(declared) ? 413 : 400, { ok: false, error: /^\d+$/.test(declared) ? "Payload too large" : "Invalid Content-Length" });
      }
      const chunks = [];
      let size = 0;
      let rejected = false;
      req.on("data", (raw) => {
        if (rejected) return;
        const chunk = Buffer.isBuffer(raw) ? raw : Buffer.from(raw);
        size += chunk.byteLength;
        if (size > MAX_BODY_BYTES) {
          rejected = true;
          chunks.length = 0;
          sendJson(res, 413, { ok: false, error: "Payload too large" });
        } else chunks.push(chunk);
      });
      req.on("error", () => sendJson(res, 400, { ok: false, error: "Invalid request body" }));
      req.on("end", () => {
        if (rejected) return;
        let record;
        try {
          record = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks)));
          if (record === null || typeof record !== "object" || Array.isArray(record)) throw new Error();
        } catch { return sendJson(res, 400, { ok: false, error: "Invalid JSON object" }); }
        mkdirSync(inboxDir, { recursive: true });
        if (readdirSync(inboxDir).filter((name) => name.endsWith(".json")).length >= MAX_INBOX_FILES)
          return sendJson(res, 429, { ok: false, error: "Annotation inbox is full" });
        record.receivedAt = new Date().toISOString();
        const filename = Date.now() + "-" + Math.random().toString(36).slice(2, 10) + ".json";
        let fd;
        try { fd = openSync(path.join(inboxDir, filename), "wx"); writeFileSync(fd, JSON.stringify(record, null, 2), "utf8"); }
        finally { if (fd !== undefined) closeSync(fd); }
        return sendJson(res, 200, { ok: true, filename });
      });
    });
  }};
}
