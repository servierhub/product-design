// Dev-only Product Design annotation intake for Astro.
import { mkdir, open, readdir } from "node:fs/promises";
import path from "node:path";
import type { APIRoute } from "astro";

export const prerender = false;

const MAX_BODY_BYTES = 64 * 1024;
const MAX_INBOX_FILES = 500;

function fail(status: number, message: string) {
  return Response.json({ ok: false, error: message }, { status });
}

function isSameOrigin(request: Request) {
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") return false;
  const origin = request.headers.get("origin");
  if (!origin) return true; // CLI/non-browser clients need not send Origin.
  const host = request.headers.get("host") || new URL(request.url).host;
  try { return new URL(origin).host === host; } catch { return false; }
}

async function readJsonObject(request: Request) {
  const declared = request.headers.get("content-length");
  if (declared !== null && (!/^\d+$/.test(declared) || Number(declared) > MAX_BODY_BYTES))
    throw new Error(/^\d+$/.test(declared) ? "large" : "length");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("json");
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const part = await reader.read();
    if (part.done) break;
    size += part.value.byteLength;
    if (size > MAX_BODY_BYTES) { await reader.cancel(); throw new Error("large"); }
    chunks.push(part.value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  let value: unknown;
  try { value = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)); }
  catch { throw new Error("json"); }
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error("object");
  return value as Record<string, unknown>;
}

export const POST: APIRoute = async ({ request }) => {
  if (process.env.NODE_ENV !== "development") return fail(503, "Annotation intake is dev-only");
  if (!isSameOrigin(request)) return fail(403, "Cross-origin annotation request rejected");
  if (request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() !== "application/json")
    return fail(415, "Content-Type must be application/json");
  let record: Record<string, unknown>;
  try { record = await readJsonObject(request); }
  catch (cause) {
    const code = cause instanceof Error ? cause.message : "json";
    return fail(code === "large" ? 413 : 400, code === "large" ? "Payload too large" : "Invalid JSON object");
  }
  const inboxDir = path.join(process.cwd(), ".goose", "annotations", "inbox");
  await mkdir(inboxDir, { recursive: true });
  if ((await readdir(inboxDir)).filter((name) => name.endsWith(".json")).length >= MAX_INBOX_FILES)
    return fail(429, "Annotation inbox is full");
  record.receivedAt = new Date().toISOString();
  const filename = Date.now() + "-" + Math.random().toString(36).slice(2, 10) + ".json";
  const file = await open(path.join(inboxDir, filename), "wx");
  try { await file.writeFile(JSON.stringify(record, null, 2), "utf8"); } finally { await file.close(); }
  return Response.json({ ok: true, filename });
};
