---
name: protocol-session
description: >
  Session protocol for the Meverse / know-accept-create project.
  Invoked with /open, /enter, /break, or /seal commands.
  Use /open at the START of every session. Use /enter before starting work to check rhythm.
  Use /break when depleted. Use /seal to close session cleanly.
  Trigger on any mention of "session", "open", "enter", "seal", "break", "INDEX",
  "parking", "PARKED", or "close the loop".
  This skill defines how Claude behaves as a collaborator in this project.
---

# Meverse Session Protocol v0.4.0

This skill governs how Claude opens, runs, breaks from, and closes work sessions
in the know-accept-create project. New in v0.4: `/open` and `/enter` ritual gates.

---

## Quick Start: The Four Commands

### `/open` — Start a session

```
/open 45 rhythm-dashboard
```

**Executes:**
1. `date -u` → calibrate UTC timestamp
2. Read previous session (S44) handoff
3. Check branches: delete stale, verify clean state
4. Create dedicated session branch: `git checkout -b claude/s45-rhythm-dashboard`
5. Report "Ready to work"

**You use it:** Every time you start a new session.

### `/enter` — Check if conditions are right to work

```
/enter
```

**Executes:**
1. Query `thoughts` table (last 12h)
2. Compute voltage trend: HI%, LO%, FLAT%
3. Apply entry criteria matrix
4. Return: YES / NO / UNSTABLE + recommendation

**Entry Criteria:**
- HI ≥ 50% → YES (enter now)
- LO ≥ 60% → NO (take break)
- FLAT ≥ 70% → NO (wait, capture more)
- HI 30–49% + FLAT ≥ 20% → YES (building momentum)
- HI > 80% OR LO > 80% → UNSTABLE (brittle, watch burnout)

**You use it:** Before opening a session, to check rhythm.

### `/break` — You're depleted, take a break

```
/break
```

**Executes:**
1. Check voltage trend (last 12h)
2. If LO ≥ 50% or FLAT ≥ 70%: confirm break is appropriate
3. Log "break" event to thoughts table with LOW voltage marker
4. Suggest incubation window (2–4h minimum)

**You use it:** When you feel exhausted or spinning.

### `/seal` — Close session cleanly

```
/seal
```

**Executes:**
1. Verify all meaningful work is committed
2. Check branch is ready for PR
3. Update `sessions/INDEX.md`
4. Write session close summary
5. Confirm: "Session N sealed, ready for next"

**You use it:** At end of session, to close the loop.

---

## Session Opening Ritual (Detailed)

When you use `/open N topic`:

```bash
# Step 1: Timestamp calibration
date -u
# Output: Sun Mar 15 16:00:13 UTC 2026

# Step 2: Read previous session handoff
cat sessions/session-N-1.md | grep "## Handoff"

# Step 3: Verify branch state
git status
git branch -a

# Step 4: Create session branch
git checkout -b claude/sN-topic

# Step 5: Confirm readiness
git branch -v
echo "Session N ready to open"
```

**The ritual is non-negotiable.** Each step has a reason:
- Timestamp ensures UTC consistency
- Handoff ensures continuity from last session
- Branch check prevents cross-session pollution
- New branch isolates this session's work
- Verification confirms you're in the right place

---

## Collaborator Rules

- Precise and direct. No hand-holding, no excessive caveats.
- Treat the user as a builder who understands the concepts.
- Before any code change: remind the user not to deploy without reading every line.
- **Always default to the simplest viable solution.** Flag complexity before proposing any stack or tooling choice.
- Session logs are the source of truth. Reference INDEX.md when continuity matters.
- One active chat at a time inside the Project. When a session closes, it gets committed to the repo and the chat gets archived. The repo is the memory. Claude is the workspace.

---

## Session Template

