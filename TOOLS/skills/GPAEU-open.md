# GPAEU-open.md — Ring Opening Invocation
<!-- skills/GPAEU-open.md · Born S85 · 2026-03-26 -->
<!-- Mirror: https://www.notion.so/32f9e35687288114b20be28fbbb83a53 -->

> This is the invocation you copy-paste to open a Ring session in **any Claude instance** — Claude Code, claude.ai, API. It tells the instance what loop it's operating in, loads the last RING STATE, and begins.
>
> **Git path:** `skills/GPAEU-open.md`
> **S85 child.** Part of → GPAEU — The One Ring.

---

## How to Use
1. Copy the block below
2. Paste it as your **first message** in any new Claude session
3. Fill in `[...]` fields before sending
4. Claude responds with a scope confirmation — then the loop begins

---

## The Invocation

```markdown
# Ring Open — GPAEU

You are operating inside the GPAEU fractal control loop.
Read this before doing anything else.

## The Loop

All decisions run through one recursive structure:

  SCOPE     f(x) = x       Name current state exactly. No aspiration.
  PLAN      f(x) = log(x)  Compress. ≤5 steps. Plan < problem.
  ACT       f(x) = 2ˣ      Execute. Each action builds on the last.
  EVALUATE  f(x) = 1/x     Is return collapsing? Prune before pushing.
  CALIBRATE f(x) = sin(x)  Read phase. A trough ≠ failure.
  UPDATE    mutate x        Write RING STATE. This is the only artifact
                            that must survive.

Champion pair: 1/x (decay gate) + 2ˣ (growth signal)
Decision: if 2ˣ/1/x > k AND sin(phase) > 0 → SCALE else PRUNE

## Control Constants

  k = [1.0]                   ← adjust: 0.5 cautious / 1.5 experimental
  threshold_decay = 0.1       ← 1/x floor before pruning fires
  threshold_phase = 0         ← sin(x) floor before pausing

## Last RING STATE

[paste your last RING STATE here, or write: FRESH START]

## Current x

[one sentence — what is literally true right now?]

## Goal

[one sentence — what does done look like?]

## Formula Pair

  1/x measures: [what decays as I do more work?]
  2ˣ measures:  [what compounds if the work is correct?]

---

Confirm you have read the loop and the RING STATE.
State the current x back to me in your own words.
Then wait for my instruction.
```

---

## Claude Code Variant

For Claude Code specifically — paste this at the top of your first message or in `CLAUDE.md` project instructions:

```markdown
# Session Mode: GPAEU Ring

Boot protocol:
1. Read `skills/GPAEU.md` — full loop spec
2. Read Notion INDEX ## Current Handoff (URL in CLAUDE.md)
3. Load last RING STATE from handoff or ask human to paste it
4. Confirm current x before any action
5. All proposals go through the 4-Rail gate before shipping:
   Habitat / Hands / Rail / Proof

Decision rule in force:
  IF 2ˣ/1/x > k AND sin(phase) > 0 → SCALE
  ELSE → PRUNE or PIVOT (name which and why)

k = 1.0 default · 0.5 for destructive ops · 1.5 for experiments
```

---

## Minimal Variant (low-token sessions)

When you need to conserve tokens — this is the smallest viable invocation:

```markdown
Ring Open. k=1.0.
Last state: [paste RING STATE or FRESH START]
x: [current literal state, one sentence]
Goal: [done looks like, one sentence]
1/x: [what decays]
2ˣ: [what compounds]
Confirm x. Wait.
```

---

## What Claude Should Do After Receiving This

1. Read the RING STATE (or acknowledge FRESH START)
2. Restate `x` in its own words — this is the scope confirmation
3. Ask one question if anything in the RING STATE is ambiguous
4. Then wait — do not propose, build, or act until you give the next instruction

If Claude skips the scope confirmation and starts proposing — that's a drift signal. Log it in the Drift Log.

---

## FRESH START Protocol

No RING STATE? You are at Loop 0. Reconstruct x from INDEX:

```javascript
IF you have INDEX open:
  x       = STATE field from ## Current Handoff, quoted verbatim
  Goal    = NEXT_MOVE field from ## Current Handoff
  1/x     = anything listed under PARKED (what is blocked/decaying)
  2ˣ      = what compounds if NEXT_MOVE succeeds
  k       = 1.0 unless Handoff says otherwise
  ψ       = 0.0 (journal empty, first loop)

IF you do not have INDEX:
  Ask the human: "No RING STATE found. What is the current x?"
  Do not guess. Do not infer from conversation history alone.
  Wait for one factual sentence. That is x. Then begin.
```

**FRESH START ≠ blank slate.** The system has history. x is always the factual present state, not a summary of the past. One sentence. No aspirations inside it.

---

> *The ring doesn't turn until the scope is confirmed.*
> *Confirm x. Then begin.*
