# Personal Agent

A single personal agent that organizes the information that matters, performs useful
actions, and surfaces the right thing at the right moment — paired with a glanceable
surface I reach for instead of opening a dozen separate apps.

It expands my existing kitchen-only agent
([HeySous](https://github.com/ajmartin94/HeySous)) into a multi-domain assistant for
two users (me and my wife), built so that **adding new areas of life over time is
natural and consistent.**

## Domains (v1)

- **Kitchen** — meal planning, recipes, grocery lists, cooking nudges (carries over HeySous).
- **Home projects** — a central organizer for ongoing projects, lists, ideas, and notes.
- **News feed** — a curated, finite, scroll-free current-events feed.
- **Personal finance** — transaction awareness, budgeting, charts, and analysis.

Anticipated future domains: calendar, email, health/fitness, travel/documents.

## North stars

- **Judged by number of taps to complete.** Every experience is measured by how few
  taps stand between me and done. Zero (it's just already there) is the ideal.
- **Glanceable first, conversational second**, with speech-to-text and text-to-speech.
- **Proactive, not noisy** — it reaches out the way I want it to, under my control.
- **One brain, many domains** — extensible by design.

## Running the MVP

A functional prototype lives in this repo (see [`docs/architecture.md`](docs/architecture.md)).

**Backend** (Node 18+):

```sh
npm install
npm run check          # lint + tests + widget syntax checks (the prime verification path)
export ANTHROPIC_API_KEY=sk-ant-...   # optional — enables the conversational agent
npm start              # serves http://localhost:3000
```

Key endpoints: `GET /api/glance` (the surface's cards), `GET /api/kitchen/plan` ·
`/api/news` · `/api/finance/summary` · `/api/projects`, `POST /api/chat`,
`POST /api/capture`. Without an API key the deterministic endpoints and keyword-based
capture still work; only the live conversation needs the key.

**Glanceable surface** (free Scriptable app on iPhone) — the scripts in
[`prototype/scriptable/`](prototype/scriptable/) fetch live data from the backend:
the home/lock-screen widget (`glance-widget.js`), the full-screen app mockup
(`glance-app.js`), and a working conversational client (`glance-chat.js`). See that
folder's README for install and how to point the scripts at your server.

## Status

Early definition graduating into a functional MVP. Key artifacts:

- [`docs/user-requirements.md`](docs/user-requirements.md) — user-facing functionality
  and experience only (no implementation detail).
- [`docs/architecture.md`](docs/architecture.md) — implementation decisions (test
  architecture, MVP backend).
