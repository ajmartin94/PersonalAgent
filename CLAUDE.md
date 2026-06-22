# CLAUDE.md

Guidance for Claude Code working in this repository.

## What this project is

A multi-domain personal agent + glanceable surface for two users (me and my wife),
expanding the kitchen-only [HeySous](https://github.com/ajmartin94/HeySous) into
kitchen, home projects, news, and personal finance — built to add new domains easily.

The project is in early **definition**. The primary artifact today is the user
requirements document at `docs/user-requirements.md`.

## How to work here

- **Separate requirements from implementation, strictly.** A requirement describes
  user-facing functionality and the user's control over it. A specific mechanism,
  policy value, platform, or technical choice is an *implementation decision* and does
  not belong in requirements docs. When unsure, ask about the experience, not the
  mechanism.
- **Frame everything as functionality and experience**, written from the user's seat
  ("the user can…"). Avoid the word "capabilities" — prefer functionality/experience.
- **Judge every experience by number of taps to complete.** Fewer is always better;
  zero (information simply already present) is ideal. This is platform-independent.
- **Requirements docs contain no implementation detail.** No tech stack, no
  architecture, no specific apps/platforms named as requirements.

## Git & engineering workflow

- **Never push to `main` directly.** All changes land on `main` through a pull
  request — branch, push the branch, open a PR, merge. No exceptions, even for docs.
- **Use feature branches.** Branch off `main` for any unit of work (e.g.
  `feature/<name>`); keep the branch focused.
- **Commit often.** Prefer small, frequent, logically-scoped commits with clear
  messages over large infrequent ones. A commit should leave the tree in a coherent
  state.
- **Linting and programmatic tests are the prime path.** Verify changes with linters
  and automated tests first; treat manual/visual checks as a supplement, not the
  primary signal. Add or update tests alongside the code they cover, and keep lint +
  tests green before opening or merging a PR.

## Conventions

- Documentation lives in `docs/`.
- Implementation decisions and technical architecture live in `docs/architecture.md` (kept strictly separate from requirements).
- Keep the requirements doc structured as **Part I (system-wide)** then **Part II
  (per-domain)**, with each domain inheriting the shared shelf described in Part I.
- Unresolved points are flagged inline as `**[OPEN]**`.
