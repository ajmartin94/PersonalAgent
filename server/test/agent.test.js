import { test } from "node:test";
import assert from "node:assert/strict";
import { createStore } from "../src/store.js";
import { seedData } from "../src/seed.js";
import { createAgent, keywordDomain } from "../src/agent.js";

const fresh = () => createStore({ data: seedData() });

// A scripted fake of the Anthropic client: returns queued responses in order.
function fakeClient(responses) {
  let i = 0;
  const calls = [];
  return {
    calls,
    messages: {
      create: async (params) => {
        calls.push(params);
        return responses[Math.min(i++, responses.length - 1)];
      },
    },
  };
}

test("agent.chat runs the tool-use loop and returns the final text", async () => {
  const store = fresh();
  const client = fakeClient([
    {
      stop_reason: "tool_use",
      content: [{ type: "tool_use", id: "tu1", name: "finance_spending", input: {} }],
    },
    {
      stop_reason: "end_turn",
      content: [{ type: "text", text: "You've spent $508 on groceries this month." }],
    },
  ]);
  const agent = createAgent({ client, store });
  const result = await agent.chat([{ role: "user", content: "how's grocery spending?" }]);

  assert.match(result.reply, /spent/);
  assert.deepEqual(result.toolsUsed, ["finance_spending"]);
  // Second model call must include the tool_result we fed back.
  const secondCall = client.calls[1];
  const toolResultTurn = secondCall.messages.find(
    (m) => Array.isArray(m.content) && m.content.some((b) => b.type === "tool_result"),
  );
  assert.ok(toolResultTurn, "tool_result was sent back to the model");
});

test("agent.chat surfaces tool errors as tool_result is_error", async () => {
  const store = fresh();
  const client = fakeClient([
    {
      stop_reason: "tool_use",
      content: [{ type: "tool_use", id: "tu1", name: "finance_set_budget", input: { category: "X", amount: -1 } }],
    },
    { stop_reason: "end_turn", content: [{ type: "text", text: "That budget is invalid." }] },
  ]);
  const agent = createAgent({ client, store });
  await agent.chat([{ role: "user", content: "set X budget to -1" }]);
  const toolResult = client.calls[1].messages
    .flatMap((m) => (Array.isArray(m.content) ? m.content : []))
    .find((b) => b.type === "tool_result");
  assert.equal(toolResult.is_error, true);
});

test("agent.chat without a client is unavailable", async () => {
  const agent = createAgent({ client: null, store: fresh() });
  await assert.rejects(() => agent.chat([{ role: "user", content: "hi" }]), /ANTHROPIC_API_KEY/);
});

test("agent.capture uses keyword fallback with no client", async () => {
  const store = fresh();
  const agent = createAgent({ client: null, store });
  const note = await agent.capture("order brackets for the garage shelf");
  assert.equal(note.domain, "projects");
  assert.equal(note.classifiedBy, "keyword");
  assert.equal(store.data.captures.length, 1);
});

test("agent.capture uses the model's classification when available", async () => {
  const store = fresh();
  const client = fakeClient([
    { stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify({ domain: "finance", summary: "budget note" }) }] },
  ]);
  const agent = createAgent({ client, store });
  const note = await agent.capture("keep an eye on the dining budget");
  assert.equal(note.domain, "finance");
  assert.equal(note.classifiedBy, "model");
});

test("keywordDomain maps obvious notes", () => {
  assert.equal(keywordDomain("save this pasta recipe"), "kitchen");
  assert.equal(keywordDomain("random thought"), "general");
});
