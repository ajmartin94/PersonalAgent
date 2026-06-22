// Home projects domain: many ongoing projects, each with items/notes.

let nextId = 2000;
function genId(prefix) {
  nextId += 1;
  return `${prefix}${nextId}`;
}

export function listProjects(store) {
  return store.data.projects.map((p) => ({
    id: p.id,
    name: p.name,
    open: p.items.filter((i) => !i.done).length,
    total: p.items.length,
  }));
}

export function getProject(store, ref) {
  const projects = store.data.projects;
  return (
    projects.find((p) => p.id === ref) ||
    projects.find((p) => p.name.toLowerCase() === String(ref).toLowerCase()) ||
    null
  );
}

export function nextUp(store) {
  for (const p of store.data.projects) {
    const item = p.items.find((i) => !i.done);
    if (item) return { project: p.name, item: item.text };
  }
  return null;
}

// Add an item to a project. Creates the project if it doesn't exist yet.
export function addItem(store, { project, text }) {
  if (!text || !text.trim()) throw new Error("item text is required");
  let proj = getProject(store, project);
  if (!proj) {
    proj = { id: genId("p"), name: String(project || "Inbox").trim(), items: [] };
    store.data.projects.push(proj);
  }
  const item = { id: genId("i"), text: text.trim(), done: false };
  proj.items.push(item);
  store.save();
  return { project: proj.name, item };
}

export function completeItem(store, { project, itemId }) {
  const proj = getProject(store, project);
  if (!proj) throw new Error(`no project: ${project}`);
  const item = proj.items.find((i) => i.id === itemId);
  if (!item) throw new Error(`no item: ${itemId}`);
  item.done = true;
  store.save();
  return { project: proj.name, item };
}