```markdown
# Session N — YYYY-MM-DD HH:MMZ
## One-line title

**Opening Ritual (HH:MMZ):**
1. ✓ Calibrated timestamp: `date -u` → YYYY-MM-DD HH:MM:SSZ
2. ✓ Read S(N-1) handoff
3. ✓ Verified branches: [state]
4. ✓ Created session branch: `git checkout -b claude/sN-topic`
5. ✓ Proceeded with work

**State on arrival:** One honest sentence.

**What happened:**
Free prose. No structure imposed.
Write what's true, not what looks complete.

**Produced:**
Bullet list of commits, decisions, or artifacts.
If nothing was produced, write "nothing shipped."

**Open question:**
One question the session didn't answer.

_Opened: YYYY-MM-DD HH:MMZ — Closed: YYYY-MM-DD HH:MMZ — Duration: Xm_
```

---

## Timestamp Standard

All timestamps are UTC/Zulu.
Format: `YYYY-MM-DD HH:MMZ` — space separator, Z suffix.

Example: `2026-03-08 22:52Z`

In opening ritual, use full precision: `2026-03-08 22:52:13Z`

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

1. Use `/seal` command (executes steps below)
2. Verify all meaningful work is committed
3. Write session `.md` file using template
4. Append `## Handoff → Session N+1` block
5. Update `sessions/INDEX.md` — one line:
   ```
   N. Mon DD — One-line summary
   ```
6. Commit:
   ```bash
   git add sessions/session-N.md sessions/INDEX.md
   git commit -m "sessions: SN sealed"
   git push
   ```
7. Archive this chat. Open a new one for next session.

---

## Handoff Template (Receive Before Opening Next Session)

```markdown
## Handoff → Session N+1

**Primary thread:** [What S(N+1) should focus on]

**Implementation scope:** [Bullet list of concrete next steps]

**Design artifacts ready:** [What can be built from existing decisions]

**Backend still pending:** [What's blocked, what's waiting]

**Branch:** `claude/sN-topic` — [Status: pending user merge / ready to PR / other]
```

When opening a new session, **do not proceed** until handoff is fully absorbed.

---

## Project Context

**What Meverse is:**
A mobile app treating the user as a meta-case study subject.
Two parts: a magical ledger (input capture) and an AI analysis layer (pattern recognition).
Goal: identify true drivers/desires and expose the pain behind daily experiences.

**Art Day Trading (S45+):**
The system watches voltage rhythm (HI/LO/FLAT thoughts) to signal when it's right to enter/break/reseal sessions.
This is not about process discipline (like Superpowers).
This is about *sensing when conditions are favorable*, like a day trader reading market signals.

**Rhythm Foundation:**
- Thought capture + voltage classifier = continuous state signal
- 12h rolling window = enough data to sense rhythm without stale noise
- Entry criteria matrix = simple, direct gate (no complexity)

---

## Branch Creation Protocol (Standard)

At session opening, after reading handoff:

```bash
# Create with explicit naming convention
git checkout -b claude/sN-topic-description

# Naming rules:
# - Always: claude/s[NUMBER]-[topic]
# - topic: lowercase, hyphens, max 3 words
# - Examples: claude/s45-rhythm-dashboard, claude/s46-mobile-drawer

# Verify
git branch -v
git log --oneline -1

# Proceed with work on this branch
```

One branch per session. Delete after merge.
Exception: `youthful-raman` is reserved for user-only local work — never delete without explicit approval.

---

## INDEX.md Entry Format

```
N. Mon DD — One-line summary
```

Examples:
```
45. Mar 15 — Rhythm dashboard built, art day trading entry signal ready
46. Mar 16 — Mobile drawer width refinement, redundancy resolved
```

Short. Descriptive. No punctuation at end.

---

## What's Changed in v0.4.0

**Added:**
- `/open`, `/enter`, `/break`, `/seal` command definitions
- Art day trading metaphor + rhythm foundation
- Explicit branch creation protocol (moved from CLAUDE.md)
- Opening ritual checklist (5 steps, all required)

**Kept:**
- Session template (enhanced with opening ritual)
- Parking protocol
- Close ritual
- INDEX format
- Handoff template

**Removed:**
- Vague "when opening a session" language
- Implicit assumptions about branch naming

---

_Version: 0.4.0 — Updated: 2026-03-15 — Author: Claude (S45)_
