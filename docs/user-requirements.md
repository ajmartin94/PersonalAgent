# Personal Agent — User Requirements Document

> **Status:** Draft v0.5 — for review
> **Scope of this document:** User-facing functionality and experience only. No technical or implementation detail. Unresolved points are flagged **[OPEN]**.
>
> **Structure:** **Part I** defines system-wide requirements that apply to the whole agent. **Part II** defines requirements per domain, layered on top of Part I. Every domain inherits the system capabilities and then adds its own specifics.

---

## Vision

A single personal agent that organizes the information that matters to me, performs useful actions on my behalf, and surfaces the right thing at the right moment — paired with a glanceable surface I reach for instead of opening a dozen separate apps. The ambition is to absorb a large share of my daily phone usage and replace several services I pay for (or plan to).

It expands my existing kitchen-only agent (HeySous) into a multi-domain assistant, keeping what makes HeySous useful — conversational, proactive, present where I already am — while being built so that **adding new domains over time is natural and consistent.**

## What success looks like

- I reach for this instead of opening 4–6 separate apps for the same information.
- It replaces or absorbs services I pay for today and ones I'd otherwise adopt.
- A morning glance answers "what do I need to know today?" across all my domains.
- I can hand it a fuzzy, half-formed thought and it files it correctly.
- It replaces aimless scrolling with a curated, finite feed.
- **When I think of a new area of my life to add, there's an obvious way it shows up** — without rebuilding anything.

---

# Part I — System-Wide Requirements

These apply to the entire agent regardless of domain.

## I.1 Guiding experience principles

