import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function loadWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  return (await import(workerUrl.href)).default;
}

async function request(path = "/") {
  const worker = await loadWorker();
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: path.startsWith("/api/") ? "image/png" : "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the public four-beat HH Goa arrival", async () => {
  const response = await request();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Signal on the Sand — HH Goa 2026<\/title>/i);
  assert.match(html, /FIND YOUR/);
  assert.match(html, /SHOW US/);
  assert.match(html, /DROP \/ TAP TO UPLOAD/);
  assert.match(html, /FIELD GUIDE/);
  assert.doesNotMatch(html, /Sign in with ChatGPT|Sign in required/i);
});

test("keeps photos local and ships the required output and sharing paths", async () => {
  const [page, css, scene, metadata, og] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/beach-scene.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/signal/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/og/route.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(page, /new FileReader\(\)/);
  assert.doesNotMatch(page, /FormData|XMLHttpRequest/);
  assert.match(page, /heic2any/);
  assert.match(page, /navigator\.canShare/);
  assert.match(page, /CONTACT BACK/);
  assert.match(page, /new URLSearchParams/);
  assert.match(page, /const footerBaseline = cardBottom - 28/);
  assert.match(metadata, /generateMetadata/);
  assert.match(metadata, /summary_large_image/);
  assert.match(og, /ImageResponse/);
  assert.match(css, /orientation: landscape/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(scene, /QRcode|QRCode/i);
  assert.match(scene, /alpha: true/);
});

test("creates a personalized image response for social crawlers", async () => {
  const response = await request("/api/og?n=Maya&c=Pixel%20Surfer&id=GOA-0042");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^image\/png/i);
  assert.ok((await response.arrayBuffer()).byteLength > 1000);
});
