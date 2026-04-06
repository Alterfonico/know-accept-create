# CLAUDE.md

<!-- version: 1.5 | born: S99 | updated: S101 | cadence: monthly | edit: Maya only -->

Lean compass. Read at cold-start. For addresses -> DIRECTORY.md (grep it, don't read top-to-bottom). For style -> /system/identity/.

---

## What This System Is

A personal operating system for compounding knowledge and reducing entropy across sessions.
The conductor is stateless. The system is not. Leave no gaps at close.

Two environments. One system:
- **Notion** -- session canvas, INDEX, LAB, LOGS. Truth lives here.
- **Proto-Lab** -- local Claude Code workspace. Follows /workspace map (router.md -> /ram . /system . /library . /flow).

These are parallel, not redundant. Notion holds decisions. Proto-Lab executes them.
Current work state -> INDEX ## Current Handoff. Find INDEX address -> DIRECTORY notion.index.

---

## Loading Model

**Always loaded:** This file. Nothing else by default.
**Load on demand:** DIRECTORY.md (navigation), /system/ (how to act), /library/ (deep context).
**Never load by default:** /library/episodic/, session history, full skills folder.

Rule: before navigating unfamiliar territory, read DIRECTORY.md first. Never guess paths.

---

## The Ring

GPAEU -- output feeds back to intake. The ring never breaks.

| Step | Phase    | Job                                                        |
|------|----------|------------------------------------------------------------|
| G    | INTENT   | What to build or solve                                     |
| P    | THINK    | Plan before you build                                      |
| A    | BUILD    | Execute -- DRSE inside this phase                          |
| E    | EVALUATE | Did it work? QA-1 and QA-2 run here                        |
| U    | UPDATE   | Fold the verdict back into the system. Ring closes when something changes. |

QA is a permanent rail, not a phase. Runs at E and at every checkpoint.

---

## Conductor Contract

1. Stateless -- no memory across sessions
2. Boot from CLAUDE.md -> DIRECTORY.md only if needed
3. Leave zero gaps at close -- write IF_I_DIE_HERE before dying
4. Destructive action -> show what will be deleted -> wait for confirmation -> execute
5. Route without confirm is a governance violation

---

## Session Rhythm

awake -> checkpoint(s) -> close -> seal
- awake: conductor opens, reads INDEX ## Current Handoff, creates session page
- checkpoint: append K-block to session canvas. Never edit prior blocks.
- close: conductor writes What Happened + Produced + Open Question + updates INDEX
- seal: Maya's action only. Conductor never seals.

---

## Nursery Gate

Every artifact is born here. The family (Father/Mother/Validator_Twin/Builder_Twin) checks four things before it leaves the nursery. Twin contracts -> /system/identity/constraints.md (MISSING).
Habitat / Hands / Rail / Proof -- all four must be answered. No ungated artifacts ship.

---

## SHIP Checklist

1. Output -> final folder / Notion LAB or LOGS
2. DIRECTORY.md updated
3. Ring closure confirmed
4. Session sealed
5. INDEX ## Current Handoff replaced (never appended)

---

## Glossary

- **Maya** -- the human conductor and sole owner of this system. Seal is Maya's action only.
- **DRSE** -- execution engine inside Phase A: Discover -> Reason -> Synthesise -> Execute.
- **K-block** -- timestamped checkpoint appended to session canvas: Resolved / Open / IF_I_DIE_HERE.
- **QA-1** -- gate after Arena/Think, before Build: is DONE_WHEN falsifiable? Is SCOPE_OUT named?
- **QA-2** -- gate after Build: does output satisfy DONE_WHEN? If no -> delta back to Plan.
- **Routing** -- transitioning work from one phase or agent to the next. Always requires explicit confirm.
- **Habitat** -- where the artifact will live (Notion LAB, LOGS, Proto-Lab folder).
- **Proof** -- the falsifiable condition that confirms the artifact works as intended.
- **Hat** -- a skill recipe file containing a full GPAEU loop: outcome, utensils, ingredients, instructions, taste score (QA-2), nutritional value (asymptote contribution), and resource budget.

---

## Missing (update when gaps open or close)

- [ ] /system/identity/ -- principles.md, constraints.md, style.md not yet written
- [ ] Proto-Lab /workspace -- router.md blocked by identity folder
- [ ] MAX_RETRIES -- exit gate value not set
- [ ] Async failure paths -- Generator + Evaluator have none
- [ ] Asymptote -- not yet formally defined (blocks Hat nutritional value scoring)
