// Entrypoint: wires the real JSON-file store and a real Anthropic client
// (if ANTHROPIC_API_KEY is set), then starts the HTTP server.

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { createStore } from "./store.js";
import { createAgent } from "./agent.js";
import { buildApp } from "./app.js";

const here = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(here, "..", "data", "db.json");
const PORT = process.env.PORT || 3000;

const store = createStore({ path: DB_PATH });

let client = null;
if (process.env.ANTHROPIC_API_KEY) {
  client = new Anthropic();
} else {
  console.warn("[personal-agent] ANTHROPIC_API_KEY not set — chat disabled; capture uses keyword fallback.");
}

const agent = createAgent({ client, store });
const app = buildApp({ store, agent });

app.listen(PORT, () => {
  console.log(`[personal-agent] listening on http://localhost:${PORT}`);
  console.log(`[personal-agent] glance: http://localhost:${PORT}/api/glance`);
});
