// Builds the at-a-glance cards the surface (Scriptable widget / app) shows.
// One card per domain, drawn from live data — this is what GET /api/glance returns.

import * as kitchen from "./domains/kitchen.js";
import * as projects from "./domains/projects.js";
import * as news from "./domains/news.js";
import * as finance from "./domains/finance.js";

export function buildGlance(store, { day = "Mon", month = "2026-06" } = {}) {
  const meal = kitchen.todaysMeal(store, day);
  const budget = finance.budgetStatus(store, { month });
  const groceries = budget.rows.find((r) => r.category === "Groceries");
  const next = projects.nextUp(store);
  const story = news.topHeadline(store);
  const stocks = finance.watchlist(store);

  return {
    generatedFor: { day, month },
    cards: [
      {
        domain: "kitchen",
        symbol: "fork.knife",
        label: "Dinner",
        value: meal ? meal.recipe : "No plan",
        sub: meal ? `Day: ${meal.day}` : "Plan a meal",
      },
      {
        domain: "finance",
        symbol: "dollarsign.circle",
        label: "Spending",
        value: `$${budget.totalSpent} / $${budget.totalBudget}`,
        sub: groceries && groceries.over ? `Groceries $${Math.abs(groceries.remaining)} over` : "On track",
      },
      {
        domain: "finance",
        symbol: "chart.line.uptrend.xyaxis",
        label: "Markets",
        value: stocks.map((s) => `${s.symbol} ${s.price}`).join(" · "),
        sub: stocks.map((s) => `${s.changePct >= 0 ? "▲" : "▼"}${Math.abs(s.changePct)}%`).join(" "),
      },
      {
        domain: "news",
        symbol: "newspaper",
        label: "Top story",
        value: story ? story.headline : "Caught up",
        sub: story ? story.topic : "No unread",
      },
      {
        domain: "projects",
        symbol: "hammer",
        label: next ? next.project : "Projects",
        value: next ? next.item : "Nothing next",
        sub: "Next up",
      },
    ],
  };
}
