import { test } from "node:test";
import assert from "node:assert/strict";
import { createStore } from "../src/store.js";
import { seedData } from "../src/seed.js";
import { buildGlance } from "../src/glance.js";

test("glance: returns one card per domain with live values", () => {
  const store = createStore({ data: seedData() });
  const glance = buildGlance(store);
  const domains = glance.cards.map((c) => c.domain);
  assert.ok(domains.includes("kitchen"));
  assert.ok(domains.includes("finance"));
  assert.ok(domains.includes("news"));
  assert.ok(domains.includes("projects"));

  const dinner = glance.cards.find((c) => c.label === "Dinner");
  assert.equal(dinner.value, "Sheet-pan chicken & veg");

  const spending = glance.cards.find((c) => c.label === "Spending");
  assert.match(spending.value, /^\$\d/);

  // Every card has the fields the widget renders.
  for (const card of glance.cards) {
    assert.ok(card.symbol && card.label && card.value !== undefined);
  }
});
