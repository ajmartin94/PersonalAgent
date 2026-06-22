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

## Conventions

- Documentation lives in `docs/`.
- Keep the requirements doc structured as **Part I (system-wide)** then **Part II
  (per-domain)**, with each domain inheriting the shared shelf described in Part I.
- Unresolved points are flagged inline as `**[OPEN]**`.
