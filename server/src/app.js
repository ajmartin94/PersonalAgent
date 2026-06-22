// Express app wiring the domains, glance, and agent behind a JSON API.
// buildApp is injectable (store + agent) so tests can drive it with a fake agent.

import express from "express";
import { buildGlance } from "./glance.js";
import * as kitchen from "./domains/kitchen.js";
import * as projects from "./domains/projects.js";
import * as news from "./domains/news.js";
import * as finance from "./domains/finance.js";

export function buildApp({ store, agent }) {
  const app = express();
  app.use(express.json());

  const ok = (res, data) => res.json(data);
  const fail = (res, e, code = 400) => res.status(code).json({ error: e.message || String(e) });

  app.get("/api/health", (_req, res) => ok(res, { status: "ok" }));

  // The widget's aggregated cards.
  app.get("/api/glance", (_req, res) => ok(res, buildGlance(store)));

  // Per-domain reads (the durable JSON contract reused by Stage 1).
  app.get("/api/kitchen/plan", (_req, res) => ok(res, { today: kitchen.todaysMeal(store), week: kitchen.getPlan(store) }));
  app.get("/api/kitchen/recipes", (_req, res) => ok(res, kitchen.listRecipes(store)));
  app.get("/api/kitchen/grocery", (_req, res) => ok(res, kitchen.groceryList(store)));
  app.get("/api/projects", (_req, res) => ok(res, projects.listProjects(store)));
  app.get("/api/news", (_req, res) => ok(res, news.feed(store)));
  app.get("/api/finance/summary", (_req, res) => ok(res, finance.budgetStatus(store)));
  app.get("/api/finance/unusual", (_req, res) => ok(res, finance.unusualTransactions(store)));

  // One-tap-ish writes.
  app.post("/api/kitchen/grocery/check", (req, res) => {
    try {
      const { name, checked = true } = req.body || {};
      ok(res, kitchen.checkGroceryItem(store, name, checked));
    } catch (e) {
      fail(res, e);
    }
  });
  app.post("/api/projects/item", (req, res) => {
    try {
      ok(res, projects.addItem(store, req.body || {}));
    } catch (e) {
      fail(res, e);
    }
  });
  app.post("/api/finance/budget", (req, res) => {
    try {
      ok(res, finance.setBudget(store, req.body || {}));
    } catch (e) {
      fail(res, e);
    }
  });

  // Conversational agent.
  app.post("/api/chat", async (req, res) => {
    const history = (req.body && req.body.messages) || [];
    if (!Array.isArray(history) || history.length === 0) {
      return fail(res, new Error("messages array is required"));
    }
    try {
      const result = await agent.chat(history);
      ok(res, { reply: result.reply, toolsUsed: result.toolsUsed });
    } catch (e) {
      // No API key configured → 503 (service needs config), not a client error.
      const code = /ANTHROPIC_API_KEY/.test(e.message) ? 503 : 500;
      fail(res, e, code);
    }
  });

  // Fuzzy quick capture.
  app.post("/api/capture", async (req, res) => {
    try {
      const text = req.body && req.body.text;
      ok(res, await agent.capture(text));
    } catch (e) {
      fail(res, e);
    }
  });

  return app;
}