- **Glanceable first, conversational second.** Most needs are met by a quick look; conversation is for when a glance isn't enough.
- **Judged by number of taps to complete.** Every experience — finding information *or* taking an action — is measured by how many taps (or interactions) stand between me and done. Fewer is always better; zero (it's simply already there, e.g. on my lock screen) is the ideal; "open an app, find a tab, tap in, tap again" is the failure mode. This is an experience target, independent of where it technically lives.
- **Proactive, not noisy.** It reaches out when something is genuinely worth my attention and stays quiet otherwise.
- **One brain, many domains.** The same agent understands every domain and can connect them.
- **Extensible by design (experience-level).** Adding a new domain is a first-class, repeatable experience — a new domain automatically offers the same set of experiences (below) without bespoke effort each time.
- **Low-friction capture.** Getting information *in* is as fast as a thought.
- **Trustworthy & in control.** I always understand what it knows and what it's allowed to do, especially with sensitive data.

## I.2 What every domain gives me (the shared shelf)

Every domain — existing or future — automatically offers the same set of experiences. This consistency is what makes adding a new domain feel natural.

1. **At-a-glance views** — one or more cards on the surface showing what matters in that domain right now.
2. **Conversation** — I can talk or type to the agent about that domain and it understands the context.
3. **Quick capture** — a fast, consistent way to drop something into that domain (spoken, typed, or one tap).
4. **Scheduled and triggered routines** — that domain can do things on a schedule or in response to events.
5. **One-tap actions** — common tasks in that domain are doable in a single tap.
6. **A clear boundary on what the agent may do on its own** — each domain sets how much the agent acts autonomously vs. asks first (see I.6).

## I.3 The glanceable surface

A surface — primarily on my phone — that presents relevant information with minimal interaction.
- Prioritizes the fewest-interactions path: ideally information is *already shown* (e.g. lock screen / widget-style presence) rather than requiring me to navigate to it.
- At-a-glance cards drawn from any domain: today's & this week's meal plan, stock prices, top news, finance snapshot, home-project nudges, and whatever future domains add.
- One-tap quick actions for standard routines.
- A fast path into conversation with the agent.
- Tuned for density and prioritization appropriate to a quick look.
- **The surface and the agent are one tightly-coupled experience** — neither ships or is judged in isolation.

## I.4 Conversational interface

- Open a conversation quickly, from wherever the surface lives.
- Text in, text out.
- **Speech-to-text** (talk to it) and **text-to-speech** (it talks back).
- Natural multi-turn conversation with memory of context, not just one-shot commands.

## I.5 Scheduling, triggers & proactivity

- **Time-based routines:** morning news feed, weekly home-project nudges, overnight housekeeping, etc.
- **Event/trigger-based actions:** e.g. stock-ticker news when something moves.
- I can define, adjust, pause, and trust these routines.
- **Outreach is a capability under my control.** The requirement is that the agent *can* reach out to me — through whatever channels and forms I choose — and that I decide the when, how, and how-often. No fixed frequency or policy is specified here; that's mine to set and change.

## I.6 Autonomy & trust model (system-wide framework, applied per domain)

The agent operates on a spectrum of autonomy. The *framework* is system-wide; the *setting* is chosen per domain and potentially per capability/tool:

- **Read & advise** — observe and recommend; take no action.
- **Act within the system** — make changes inside the agent's own data (categorize, tag, organize) but nothing in the outside world.
- **Act in the world, ask-first** — can perform external actions (e.g. send an email) but confirms before doing so.
- **Act autonomously, with guardrails** — performs defined actions on its own within limits I set.

The agent as a whole *may* include action-capable tools; each domain opts into the level it's comfortable with. (Example: Finance is **Read & advise** for now, even though other tools elsewhere may send emails or take actions.)

## I.7 Capture & memory

- **I can capture quick thoughts and notes in one step.** A fleeting idea, a reminder, a "don't forget this" — I drop it in (spoken, typed, or one tap) without having to decide where it belongs, and the agent files it to the right domain for me.
- **The agent remembers what's important and uses that information to make better responses.**
- **It does offline (e.g. overnight) work to improve itself between conversations:** cleaning up past messages, pulling and reconciling information from connected sources (email, calendar, etc.), and enriching its memory so the next conversation is better than the last.

## I.8 Multiple people & sharing

Two users from the start — me and my wife — with everything fully shared.
- Both of us use the agent and the surface and see the same information across every domain.
- No personal-vs-shared distinction for now: it's effectively one shared copy.
- Keep it simple; finer-grained permissions or additional people are not a current requirement.

---

# Part II — Domain Requirements

Each domain inherits the full Part I shelf, then specifies what's below. **All four are in scope for v1**, built so additional domains slot in later the same way.

## II.0 Domain template (the repeatable pattern)

For each domain we specify:
- **Purpose** — what this domain is for.
- **Glance cards** — what shows on the surface.
- **Conversational asks** — representative things I'd say.
- **Capture** — what I drop in and how.
- **Routines/triggers** — what runs on schedule or on events.
- **Quick actions** — one-tap tasks.
- **Autonomy posture** — chosen level from I.6.
- **Replaces** — what service/app/habit this supplants.

## II.1 Kitchen (carries over HeySous)
- **Purpose:** Everything food — planning meals, keeping recipes, shopping, and cooking.
- **What I can do (carried over from HeySous):**
  - Save a recipe by pasting a link or just describing it in conversation.
  - Browse and search my recipe collection.
  - Get a weekly meal plan generated from my preferences and history.
  - Get a grocery list built automatically from the meal plan, organized by store section.
  - Keep my dietary preferences and allergies on record and have them respected.
  - Give feedback on meals so future suggestions get better.
  - Receive cooking nudges — a morning summary, prep alerts, dinner reminders.
  - Check off groceries as I shop.
  - See today's plan, the week's plan, and my recipes at a glance.
- **At-a-glance views:** today's meal plan; this week's plan.
- **Conversational asks:** "plan three dinners for this week"; "save this recipe"; "what's for dinner tonight?"
- **One-tap actions:** check off a grocery item; mark a meal cooked.
- **What the agent may do on its own:** _TBD (carries over today's HeySous behavior)._
- **Replaces:** HeySous's kitchen functionality.

## II.2 Home projects
- **Purpose:** Central organizer for many ongoing projects, each with lists, ideas, plans, notes.
- **Glance cards:** project status; what's next; nudges.
- **Conversational asks:** "what was that idea about the deck?", "add this to the garage list."
- **Capture:** quick idea/task/note assigned to a project; links and reference material.
- **Routines/triggers:** weekly nudges to move projects forward.
- **Quick actions:** _TBD._
- **Autonomy posture:** _TBD (likely act-within-system)._
- **Replaces:** scattered lists / notes apps.

## II.3 News feed
- **Purpose:** A curated, **finite** current-events feed that replaces ad-driven infinite scroll. The goal is to read what matters and *get off the phone when done.*
- **Shape of the feed:** a specific, user-defined list of items or topics, presented **headline-first with drill-down** — scan headlines, tap to go deeper on the ones I care about. When I reach the end of the list, **there is no more** — no infinite scroll, no algorithmic "more for you."
- **Glance cards:** the headline list; a clear "you're caught up / done" finish state.
- **Conversational asks:** "what's the latest on X?", "more on this."
- **Capture:** I decide the items/topics that make up my feed (add, remove, follow, mute).
- **Routines/triggers:** morning briefing; stock-related news.
- **Quick actions:** _TBD._
- **Autonomy posture:** read & advise (curation).
- **Replaces:** social-media scrolling (aspires to a "Ground News"-style multi-angle framing). **Explicitly not** a full Reddit replacement.

## II.4 Personal finance
- **Purpose:** Pull transactions and provide spending awareness, budgeting, charts, and analysis. The parts Monarch already does well — charts and spending analysis — are the v1 bar, and they're genuinely good.
- **Glance cards:** finance snapshot; budget status; stock prices.
- **Conversational asks:** "how's grocery spending this month?", "did anything unusual hit my account?", "chart my dining-out spend this year."
- **Capture:** set/adjust a budget; request analyses and charts.
- **Routines/triggers:** _TBD (e.g. weekly spending summary)._
- **Quick actions:** _TBD._
- **Autonomy posture (v1):** **Read & advise only.** Observe, analyze, chart, advise — take no action.
- **Ambition (beyond Monarch — future posture):** the things Monarch's AI *can't* do today, which are exactly the in-system actions I want eventually:
  - assign / correct transaction categories itself,
  - find an e-receipt in my email (or prompt me to provide one),
  - retrieve receipt details from a source (e.g. log in to a retailer and extract line items),
  - and generally *act* on my finances, not just describe them.
- **Replaces:** Monarch.

## II.5 Anticipated future domains

Not built in the first pass, but the system must accommodate them the same way (full Part I shelf, same template). Listed so the foundation anticipates them:
- **Calendar / scheduling** — events, appointments, time management.
- **Email / comms** — reading, triaging, drafting, sending.
- **Health / fitness** — workouts, sleep, nutrition, metrics.
- **Travel / documents** — trip planning, itineraries, important records.

The point of listing these is the extensibility guarantee: when any of them (or something not yet imagined) is added, it inherits the same shelf and slots in without rework.

---

## Open questions still to resolve

The major requirements questions are resolved. Remaining items are detail-level and marked _TBD_ inline (specific routines, one-tap actions, and the eventual "what the agent may do on its own" setting for Kitchen and Home Projects). One thing worth confirming:

- **[Kitchen]** Should pantry / "what's on hand" tracking be part of the kitchen baseline? It isn't in the current HeySous feature set, so I left it out.
