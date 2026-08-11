import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the public HH Goa signal experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Signal on the Sand — HH Goa 2026<\/title>/i);
  assert.match(html, /LESS NOISE\./);
  assert.match(html, /MAKE YOUR/);
  assert.match(html, /WHO JUST LANDED\?/);
  assert.match(html, /DROP A FACE/);
  assert.match(html, /CLAIM THE SIGNAL/);
  assert.doesNotMatch(html, /Sign in with ChatGPT|Sign in required/i);
});

test("keeps photos local and ships responsive interaction rules", async () => {
  const [page, css, scene] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/beach-scene.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(page, /new FileReader\(\)/);
  assert.doesNotMatch(page, /fetch\(|XMLHttpRequest|FormData/);
  assert.match(page, /stays on your device/i);
  assert.match(page, /48 HOURS\. ZERO ADULT SUPERVISION/);
  assert.match(css, /@media \(max-width: 620px\)/);
  assert.match(css, /@media \(max-height: 720px\) and \(min-width: 650px\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(scene, /alpha: true/);
  assert.match(scene, /onClick=.*setFlipped/s);
});
