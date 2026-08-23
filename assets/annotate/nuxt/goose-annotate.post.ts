// Dev-only Product Design annotation intake for Nuxt (Nitro server route).
import { mkdir, open, readdir } from "node:fs/promises";
import path from "node:path";

const MAX_BODY_BYTES = 64 * 1024;
const MAX_INBOX_FILES = 500;

export default defineEventHandler(async (event) => {
  const fail = (status: number, error: string) => { setResponseStatus(event, status); return { ok: false, error }; };
  if (process.env.NODE_ENV !== "development") return fail(503, "Annotation intake is dev-only");
  const host = getRequestHeader(event, "host") || "";
  const site = getRequestHeader(event, "sec-fetch-site");
  const origin = getRequestHeader(event, "origin");
  let sameOrigin = !site || site === "same-origin" || site === "none";
  if (origin) { try { sameOrigin = sameOrigin && new URL(origin).host === host; } catch { sameOrigin = false; } }
  if (!sameOrigin) return fail(403, "Cross-origin annotation request rejected");
  if (getRequestHeader(event, "content-type")?.split(";", 1)[0].trim().toLowerCase() !== "application/json")
    return fail(415, "Content-Type must be application/json");
  const declared = getRequestHeader(event, "content-length");
  if (declared !== undefined && (!/^\d+$/.test(declared) || Number(declared) > MAX_BODY_BYTES))
    return fail(/^\d+$/.test(declared) ? 413 : 400, /^\d+$/.test(declared) ? "Payload too large" : "Invalid Content-Length");
  const chunks: Buffer[] = [];
  let size = 0;
  try {
    for await (const raw of event.node.req) {
      const chunk = Buffer.isBuffer(raw) ? raw : Buffer.from(raw);
      size += chunk.byteLength;
      if (size > MAX_BODY_BYTES) return fail(413, "Payload too large");
      chunks.push(chunk);
    }
  } catch { return fail(400, "Invalid request body"); }
  let record: Record<string, unknown>;
  try {
    const value: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks)));
    if (value === null || typeof value !== "object" || Array.isArray(value)) return fail(400, "Invalid JSON object");
    record = value as Record<string, unknown>;
  } catch { return fail(400, "Invalid JSON object"); }
  const inboxDir = path.join(process.cwd(), ".goose", "annotations", "inbox");
  await mkdir(inboxDir, { recursive: true });
  if ((await readdir(inboxDir)).filter((name) => name.endsWith(".json")).length >= MAX_INBOX_FILES)
    return fail(429, "Annotation inbox is full");
  record.receivedAt = new Date().toISOString();
  const filename = Date.now() + "-" + Math.random().toString(36).slice(2, 10) + ".json";
  const file = await open(path.join(inboxDir, filename), "wx");
  try { await file.writeFile(JSON.stringify(record, null, 2), "utf8"); } finally { await file.close(); }
  return { ok: true, filename };
});
