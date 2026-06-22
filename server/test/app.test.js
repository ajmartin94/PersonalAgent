import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createStore } from "../src/store.js";
import { seedData } from "../src/seed.js";
import { createAgent } from "../src/agent.js";
import { buildApp } from "../src/app.js";

let server;
let base;

before(async () => {
  const store = createStore({ data: seedData() });
  // No model client → chat returns 503, capture uses keyword fallback. Deterministic.
  const agent = createAgent({ client: null, store });
  const app = buildApp({ store, agent });
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  base = `http://localhost:${server.address().port}`;
});

after(() => server && server.close());

const get = (p) => fetch(`${base}${p}`).then(async (r) => ({ status: r.status, body: await r.json() }));
const post = (p, body) =>
  fetch(`${base}${p}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }).then(async (r) => ({ status: r.status, body: await r.json() }));

test("GET /api/health", async () => {
  const { status, body } = await get("/api/health");
  assert.equal(status, 200);
  assert.equal(body.status, "ok");
});

test("GET /api/glance returns cards", async () => {
  const { status, body } = await get("/api/glance");
  assert.equal(status, 200);
  assert.ok(Array.isArray(body.cards) && body.cards.length >= 5);
});

test("GET per-domain endpoints respond", async () => {
  assert.equal((await get("/api/kitchen/plan")).status, 200);
  assert.equal((await get("/api/kitchen/grocery")).status, 200);
  assert.equal((await get("/api/projects")).status, 200);
  assert.equal((await get("/api/news")).status, 200);
  assert.equal((await get("/api/finance/summary")).status, 200);
});

test("POST /api/projects/item adds an item", async () => {
  const { status, body } = await post("/api/projects/item", { project: "Garage", text: "Sweep up" });
  assert.equal(status, 200);
  assert.equal(body.project, "Garage");
});

test("POST /api/finance/budget validates input", async () => {
  assert.equal((await post("/api/finance/budget", { category: "Dining", amount: 450 })).status, 200);
  assert.equal((await post("/api/finance/budget", { category: "Dining", amount: -1 })).status, 400);
});

test("POST /api/capture files a note (keyword fallback)", async () => {
  const { status, body } = await post("/api/capture", { text: "buy lumber for the deck" });
  assert.equal(status, 200);
  assert.equal(body.domain, "projects");
});

test("POST /api/chat without API key returns 503", async () => {
  const { status, body } = await post("/api/chat", { messages: [{ role: "user", content: "hi" }] });
  assert.equal(status, 503);
  assert.match(body.error, /ANTHROPIC_API_KEY/);
});

test("POST /api/chat with no messages is a 400", async () => {
  const { status } = await post("/api/chat", {});
  assert.equal(status, 400);
});
