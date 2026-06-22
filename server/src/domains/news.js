// News domain: a curated, FINITE headline feed. No infinite scroll — when the
// list is read, there's a clear "caught up" state.

export function feed(store) {
  const { items } = store.data.news;
  const unread = items.filter((i) => !i.read);
  return {
    items: items.map((i) => ({ id: i.id, topic: i.topic, headline: i.headline, read: i.read })),
    unreadCount: unread.length,
    caughtUp: unread.length === 0,
  };
}

export function topHeadline(store) {
  const unread = store.data.news.items.find((i) => !i.read);
  return unread ? { topic: unread.topic, headline: unread.headline } : null;
}

export function markRead(store, { id }) {
  const item = store.data.news.items.find((i) => i.id === id);
  if (!item) throw new Error(`no news item: ${id}`);
  item.read = true;
  store.save();
  return { id, read: true };
}

export function addTopicItem(store, { topic, headline }) {
  if (!headline || !headline.trim()) throw new Error("headline is required");
  const id = `n${store.data.news.items.length + 1}_${Date.now()}`;
  const item = { id, topic: topic || "General", headline: headline.trim(), read: false };
  store.data.news.items.push(item);
  store.save();
  return item;
}
