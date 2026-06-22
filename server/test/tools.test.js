import { test } from "node:test";
import assert from "node:assert/strict";
import { createStore } from "../src/store.js";
import { seedData } from "../src/seed.js";
import { toolDefs, dispatch } from "../src/tools.js";

const fresh = () => createStore({ data: seedData() });

test("tools: every tool def has a name and object schema", () => {
  for (const t of toolDefs) {
    assert.ok(t.name, "tool needs a name");
    assert.equal(t.input_schema.type, "object");
  }
});

test("tools: dispatch get_glance returns cards", () => {
  const store = fresh();
  const result = dispatch(store, "get_glance");
  assert.ok(Array.isArray(result.cards));
});

test("tools: dispatch projects_add_item mutates store", () => {
  const store = fresh();
  const result = dispatch(store, "projects_add_item", { project: "Garage", text: "Paint the floor" });
  assert.equal(result.project, "Garage");
  const garage = store.data.projects.find((p) => p.name === "Garage");
  assert.ok(garage.items.some((i) => i.text === "Paint the floor"));
});

test("tools: dispatch finance_spending is read-only analysis", () => {
  const store = fresh();
  const result = dispatch(store, "finance_spending", {});
  assert.ok(result.rows.length > 0);
  assert.ok(typeof result.totalSpent === "number");
});

test("tools: dispatch finance_set_budget updates budget", () => {
  const store = fresh();
  dispatch(store, "finance_set_budget", { category: "Dining", amount: 500 });
  assert.equal(store.data.finance.budgets.Dining, 500);
});

test("tools: capture_note files into projects inbox", () => {
  const store = fresh();
  const note = dispatch(store, "capture_note", { text: "level the shelf", domain: "projects" });
  assert.equal(note.domain, "projects");
  assert.ok(store.data.captures.length === 1);
  const inbox = store.data.projects.find((p) => p.name === "Inbox");
  assert.ok(inbox && inbox.items.some((i) => i.text === "level the shelf"));
});

test("tools: dispatch throws on unknown tool", () => {
  assert.throws(() => dispatch(fresh(), "nope", {}));
});
