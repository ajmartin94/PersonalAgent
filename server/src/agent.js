// The conversational agent: one Claude brain over all domains, via a manual
// tool-use loop. Also does fuzzy quick-capture classification.
//
// The Anthropic client is injected so tests can pass a fake (deterministic,
// no API key, no cost). With no client, chat() is unavailable but capture()
// still works via a keyword fallback.

import { toolDefs, dispatch, captureNote } from "./tools.js";

const MODEL = "claude-opus-4-8";
const MAX_STEPS = 6;

const SYSTEM_TEXT = `You are the shared household assistant for Andrew and his wife — one brain across four domains:
- Kitchen: recipes, meal plan, grocery list, dietary preferences.
- Home projects: lists, ideas, notes per project.
- News: a curated, finite feed.
- Finance: spending awareness, budgets, analysis. This domain is READ-AND-ADVISE — observe, analyze, and advise; the only change you may make is setting a budget. Never claim to move money.

Use the tools to read live data and take in-system actions. Prefer doing the obvious next step over asking. Be concise and glanceable — a sentence or two, not an essay. Everything is shared between both users.`;

const SYSTEM = [{ type: "text", text: SYSTEM_TEXT, cache_control: { type: "ephemeral" } }];

const CAPTURE_SCHEMA = {
  type: "object",
  properties: {
    domain: { type: "string", enum: ["kitchen", "projects", "news", "finance", "general"] },
    summary: { type: "string" },
  },
  required: ["domain", "summary"],
  additionalProperties: false,
};

// Deterministic fallback so capture works offline / in tests with no model.
const KEYWORDS = {
  kitchen: ["recipe", "dinner", "meal", "grocery", "cook", "eat", "food", "lunch"],
  projects: ["garage", "deck", "project", "build", "fix", "install", "buy", "order", "measure"],
  finance: ["budget", "spend", "spending", "money", "bill", "pay", "cost", "invest", "stock"],
  news: ["news", "headline", "article", "story"],
};

export function keywordDomain(text) {
  const t = text.toLowerCase();
  for (const [domain, words] of Object.entries(KEYWORDS)) {
    if (words.some((w) => t.includes(w))) return domain;
  }
  return "general";
}

export function createAgent({ client = null, store }) {
  if (!store) throw new Error("agent requires a store");

  async function chat(history) {
    if (!client) throw new Error("conversational agent unavailable: set ANTHROPIC_API_KEY");
    const messages = history.map((m) => ({ role: m.role, content: m.content }));
    const toolsUsed = [];

    for (let step = 0; step < MAX_STEPS; step += 1) {
      const resp = await client.messages.create({
        model: MODEL,
        max_tokens: 16000,
        system: SYSTEM,
        tools: toolDefs,
        messages,
      });
      messages.push({ role: "assistant", content: resp.content });

      if (resp.stop_reason !== "tool_use") {
        const reply = resp.content
          .filter((b) => b.type === "text")
          .map((b) => b.text)
          .join("");
        return { reply, messages, toolsUsed };
      }

      const toolResults = [];
      for (const block of resp.content) {
        if (block.type !== "tool_use") continue;
        toolsUsed.push(block.name);
        let result;
        let isError = false;
        try {
          result = dispatch(store, block.name, block.input || {});
        } catch (e) {
          result = { error: e.message };
          isError = true;
        }
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(result),
          is_error: isError,
        });
      }
      messages.push({ role: "user", content: toolResults });
    }

    return { reply: "(stopped after too many tool steps)", messages, toolsUsed };
  }

  // Fuzzy capture: classify to a domain (model if available, else keywords) and file it.
  async function capture(text) {
    if (!text || !text.trim()) throw new Error("capture text is required");
    let domain = keywordDomain(text);

    if (client) {
      try {
        const resp = await client.messages.create({
          model: MODEL,
          max_tokens: 256,
          system: "Classify the user's quick note into exactly one domain and give a one-line summary.",
          messages: [
            {
              role: "user",
              content: `Note: ${text}\nDomains: kitchen, projects, news, finance, general.`,
            },
          ],
          output_config: { format: { type: "json_schema", schema: CAPTURE_SCHEMA } },
        });
        const txt = resp.content
          .filter((b) => b.type === "text")
          .map((b) => b.text)
          .join("");
        const parsed = JSON.parse(txt);
        if (parsed && parsed.domain) domain = parsed.domain;
      } catch {
        // fall back to the keyword classification already in `domain`
      }
    }

    const note = captureNote(store, { text: text.trim(), domain });
    return { ...note, classifiedBy: client ? "model" : "keyword" };
  }

  return { chat, capture };
}
