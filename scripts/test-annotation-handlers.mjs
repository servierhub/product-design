#!/usr/bin/env node
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { mkdtemp, mkdir, writeFile, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { stripTypeScriptTypes } from "node:module";
import { gooseAnnotatePlugin } from "../assets/annotate/vite/vite-annotate-plugin.mjs";

async function importTypeScript(file, replacements = []) {
  let source = await readFile(file, "utf8");
  for (const [from, to] of replacements) source = source.replace(from, to);
  source = stripTypeScriptTypes(source, { mode: "transform" });
  return import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));
}

const projectRoot = process.cwd();
const root = await mkdtemp(path.join(tmpdir(), "annotation-handlers-"));
const initialNodeEnv = process.env.NODE_ENV;
process.env.NODE_ENV = "development";
let handler;
gooseAnnotatePlugin().configureServer({
  config: { root },
  middlewares: { use(route, fn) { assert.equal(route, "/__goose-annotate"); handler = fn; } },
});

async function request({ method = "POST", headers = {}, chunks = [] } = {}) {
  const req = new EventEmitter();
  req.method = method;
  req.headers = { host: "localhost:5173", "content-type": "application/json", ...headers };
  req.resume = () => {};
  let resolve;
  const done = new Promise((r) => { resolve = r; });
  const responseHeaders = {};
  const res = {
    statusCode: 0, writableEnded: false,
    setHeader(name, value) { responseHeaders[name.toLowerCase()] = value; },
    end(body = "") { if (this.writableEnded) return; this.writableEnded = true; resolve({ status: this.statusCode, headers: responseHeaders, body: JSON.parse(body) }); },
  };
  handler(req, res);
  for (const chunk of chunks) req.emit("data", Buffer.from(chunk));
  req.emit("end");
  return done;
}

try {
  let result = await request({ chunks: ['{"note":"ok"}'] });
  assert.equal(result.status, 200);
  assert.match(result.headers["content-type"], /^application\/json/);

  result = await request({ headers: { "content-type": "text/plain" }, chunks: ["{}"] });
  assert.equal(result.status, 415);
  result = await request({ headers: { origin: "http://evil.test", "sec-fetch-site": "cross-site" }, chunks: ["{}"] });
  assert.equal(result.status, 403);
  result = await request({ headers: { origin: "http://localhost:5173", "sec-fetch-site": "same-origin" }, chunks: ["[]"] });
  assert.equal(result.status, 400);
  result = await request({ chunks: ["not json"] });
  assert.equal(result.status, 400);
  result = await request({ headers: { "content-length": "65537" } });
  assert.equal(result.status, 413);

  // No Content-Length: enforce actual byte count across chunks (including multibyte UTF-8).
  result = await request({ chunks: ['{"x":"', "é".repeat(32765), '"}'] });
  assert.equal(result.status, 413);
  assert.equal(result.body.error, "Payload too large");

  // Exercise the framework handlers without installing their frameworks: Node strips
  // TypeScript and tiny framework adapters supply only the APIs used by each route.
  process.chdir(root);
  const next = await importTypeScript(path.join(projectRoot, "assets/annotate/nextjs/route.ts"), [[
    'import { NextRequest, NextResponse } from "next/server";',
    'const NextResponse = { json(value, init = {}) { return Response.json(value, init); } };',
  ]]);
  const astro = await importTypeScript(path.join(projectRoot, "assets/annotate/astro/goose-annotate.ts"));
  globalThis.defineEventHandler = (fn) => fn;
  globalThis.setResponseStatus = (event, status) => { event.status = status; };
  globalThis.getRequestHeader = (event, name) => event.headers[name];
  const nuxt = await importTypeScript(path.join(projectRoot, "assets/annotate/nuxt/goose-annotate.post.ts"));

  const webRequest = (body, headers = {}) => new Request("http://localhost:3000/api/goose-annotate", {
    method: "POST", headers: { host: "localhost:3000", "content-type": "application/json", ...headers }, body,
  });
  const frameworkPosts = [
    ["next", next.POST],
    ["astro", (args) => astro.POST({ request: args })],
    ["nuxt", async (request) => {
      const headers = Object.fromEntries(request.headers);
      const event = { headers, status: 200, node: { req: Readable.from([Buffer.from(await request.text())]) } };
      const body = await nuxt.default(event);
      return Response.json(body, { status: event.status });
    }],
  ];
  for (const [framework, post] of frameworkPosts) {
    let response = await post(webRequest('{"framework":true}'));
    assert.equal(response.status, 200, framework + " should accept a valid development annotation");
    response = await post(webRequest("[]"));
    assert.equal(response.status, 400);
    response = await post(webRequest("{}", { "content-type": "text/plain" }));
    assert.equal(response.status, 415);
    response = await post(webRequest("{}", { origin: "http://evil.test", "sec-fetch-site": "cross-site" }));
    assert.equal(response.status, 403);
    response = await post(webRequest(JSON.stringify({ x: "é".repeat(32765) })));
    assert.equal(response.status, 413);
  }
  process.env.NODE_ENV = "production";
  assert.equal((await next.POST(webRequest("{}"))).status, 503);
  assert.equal((await astro.POST({ request: webRequest("{}") })).status, 503);
  process.env.NODE_ENV = "development";

  const inbox = path.join(root, ".goose", "annotations", "inbox");
  await mkdir(inbox, { recursive: true });
  await Promise.all(Array.from({ length: 499 }, (_, i) => writeFile(path.join(inbox, "quota-" + i + ".json"), "{}")));
  result = await request({ chunks: ["{}"] });
  assert.equal(result.status, 429);

  process.chdir(projectRoot);
  const copies = [
    ["assets/annotate/nextjs/route.ts", "templates/nextjs/src/app/api/goose-annotate/route.ts"],
    ["assets/annotate/nuxt/goose-annotate.post.ts", "templates/nuxt/server/api/goose-annotate.post.ts"],
    ["assets/annotate/astro/goose-annotate.ts", "templates/astro/src/pages/api/goose-annotate.ts"],
    ["assets/annotate/vite/vite-annotate-plugin.mjs", "templates/prototype/vite-annotate-plugin.mjs"],
  ];
  for (const [asset, template] of copies) {
    const [a, b] = await Promise.all([readFile(path.join(projectRoot, asset), "utf8"), readFile(path.join(projectRoot, template), "utf8")]);
    assert.equal(a, b, asset + " drifted from " + template);
    assert.match(a, /MAX_BODY_BYTES = 64 \* 1024/);
    assert.match(a, /MAX_INBOX_FILES = 500/);
    assert.match(a, /application\/json/);
    assert.match(a, /same-origin/);
  }
  for (const file of copies.slice(0, 3).map(([asset]) => asset)) {
    assert.match(await readFile(path.join(projectRoot, file), "utf8"), /NODE_ENV !== "development"/);
  }
  console.log("annotation handlers: all deterministic checks passed");
} finally {
  process.chdir(projectRoot);
  if (initialNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = initialNodeEnv;
  await rm(root, { recursive: true, force: true });
}
