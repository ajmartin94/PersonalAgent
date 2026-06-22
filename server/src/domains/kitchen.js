// Kitchen domain: recipes, meal plan, grocery list by store section, prefs.
// Pure-ish functions over the store; callers persist via store.save().

let nextId = 1000;
function genId(prefix) {
  nextId += 1;
  return `${prefix}${nextId}`;
}

export function getRecipe(store, recipeId) {
  return store.data.kitchen.recipes.find((r) => r.id === recipeId) || null;
}

export function listRecipes(store) {
  return store.data.kitchen.recipes.map((r) => ({ id: r.id, title: r.title, minutes: r.minutes, serves: r.serves }));
}

export function getPlan(store) {
  const { mealPlan } = store.data.kitchen;
  return mealPlan.map((entry) => {
    const recipe = getRecipe(store, entry.recipeId);
    return { day: entry.day, recipe: recipe ? recipe.title : "(unknown)", recipeId: entry.recipeId };
  });
}

export function todaysMeal(store, day = "Mon") {
  const plan = getPlan(store);
  return plan.find((p) => p.day === day) || plan[0] || null;
}

export function saveRecipe(store, { title, minutes = null, serves = null, section = {} }) {
  if (!title || !title.trim()) throw new Error("recipe title is required");
  const recipe = { id: genId("r"), title: title.trim(), minutes, serves, section };
  store.data.kitchen.recipes.push(recipe);
  store.save();
  return recipe;
}

// Build a grocery list from the meal plan, merged and grouped by store section.
export function groceryList(store) {
  const sections = {};
  for (const entry of store.data.kitchen.mealPlan) {
    const recipe = getRecipe(store, entry.recipeId);
    if (!recipe) continue;
    for (const [section, items] of Object.entries(recipe.section || {})) {
      sections[section] = sections[section] || new Set();
      for (const item of items) sections[section].add(item);
    }
  }
  const checked = new Set(store.data.kitchen.groceryChecked);
  const out = {};
  for (const [section, set] of Object.entries(sections)) {
    out[section] = [...set].sort().map((name) => ({ name, checked: checked.has(name) }));
  }
  return out;
}

export function checkGroceryItem(store, name, checked = true) {
  const set = new Set(store.data.kitchen.groceryChecked);
  if (checked) set.add(name);
  else set.delete(name);
  store.data.kitchen.groceryChecked = [...set];
  store.save();
  return { name, checked };
}

export function getPreferences(store) {
  return store.data.kitchen.preferences;
}

export function addPreference(store, { kind = "diet", value }) {
  if (!value || !value.trim()) throw new Error("preference value is required");
  const prefs = store.data.kitchen.preferences;
  const list = prefs[kind] || (prefs[kind] = []);
  if (!list.includes(value.trim())) list.push(value.trim());
  store.save();
  return prefs;
}
