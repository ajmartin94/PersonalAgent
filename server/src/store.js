// Tiny JSON-file persistence layer. Enough for a 2-user household MVP.
// Injectable path so tests can use an in-memory / temp store with no disk writes.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { seedData } from "./seed.js";

export function createStore({ path = null, data = null } = {}) {
  let state;

  if (data) {
    state = structuredClone(data);
  } else if (path && existsSync(path)) {
    state = JSON.parse(readFileSync(path, "utf8"));
  } else {
    state = seedData();
  }

  function save() {
    if (!path) return; // in-memory store (tests) — nothing to persist
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify(state, null, 2));
  }

  // Persist the initial seed so a fresh file exists on first real run.
  if (path && !existsSync(path)) save();

  return {
    get data() {
      return state;
    },
    save,
  };
}
