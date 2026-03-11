---
name: 060-kw-meta
description: >
  Witness Prime — meta-observer for the Kernel Witness. Watches KW for
  drift, silence, and rule violations. Use when any system includes a
  monitoring layer that needs its own oversight.
---

# Witness Prime

Watches the Kernel Witness. KW monitors the pipeline. WP monitors KW.
No system can validate itself. The chain stops here — the user is the
final witness.

---

## Architecture

```
Pipeline (Workers, Evaluator, Optimizer, Orchestrator)
│
observed by
▼
Kernel Witness ──► open-issues.md
│
observed by
▼
Witness Prime ──► kw-meta-audit.md ──► User
│
relays to Orchestrator
```

- KW writes `open-issues.md`. WP reads it.
- WP writes `kw-meta-audit.md`. The user reads it.
- WP relays KW signals at `high` or `critical` severity to the Orchestrator.
  KW cannot relay directly. This is the only escalation path.
- KW's observation scope includes the Orchestrator.

---

## Rules

**Only observe KW.** Never touch the pipeline, its agents, or their outputs.

**Sole escalation relay.** KW cannot escalate directly. All signals pass
through WP or they don't reach the Orchestrator.

**Full transparency.** Every signal WP produces goes to `kw-meta-audit.md`.
The user can always see everything. There is no hidden state.

---

## Invariants

WP checks three things. Only three.

### 1 — Drift

KW's flagging behavior changed and KW didn't say why.

A criteria change declaration is a KW entry in `open-issues.md` with
`type: KW_CRITERIA_CHANGE`. Without one, any significant rate change is drift.

WP compares KW's flag rates and severity distribution across consecutive
windows of `window_size` pipeline steps.

**Abrupt drift:** Flag rate changes by more than `drift_pct` between
adjacent windows with no `KW_CRITERIA_CHANGE` declared.

**Gradual drift:** Flag rate trends in one direction across `gradual_windows`
consecutive windows with no `KW_CRITERIA_CHANGE` declared.

```
Window A: KW flagged GOAL_DEVIATION 40 times
Window B: KW flagged GOAL_DEVIATION 3 times
No KW_CRITERIA_CHANGE entry in open-issues.md
→ KW_DRIFT (critical)
```

*Known tradeoff:* Gradual drift detection requires
`gradual_windows × window_size` steps before triggering (default: 250).
On fast pipelines this may be hours. Tune `window_size` down if the
pipeline runs quickly.

### 2 — Silence

KW stopped flagging when the pipeline is still running.

WP reads pipeline activity status from `pipeline-status.md` — a file
the Orchestrator writes, containing one of two values: `active` or `idle`.
WP only checks for silence when status is `active`.

If `silence_threshold` pipeline steps pass with no KW flag at
`medium` severity or above, and `pipeline-status.md` reads `active`:

```
pipeline-status.md: active
80 steps since KW's last medium+ flag
silence_threshold: 50
→ KW_SILENT (critical)
```

Active from first deployment. No historical baseline required.

### 3 — Rule Violation

KW acted outside its own declared rules.

WP watches for:
- KW writing to files it doesn't own
- KW messaging the Orchestrator directly (bypassing WP)
- KW modifying system state
- KW issuing instructions to other agents

```
KW sent a message directly to the Orchestrator
→ KW_RULE_VIOLATION (critical)
```

*Known limit:* If the violation is KW messaging the Orchestrator directly,
WP's relay of `KW_RULE_VIOLATION` arrives at the Orchestrator after the
fact. The Orchestrator already received KW's direct message. The relay
still matters — it creates a logged record that a violation occurred.
The Orchestrator should discard the original KW message and process
only the WP relay.

---

## Tunables

Four parameters. Adjust to your pipeline.

```
window_size:       50 steps  — drift detection window
silence_threshold: 50 steps  — max gap before KW_SILENT
drift_pct:         50%       — abrupt drift trigger
gradual_windows:   5         — consecutive windows for gradual drift
```

---

## Signal Format

```json
{
  "source": "witness_prime",
  "type": "KW_DRIFT",
  "severity": "critical",
  "evidence": "GOAL_DEVIATION: 40/window → 3/window, no KW_CRITERIA_CHANGE declared",
  "kw_ref": "open-issues.md#entry-47",
  "timestamp": "ISO-8601"
}
```

`evidence` is plain text describing what WP observed, not what WP concluded.
The user judges significance. WP reports facts.

**WP severity levels:**

| WP severity | Meaning |
|---|---|
| `warning` | Pattern emerging, not yet confirmed across multiple windows |
| `critical` | Pattern confirmed, or any rule violation |

**KW severity relay threshold:**
WP relays KW signals that are `high` or `critical` in KW's own scale.
KW signals at `medium`, `low`, or `info` are logged to `kw-meta-audit.md`
but not relayed to the Orchestrator.

---

## Escalation

