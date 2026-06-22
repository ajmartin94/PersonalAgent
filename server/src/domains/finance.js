// Finance domain: READ-&-ADVISE (per requirements II.4). Real analysis logic
// over seeded transactions; only budgets (an in-system setting) are mutable.

function round(n) {
  return Math.round(n * 100) / 100;
}

export function spendingByCategory(store, { month = null } = {}) {
  const txns = store.data.finance.transactions.filter((t) => !month || t.date.startsWith(month));
  const totals = {};
  for (const t of txns) totals[t.category] = round((totals[t.category] || 0) + t.amount);
  return totals;
}

export function budgetStatus(store, { month = null } = {}) {
  const spent = spendingByCategory(store, { month });
  const { budgets } = store.data.finance;
  const rows = Object.entries(budgets).map(([category, budget]) => {
    const used = spent[category] || 0;
    return { category, budget, spent: round(used), remaining: round(budget - used), over: used > budget };
  });
  const totalBudget = round(Object.values(budgets).reduce((a, b) => a + b, 0));
  const totalSpent = round(Object.values(spent).reduce((a, b) => a + b, 0));
  return { rows, totalBudget, totalSpent };
}

// A small charting series: daily cumulative spend for a category (or all).
export function spendSeries(store, { category = null } = {}) {
  const txns = [...store.data.finance.transactions]
    .filter((t) => !category || t.category === category)
    .sort((a, b) => a.date.localeCompare(b.date));
  let cumulative = 0;
  return txns.map((t) => {
    cumulative = round(cumulative + t.amount);
    return { date: t.date, amount: t.amount, cumulative };
  });
}

// Flag transactions notably larger than the category's average ("anything unusual").
export function unusualTransactions(store, { factor = 2 } = {}) {
  const txns = store.data.finance.transactions;
  const byCat = {};
  for (const t of txns) (byCat[t.category] = byCat[t.category] || []).push(t.amount);
  const avg = {};
  for (const [c, amts] of Object.entries(byCat)) avg[c] = amts.reduce((a, b) => a + b, 0) / amts.length;
  return txns
    .filter((t) => t.amount >= avg[t.category] * factor)
    .map((t) => ({ ...t, categoryAvg: round(avg[t.category]) }));
}

export function watchlist(store) {
  return store.data.finance.watchlist;
}

export function setBudget(store, { category, amount }) {
  if (!category) throw new Error("category is required");
  const value = Number(amount);
  if (!Number.isFinite(value) || value < 0) throw new Error("amount must be a non-negative number");
  store.data.finance.budgets[category] = round(value);
  store.save();
  return { category, amount: round(value) };
}
