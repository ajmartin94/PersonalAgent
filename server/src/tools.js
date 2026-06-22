// Tool surface for the conversational agent. Each tool maps to a domain
// operation; dispatch() executes it against the store. Shared by the live
// Claude tool-use loop and by tests (which call dispatch directly).

import * as kitchen from "./domains/kitchen.js";
import * as projects from "./domains/projects.js";
import * as news from "./domains/news.js";
import * as finance from "./domains/finance.js";
import { buildGlance } from "./glance.js";

// JSON-schema tool definitions sent to the model.
export const toolDefs = [
  {
    name: "get_glance",
    description: "Get the at-a-glance summary cards across all domains (meal, spending, markets, news, projects).",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "kitchen_get_plan",
    description: "Get this week's meal plan and today's dinner.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "kitchen_save_recipe",
    description: "Save a recipe to the collection. Use when the user describes or shares a recipe.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Recipe name" },
        minutes: { type: "integer", description: "Total time in minutes" },
        serves: { type: "integer", description: "Servings" },
      },
      required: ["title"],
      additionalProperties: false,
    },
  },
  {
    name: "kitchen_grocery_list",
    description: "Get the grocery list built from the meal plan, grouped by store section.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "projects_list",
    description: "List home projects with their open item counts.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "projects_add_item",
    description: "Add a task/idea/note to a home project. Creates the project if it doesn't exist.",
    input_schema: {
      type: "object",
      properties: {
        project: { type: "string", description: "Project name, e.g. 'Garage'" },
        text: { type: "string", description: "The item to add" },
      },
      required: ["project", "text"],
      additionalProperties: false,
    },
  },
  {
    name: "news_feed",
    description: "Get the curated finite news feed and whether the user is caught up.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "finance_spending",
    description: "Get spending by category and budget status. READ-ONLY analysis.",
    input_schema: {
      type: "object",
      properties: { month: { type: "string", description: "YYYY-MM filter, optional" } },
      additionalProperties: false,
    },
  },
  {
    name: "finance_unusual",
    description: "Find transactions notably larger than their category average ('anything unusual').",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "finance_set_budget",
    description: "Set or adjust a monthly budget for a category (an in-system setting).",
    input_schema: {
      type: "object",
      properties: {
        category: { type: "string" },
        amount: { type: "number" },
      },
      required: ["category", "amount"],
      additionalProperties: false,
    },
  },
  {
    name: "capture_note",
    description: "File a quick note/thought into a domain. Use for fuzzy 'remember this' captures.",
    input_schema: {
      type: "object",
      properties: {
        text: { type: "string" },
        domain: { type: "string", enum: ["kitchen", "projects", "news", "finance", "general"] },
      },
      required: ["text"],
      additionalProperties: false,
    },
  },
];

// Execute a tool by name. Returns a JSON-serializable result.
export function dispatch(store, name, input = {}) {
  switch (name) {
    case "get_glance":
      return buildGlance(store);
    case "kitchen_get_plan":
      return { today: kitchen.todaysMeal(store), week: kitchen.getPlan(store) };
    case "kitchen_save_recipe":
      return kitchen.saveRecipe(store, input);
    case "kitchen_grocery_list":
      return kitchen.groceryList(store);
    case "projects_list":
      return projects.listProjects(store);
    case "projects_add_item":
      return projects.addItem(store, input);
    case "news_feed":
      return news.feed(store);
    case "finance_spending":
      return finance.budgetStatus(store, input);
    case "finance_unusual":
      return finance.unusualTransactions(store);
    case "finance_set_budget":
      return finance.setBudget(store, input);
    case "capture_note":
      return captureNote(store, input);
    default:
      throw new Error(`unknown tool: ${name}`);
  }
}

// Store a captured note. If domain is "projects", also drop it on an Inbox project.
export function captureNote(store, { text, domain = "general" }) {
  if (!text || !text.trim()) throw new Error("note text is required");
  const note = { id: `c${store.data.captures.length + 1}_${Date.now()}`, text: text.trim(), domain };
  store.data.captures.push(note);
  if (domain === "projects") projects.addItem(store, { project: "Inbox", text: text.trim() });
  store.save();
  return note;
}