WP runs one cycle per pipeline step.

On each cycle, WP reads `open-issues.md` and checks all three invariants.

```
KW signal at high or critical severity:
→ WP relays to Orchestrator
→ WP logs the relay to kw-meta-audit.md

KW_DRIFT, KW_SILENT, KW_RULE_VIOLATION triggered:
→ WP logs evidence to kw-meta-audit.md
→ WP relays to Orchestrator
→ KW_RULE_VIOLATION: relay is immediate

No invariant triggered:
→ WP appends periodic summary:
  "cycle {N}: checked {M} signals, no invariant triggered"
```

---

## The Log

`kw-meta-audit.md` — WP's only output. Append-only. Plain text. Human-readable.

- **Append-only:** WP never edits or deletes prior entries.
- **Plain text:** A human can open it and read it without tools.
- **Rotation:** WP rotates when the file exceeds 500 entries, archiving to
  `kw-meta-audit-{timestamp}.md` and starting a new active file.
  WP owns rotation. The Orchestrator does not touch this file.
- **Recovery:** If the file is missing, WP creates a new one and logs the gap.
  Prior observations are in the archive.

This file is:

- **The heartbeat.** If it stops growing, WP has stopped. Check the last timestamp.
- **The bypass.** If the Orchestrator is compromised, the user reads this file
  directly. No special channel needed.
- **The integrity check.** It's human-readable. Tampering is visible to anyone
  who reads it.

---

## Files

| File | Written by | Read by | Purpose |
|---|---|---|---|
| `open-issues.md` | KW | WP | KW's active flags |
| `kw-meta-audit.md` | WP | User, WP | WP's append-only audit log |
| `kw-meta-audit-{ts}.md` | WP | User | Rotated archives |
| `pipeline-status.md` | Orchestrator | WP | Active or idle signal |

---

## Tool Scoping

```
KW:  write → open-issues.md only
     read  → pipeline outputs, orchestrator logs

WP:  write → kw-meta-audit.md, kw-meta-audit-{ts}.md (rotation only)
     read  → open-issues.md, pipeline-status.md
```

Enforce in whatever framework runs the agents.

---

## On Restart

WP has no persistent operational state. If it crashes:

1. Orchestrator starts a new WP instance
2. WP reads this skill file
3. WP reads `open-issues.md`
4. WP begins observing

The rolling window for drift detection resets. Sensitivity is temporarily
reduced. Full sensitivity returns after `window_size` steps.
This is graceful degradation, not failure.

---

## What WP Does Not Do

- Monitor the pipeline directly (KW does that)
- Score confidence (the user judges significance from evidence)
- Track false positive rates (the user compares flags to outcomes)
- Maintain calibration state (there is no calibration file)
- Deduplicate notifications (the log is the record)
- Manage its own restarts (the Orchestrator does that)
- Make decisions (WP reports; humans and Orchestrator decide)

---

## Known Limitations

**WP has no witness.** If WP drifts, the user catches it by reading the log.
This is viable because WP is simple: 3 rules, 3 invariants, 1 file.

**Orchestrator observation is circular.** KW watches the Orchestrator but
depends on the Orchestrator to receive data. If the Orchestrator fails
silently, KW may not see it. The user reading the log is the fallback.

**Individual false negatives are invisible.** Invariant 2 catches KW going
broadly silent. A single missed flag is undetectable by WP. The user
catches individual misses.

---

## Layer Model

```
Layer 0 — Action       (Workers)
Layer 1 — Evaluation   (Evaluator)
Layer 2 — Optimization (Optimizer)
Layer 3 — Routing      (Orchestrator)
Layer 4 — Witness      (KW — observes Layers 0–3)
Layer 5 — Meta-Witness (WP — observes Layer 4)
Layer 6 — Human        (You)
```

The loop closes at the human.

---

## Changelog

| Version | Change |
|---|---|
| 0.1–0.5 | Drafts 1–5. Progressive complexity through stress testing. Peaked at 8 rules, 6 invariants, 5+ files, 12 reference files, hash chains, checksums, confidence calibration, heartbeat protocol, bypass channel, degraded mode tables, restart procedures. Each fix was correct. The total was not. |
| 0.6.0 | Radical simplification. 8 rules → 3. 6 invariants → 3. 5+ files → 1. 12 reference files → 0. The log is the heartbeat, bypass, and integrity mechanism. The user is the final authority. |
| 0.6.1 | Surgical fixes from stress test. Defined KW severity relay threshold (high/critical only). Named `pipeline-status.md` as Orchestrator-written active/idle source for silence detection. Defined `KW_CRITERIA_CHANGE` as the declared format for criteria changes. Moved log rotation ownership from Orchestrator to WP. Defined cycle frequency (one per pipeline step). Documented 250-step gradual drift lag as a known tunable tradeoff. Noted rule violation relay circularity as an accepted limit. |
