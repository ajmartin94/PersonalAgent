import { test } from "node:test";
import assert from "node:assert/strict";
import { createStore } from "../src/store.js";
import { seedData } from "../src/seed.js";
import * as kitchen from "../src/domains/kitchen.js";
import * as projects from "../src/domains/projects.js";
import * as news from "../src/domains/news.js";
import * as finance from "../src/domains/finance.js";

const fresh = () => createStore({ data: seedData() });

test("kitchen: plan resolves recipe titles", () => {
  const store = fresh();
  const plan = kitchen.getPlan(store);
  assert.equal(plan[0].recipe, "Sheet-pan chicken & veg");
  assert.equal(kitchen.todaysMeal(store, "Tue").recipe, "Black bean tacos");
});

test("kitchen: grocery list merges by section and reflects checks", () => {
  const store = fresh();
  let list = kitchen.groceryList(store);
  assert.ok(list.Produce.length > 0);
  assert.ok(list.Pantry.some((i) => i.name === "black beans"));
  kitchen.checkGroceryItem(store, "black beans", true);
  list = kitchen.groceryList(store);
  assert.equal(list.Pantry.find((i) => i.name === "black beans").checked, true);
});

test("kitchen: saveRecipe and addPreference persist to store", () => {
  const store = fresh();
  const r = kitchen.saveRecipe(store, { title: "Soup", minutes: 30 });
  assert.ok(kitchen.getRecipe(store, r.id));
  kitchen.addPreference(store, { kind: "dislikes", value: "olives" });
  assert.ok(kitchen.getPreferences(store).dislikes.includes("olives"));
});

test("kitchen: saveRecipe rejects empty title", () => {
  const store = fresh();
  assert.throws(() => kitchen.saveRecipe(store, { title: "  " }));
});

test("projects: addItem creates a new project when missing", () => {
  const store = fresh();
  const before = projects.listProjects(store).length;
  projects.addItem(store, { project: "Office", text: "Buy a lamp" });
  const after = projects.listProjects(store);
  assert.equal(after.length, before + 1);
  assert.ok(after.find((p) => p.name === "Office"));
});

test("projects: nextUp returns the first open item", () => {
  const store = fresh();
  assert.equal(projects.nextUp(store).item, "Order shelving brackets");
});

test("projects: completeItem marks done", () => {
  const store = fresh();
  const proj = projects.getProject(store, "Garage");
  const item = proj.items[0];
  projects.completeItem(store, { project: "Garage", itemId: item.id });
  assert.equal(projects.getProject(store, "Garage").items[0].done, true);
});

test("news: feed reports unread + caughtUp state", () => {
  const store = fresh();
  let f = news.feed(store);
  assert.equal(f.caughtUp, false);
  assert.equal(f.unreadCount, 3);
  for (const item of store.data.news.items) news.markRead(store, { id: item.id });
  f = news.feed(store);
  assert.equal(f.caughtUp, true);
  assert.equal(news.topHeadline(store), null);
});

test("finance: spending and budget status compute correctly", () => {
  const store = fresh();
  const spend = finance.spendingByCategory(store);
  // Groceries: 142.13 + 88.05 + 210.40 + 67.90 = 508.48
  assert.equal(spend.Groceries, 508.48);
  const status = finance.budgetStatus(store);
  const groceries = status.rows.find((r) => r.category === "Groceries");
  assert.equal(groceries.remaining, 291.52);
  assert.equal(groceries.over, false);
});

test("finance: unusual flags large transactions; setBudget validates", () => {
  const store = fresh();
  const unusual = finance.unusualTransactions(store, { factor: 1.5 });
  assert.ok(unusual.some((t) => t.id === "t5")); // 210.40 grocery is the outlier
  finance.setBudget(store, { category: "Groceries", amount: 900 });
  assert.equal(store.data.finance.budgets.Groceries, 900);
  assert.throws(() => finance.setBudget(store, { category: "X", amount: -5 }));
});
