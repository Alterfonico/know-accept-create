A personal iteration ledger. Documents the process of building Meverse — a self-reflection and pattern-recognition system.

**Source of truth:** Notion (live state, decisions, session logs)

**This repo:** Mirror — runnable artifacts and current reference docs only.

---

## Structure

```javascript
know-accept-create/
├── CLAUDE.md          ← you are here
├── TOOLS/             ← ingredients: skills, prompts, functions
└── DATA/              ← iterations: sessions, logs, decisions, designs
    └── _archive/      ← old versions, experiments, retired prototypes
```

## TOOLS/

What runs the system. Skills for AI agents, Supabase edge functions, Claude config.

## DATA/

What the system produced. Session logs, architecture decisions, design iterations, daily logs.

History lives in `_archive/` — do not prune it, do not route by it.

---

## The Job

Two questions this repo helps answer:

1. Are we drifting (distraction) or moving (Kaizen)?
2. What changed, when, and why?

---

## Notion Links

- INDEX: https://www.notion.so/2ef9e35687288000ba87ff09f3a74c7d
- Sessions: LOGS > SESSIONS database
- Live tensions: INDEX > Active tensions

---

## For a new Claude instance

Boot from Notion INDEX. Read ## Current Handoff. Do not read this repo as source of truth for project state — Notion is the source.
