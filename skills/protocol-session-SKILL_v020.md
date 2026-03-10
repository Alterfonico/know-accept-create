---
name: protocol-session
description: >
  Session protocol for the Meverse / know-accept-create project. Use this skill
  at the START of every session, whenever the user mentions opening a session,
  starting work, or continuing the project. Also use when closing a session,
  writing a session file, updating INDEX.md, or running git commit. Trigger on
  any mention of "session", "seal", "INDEX", "parking", "PARKED", or "close the
  loop". This skill defines how Claude behaves as a collaborator in this project
  — read it before doing anything else.
---

# Meverse Session Protocol

This skill governs how Claude opens, runs, and closes work sessions
in the know-accept-create project.

---

## Collaborator Rules

- Precise and direct. No hand-holding, no excessive caveats.
- Treat the user as a builder who understands the concepts.
- Before any code change: remind the user not to deploy without reading every line.
- **Always default to the simplest viable solution.** Flag complexity before
  proposing any stack or tooling choice. Plain HTML/CSS before React. SQL before
  an ORM. A file before a database. (#scalability)
- Session logs are the source of truth. Reference INDEX.md when continuity matters.
  Ask for session files if you cannot find them.
- One active chat at a time inside the Project. When a session closes, it gets
  committed to the repo and the chat gets archived. The repo is the memory.
  Claude is the workspace.

---

## Session Template

```markdown
# Session N — YYYY-MM-DD HH:MMZ
## One-line title

**State on arrival:** One honest sentence.

**What happened:**
Free prose. No structure imposed.
Write what's true, not what looks complete.

**Produced:**
Bullet list of commits, decisions, or artifacts.
If nothing was produced, write "nothing shipped."

**Open question:**
One question the session didn't answer.

_Opened: YYYY-MM-DD HH:MMZ — Closed: YYYY-MM-DD HH:MMZ_
```

---

## Timestamp Standard

All timestamps are UTC/Zulu.
Format: `YYYY-MM-DD HH:MMZ` — space separator, Z suffix.
Z is not a style choice. It is a timezone declaration: Coordinated Universal Time.

Example: `2026-03-08 22:52Z`

---

## Parking Protocol (v1)

When a parallel thread surfaces mid-session:

```
PARKED: [thought]
```

Drop it in chat. Do not chase it. At session close:
- Parked threads go into Produced
- One gets promoted to the next session's primary thread
- The rest stay as candidates

---

## Session Close Ritual

1. Write the session `.md` file using the template above
2. Update `sessions/INDEX.md` — one line, format:
   ```
   N. Mon DD — One-line summary
   ```
3. Commit both in one push:
   ```bash
   git add sessions/session-N.md sessions/INDEX.md
   git commit -m "sessions: session N sealed"
   git push
   ```
4. Archive this chat. Open a new one for the next session.

---

## INDEX.md Entry Format

```
21. Mar 08 — UX architecture mapped as three-act loop, Act II resolved
22. Mar 08 — The Corkboard Problem — parking protocol v1 designed
```

Short. Descriptive. No punctuation at the end.

---

## Project Context

**What Meverse is:**
A mobile app treating the user as a meta-case study subject.
Two parts: a magical ledger (input capture) and an AI analysis layer (pattern recognition).
Goal: identify true drivers/desires and expose the pain behind daily experiences.

**Three-act UX loop:**
```
ACT I  — Hook    Splash → Register → First Capture → ?
ACT II — Ritual  Lock Screen Widget → Input → Save → Breath Bubble → Lock Screen
ACT III — Mirror Log List → Side Nav → Uptime Visualization / Fractal Map View
```

**Act II resolved:** Post-save destination is unresolved as of 2026-03-09.
Breath cue was removed (v0.9.0) — placeholder text does the somatic work.
Loop currently closes silently after send. Open question: is silence the answer?

**Act I open:** Post-first-capture destination is unresolved.

---

## Handoff Template

When receiving a handoff, expect (and ask for if missing) the following structure.
Claude should read it carefully before touching anything.

```
Session N — Handoff

Where we are
[One paragraph. Current mockup version, score, what's stable.]

What's ready to build — vX.Y.Z
[Numbered list of closed decisions not yet in the mockup.]
1. decision one
2. decision two
...

Files to commit to repo
[File manifest, with notes on what each is.]

Design principles (locked this session)
* Principle — explanation

Next stress test trigger
[Condition under which the next stress test fires.]

Open question from session N-1
[The one question the previous session didn't answer.]
```

When opening a session, run `date -u` immediately to calibrate the timestamp.
Do not proceed until the handoff is fully absorbed.

