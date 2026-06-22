// Initial seed data for the MVP. Persisted to server/data/db.json on first run.
// All data is local and household-shared (the two users see one shared copy).

export function seedData() {
  return {
    kitchen: {
      preferences: { diet: ["no shellfish"], dislikes: ["cilantro"] },
      recipes: [
        {
          id: "r1",
          title: "Sheet-pan chicken & veg",
          minutes: 35,
          serves: 4,
          section: { Produce: ["broccoli", "carrots", "red onion"], Meat: ["chicken thighs"], Pantry: ["olive oil", "paprika"] },
        },
        {
          id: "r2",
          title: "Black bean tacos",
          minutes: 20,
          serves: 4,
          section: { Produce: ["avocado", "lime", "cabbage"], Pantry: ["black beans", "tortillas", "cumin"] },
        },
        {
          id: "r3",
          title: "Lemon pasta",
          minutes: 25,
          serves: 3,
          section: { Produce: ["lemon", "parsley"], Pantry: ["spaghetti", "olive oil"], Dairy: ["parmesan"] },
        },
      ],
      // mealPlan: array of { day, recipeId }
      mealPlan: [
        { day: "Mon", recipeId: "r1" },
        { day: "Tue", recipeId: "r2" },
        { day: "Wed", recipeId: "r3" },
      ],
      // grocery items checked off as you shop
      groceryChecked: [],
    },

    projects: [
      {
        id: "p1",
        name: "Garage",
        items: [
          { id: "i1", text: "Order shelving brackets", done: false },
          { id: "i2", text: "Measure back wall", done: false },
        ],
      },
      {
        id: "p2",
        name: "Backyard deck",
        items: [{ id: "i3", text: "Price composite boards", done: false }],
      },
    ],

    news: {
      // A curated, FINITE feed — user-defined topics, headline-first.
      items: [
        { id: "n1", topic: "Local", headline: "Transit plan clears final vote", read: false },
        { id: "n2", topic: "Tech", headline: "New on-device speech models ship", read: false },
        { id: "n3", topic: "Markets", headline: "Index closes up 0.4% on the week", read: false },
      ],
    },

    finance: {
      // Read-&-advise. Seeded transactions stand in for a live bank feed.
      budgets: { Groceries: 800, Dining: 400, Transport: 200 },
      transactions: [
        { id: "t1", date: "2026-06-02", category: "Groceries", amount: 142.13, merchant: "Market" },
        { id: "t2", date: "2026-06-05", category: "Dining", amount: 64.2, merchant: "Cafe" },
        { id: "t3", date: "2026-06-09", category: "Groceries", amount: 88.05, merchant: "Market" },
        { id: "t4", date: "2026-06-11", category: "Transport", amount: 45.0, merchant: "Gas" },
        { id: "t5", date: "2026-06-15", category: "Groceries", amount: 210.4, merchant: "Wholesale" },
        { id: "t6", date: "2026-06-18", category: "Dining", amount: 52.6, merchant: "Bistro" },
        { id: "t7", date: "2026-06-20", category: "Groceries", amount: 67.9, merchant: "Market" },
      ],
      // Stock snapshot (stand-in for a live quote source).
      watchlist: [
        { symbol: "AAPL", price: 213.4, changePct: 0.8 },
        { symbol: "VTI", price: 280.1, changePct: -0.2 },
      ],
    },

    // Quick-capture inbox for fuzzy notes the agent files by domain.
    captures: [],
  };
}
