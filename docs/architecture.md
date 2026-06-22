# Personal Agent — Architecture & Implementation Decisions

> **Status:** Living document — v0.1 (2026-06-22)
> **Scope of this document:** Implementation decisions, technical architecture, and
> the reasoning behind them. This is the deliberate counterpart to
> `docs/user-requirements.md`: requirements stay user-facing and mechanism-free, and
> every technical/platform/mechanism choice lives **here** instead.
>
> **Format:** A short architecture overview, then a numbered log of **Decision
> Records** (most recent first). Each record states context, the decision, what it
> enables vs. defers, and consequences. Findings are tagged with confidence and
> sources where they rest on external research.

---

## Architecture overview (trajectory)

The product is an iOS-first glanceable surface backed by a server-side agent
(extending [HeySous](https://github.com/ajmartin94/HeySous)). Two architectural facts,
verified by research, anchor everything:

1. **The phone cannot keep glanceable data fresh on its own.** iOS background
   execution is opportunistic and may never run; widget refresh is an OS-controlled
   budget (~40–70/day, roughly every 15–60 min). Timely, zero-tap data must be
   **pushed from a server via APNs**, not polled on-device.
2. **The native glance layer is unavoidably SwiftUI.** WidgetKit widgets, Lock Screen
   widgets, Live Activities, and interactive (App Intents) widgets must be authored in
   SwiftUI; cross-platform frameworks can only feed them data.

This implies a **staged path**, not a single build:

- **Stage 0 — Validate desirability (free).** Prove the glance surface changes
  behavior before paying anything. See **Decision 001**.
- **Stage 1 — Native build (paid).** Once validated, pay the Apple Developer Program
  ($99/yr) and build native SwiftUI widgets + a server APNs push pipeline + an in-app
  conversational agent. Recommended over Expo/React Native because the product is
  iOS-only (cross-platform buys nothing) and the glance layer is the core
  differentiator (don't take a young-abstraction dependency on it).

The server's job in both stages is the same shape — expose per-domain data — which is
why Stage 0 is designed to avoid rework (see Decision 001 consequences).

---

## Decision Records

### Decision 002 — Functional MVP backend (Node/Express + Claude agent)

**Date:** 2026-06-22 · **Status:** Accepted · **Stage:** 0→1 bridge (functional prototype)

#### Context

After the visual-only Scriptable prototype (Decision 001), the next step is a **full,
testable MVP with real functionality**: live per-domain data, a working conversational
agent across domains, and quick capture — not just mock cards. Decision 001 established
that the server's per-domain JSON endpoints are the durable interface that survives into
the native build, so the backend is the highest-leverage thing to build first.

#### Decision

- **Stack:** Node.js + Express (plain ESM JavaScript), `@anthropic-ai/sdk` for the agent.
  Persistence is a JSON file (`server/data/db.json`) via a small injectable store — enough
  for a 2-user household MVP, no database.
- **Domains** (real logic over persisted data): **kitchen** (recipes, meal plan, grocery
  list by section, dietary prefs), **projects** (multi-project items/notes), **news**
  (curated finite feed + caught-up state), **finance** (transactions, budgets, spending
  analysis, stock snapshot). Finance is **read-&-advise** per the requirements (only
  budgets, an in-system setting, are mutable).
- **Agent:** Claude `claude-opus-4-8` via a manual tool-use loop. Tools map 1:1 to domain
  operations (read plan, save recipe, add project item, spending analysis, set budget,
  capture note). The system+tools prefix is prompt-cached.
- **Quick capture:** a structured-output classification call files a fuzzy note to the
  right domain, with a deterministic keyword fallback when no API key is present.
- **Endpoints:** `GET /api/glance` (the widget's aggregated cards), `GET` per-domain
  reads, `POST /api/chat`, `POST /api/capture`.
- **Client:** the Scriptable widget + app (Decision 001) fetch these endpoints, with the
  mock data retained as an offline fallback so the surface always renders.

#### Verification (prime path)

Per the repo workflow rule, **linting + automated tests are the prime path**: `npm run
lint` (ESLint) and `npm test` (Node's built-in `node --test`). Domain logic, the glance
aggregation, tool dispatch, and all HTTP endpoints are covered by tests that inject a
**fake model client** — so the suite is deterministic, free, and needs no API key. The
agent's real model calls are exercised manually with `ANTHROPIC_API_KEY` set.

#### Boundaries / honest scope

- **No live bank or brokerage integration.** Real account/transaction sync needs paid
  aggregation APIs; the MVP uses seeded transactions and a stock snapshot with **real
  analysis logic** over them. Swapping in a live data source later doesn't change the
  endpoint contract.
- The agent requires `ANTHROPIC_API_KEY` to actually converse; without it, the deterministic
  endpoints and capture fallback still work and remain fully testable.

#### Consequences

- The per-domain JSON contract is now concrete and reused by both the Scriptable client
  (Stage 0) and, later, the native SwiftUI widgets + APNs pipeline (Stage 1).
- `npm run check` now runs lint + tests + the Scriptable syntax checks.

---

### Decision 001 — Zero-dollar iOS test architecture (Scriptable glance-surface prototype)

**Date:** 2026-06-22 · **Status:** Accepted · **Stage:** 0 (validate desirability)

#### Context

We want to validate the riskiest, most novel hypothesis — *"will a glanceable,
zero-tap surface actually absorb daily phone usage and feel worth it?"* — **before**
committing to the $99/year Apple Developer Program or to learning native iOS
development (no native iOS has been shipped before). The test must run on **two
iPhones** (both household users) and show **live data from our own server**.

#### Decision

Use **Scriptable** (the free App Store app by Simon Støvring) as the Stage 0
prototyping surface:

- Author each domain card as a Scriptable JavaScript widget using its `ListWidget`
  API, rendered on both the **Home Screen** (small/medium/large) and the **Lock
  Screen** (accessory circular/rectangular/inline).
- Each widget fetches live data over HTTPS from our server via Scriptable's `Request`
  API (`loadJSON()`), so **the only server work for Stage 0 is to expose one plain
  HTTPS JSON endpoint per domain/card** (meal plan, finance snapshot, headlines,
  project nudge, stock prices).
- Deploy to the second iPhone by installing the free app and copying the script — **no
  Apple Developer account, no Xcode, no per-device provisioning.**

**Design constraint to avoid rework:** define the per-card JSON data contract now, as
the stable interface. Stage 1's native build reuses the same endpoints; only the
*delivery* changes (poll → APNs push) and *write-back* action endpoints get added.

#### Why not the alternatives

- **Free native ("Personal Team") build, reinstall weekly** — technically works (a
  `TimelineProvider.getTimeline` can fetch its own data via `URLSession`), but for a
  persistent two-user surface it is hobbled: **provisioning profiles expire 7 days**
  from issuance, **max 10 App IDs per 7-day window**, and **each device must be
  side-loaded from Xcode**. It also requires learning Swift + the platform tax to test
  *less* than Scriptable already delivers. Viable as a later step, not for Stage 0.
- **PWA / home-screen web bookmark** — **cannot render any iOS Home Screen or Lock
  Screen widget** (WidgetKit is not exposed to web content). Dead end for zero-tap
  presence.

#### What Stage 0 can validate for free

- Glanceable Home **and** Lock Screen cards drawn from multiple domains.
- Live remote data from our own server.
- Multiple widget sizes / information density / information architecture.
- Two-user deployment.
- "Does already-present information change how I reach for my phone?" — the actual
  go/no-go question.

#### What Stage 0 cannot do — and the exact pay-wall line

Paying the **$99/year Apple Developer Program** becomes necessary **only** for:

1. **Push-driven real-time freshness (APNs).** Both free paths are capped by the
   OS refresh budget (~40–70/day, ~15–60 min, hints not guarantees); Scriptable cannot
   receive push. Real-time updates require a server pushing via APNs.
2. **Interactive in-widget buttons/toggles.** Native iOS 17 interactive widgets need
   App Intents; a Scriptable widget tap can at most open a URL or run the script
   (flashing the app open).
3. **App Groups** shared containers (app ↔ widget data sharing) for the native build.
4. **Durable installs** beyond the 7-day free-provisioning expiry, and **TestFlight**
   distribution to keep two phones updated long-term.

#### Consequences

- Build the server's per-domain JSON endpoints first; they are the durable interface
  across both stages.
- Accept that Stage 0 freshness is minutes-stale, not real-time — adequate for
  validating desirability, and an explicit non-goal to fix for free.
- The decision to pay is **deferred until Stage 0 proves value**, at which point the
  pay-wall list above is exactly what the money buys.

#### Verified constraints (research, 2026-06-22)

All items high confidence unless noted; sources are Apple primary docs, Scriptable
primary docs, and corroborating practitioner reports.

| Constraint | Verdict | Source |
|---|---|---|
| Scriptable renders Home + iOS 16 Lock Screen widgets, no account/Xcode | True | docs.scriptable.app/config, /listwidget |
| Scriptable fetches live HTTPS JSON (`Request.loadJSON()`) | True | docs.scriptable.app/request |
| Two-phone deploy = install app + copy script (no provisioning) | True | docs.scriptable.app/config |
| Free native widget can fetch its own data via `URLSession` in `getTimeline` | True | developer.apple.com/documentation/widgetkit/timelineprovider |
| Free native: profiles expire 7 days; ≤10 App IDs/7 days; per-device side-load | True | developer.apple.com/support/compare-memberships |
| No real-time refresh for free (OS budget ~40–70/day, ~15–60 min, hints only) | True | developer.apple.com/.../keeping-a-widget-up-to-date |
| PWA cannot render any iOS Home/Lock Screen widget | True | multiple, corroborated by WidgetKit architecture |
| In-widget interactive buttons need App Intents (paid native); Scriptable can't | True | WWDC23 "Bring widgets to life"; docs.scriptable.app/listwidget |

**Correction / caveat (do not over-state the free-vs-paid split):** an earlier
assumption that the free Apple ID is *barred at the capability level* from Push
Notifications and App Groups was **refuted (0-3)** against Apple's "Supported
capabilities (iOS)" reference, which lists both across membership tiers. The binding
free-tier constraints are the **7-day provisioning/App-ID expiry** and **per-device
side-loading**, not a clean capability block. Treat "push + App Groups need the $99
program" as **practically true for a real deployment** (APNs needs a push-enabled App
ID + certificate/key infrastructure gated behind a paid account in practice) but **not
cleanly supported by the capability table** — verify in Xcode against a free Apple ID
before relying on either for push/shared-container features.

#### Open follow-ups

- Empirically, how often do Scriptable Home vs. Lock Screen widgets actually refresh
  on our two phones under normal use? (OS budget varies by view frequency.)
- Is there a free-ish push-to-refresh workaround (Scriptable URL scheme triggered by a
  free push/automation or Shortcuts automation) that approximates real-time, and how
  reliable is it?
- Design the Stage 1 data contract (push payloads + write-back action endpoints) up
  front during Stage 0 to avoid rework?
- Still un-researched (deferred): the conversational agent's on-device STT/TTS vs.
  server-streaming architecture, and the precise TestFlight vs. ad-hoc vs. unlisted
  distribution tradeoffs for a 2-person household.
