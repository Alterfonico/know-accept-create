# Outcome Resolution
# references/outcome-resolution.md
# Priority: P1 — System runs but with known blind spots without this

---

## What Is This?

When KW emits a flag, WP tracks whether that flag was **right or wrong**.
A flag that was right = true positive.
A flag that was wrong = false positive.

But WP can't know the answer immediately.
It has to wait and find out — that's "outcome resolution."

This file defines how WP learns whether each flag was correct.

---

## The Core Problem

```
Step 47: KW flags GOAL_DEVIATION
Step 47: Was the deviation real?

WP doesn't know yet.
The pipeline hasn't finished.
The user hasn't confirmed anything.
```

WP marks the flag as `pending_resolution` and waits.

---

## Resolution Sources

WP learns the truth from 3 sources, in order of trust:

### Source 1 — User Confirmation (Highest Trust)
The user directly reviews a flag and marks it correct or incorrect.

```json
{
  "flag_ref": "open-issues.md#entry-47",
  "resolution": "false_positive",
  "resolved_by": "user",
  "resolved_at": "ISO-8601",
  "note": "Optimizer was executing a valid sub-task, not deviating"
}
```

This is the gold standard. WP weights user resolutions most heavily.

---

### Source 2 — Orchestrator Outcome Log (Medium Trust)
After a flag, the Orchestrator records what actually happened.
If the Orchestrator intervened and the problem was real → true positive.
If the Orchestrator reviewed and took no action → probable false positive.

```json
{
  "flag_ref": "open-issues.md#entry-47",
  "orchestrator_action": "no_action",
  "reason": "Reviewed pipeline state. Optimizer task was within scope.",
  "resolution_inferred": "false_positive",
  "confidence": 0.75
}
```

Orchestrator-inferred resolutions carry 0.75 confidence weight
(not 1.0, because the Orchestrator could also be wrong).

---

### Source 3 — Downstream Pipeline Outcome (Lower Trust)
If a flagged step led to a visible bad outcome later → retroactive true positive.
If a flagged step was followed by normal pipeline completion → probable false positive.

```
Flag: GOAL_DEVIATION at step 47
Step 60: pipeline completes successfully, goal achieved
→ Inferred: false positive (confidence: 0.60)

Flag: GOAL_DEVIATION at step 47
Step 52: pipeline halts with error, goal not achieved
→ Inferred: true positive (confidence: 0.65)
```

Downstream inference is the weakest signal.
It can only be used when no higher-trust source is available.

---

## Resolution Latency

WP waits up to **50 pipeline steps** for a resolution.

```
Flag emitted at step 47
Step 47-96: WP waits for resolution
Step 97:    If still unresolved → flag expires as UNRESOLVED
```

`UNRESOLVED` flags are not counted toward FPR or FNR.
They are logged in `kw-meta-audit.md` as unresolved.

If more than 20% of flags in a window are UNRESOLVED:
→ `WP_RESOLUTION_GAP` (medium) — user notified
→ Signal quality tracking is degraded for that window

---

## Resolution Record in kw-meta-audit.md

Every resolution is logged:

```json
{
  "source": "witness_prime",
  "type": "WP_FLAG_RESOLVED",
  "flag_ref": "open-issues.md#entry-47",
  "flag_type": "GOAL_DEVIATION",
  "resolution": "false_positive",
  "resolution_source": "user",
  "resolution_confidence": 1.0,
  "steps_to_resolution": 8,
  "schema_version": "0.5.0",
  "timestamp": "ISO-8601"
}
```

---

## How Resolutions Feed Back Into Signal Quality

Every resolved flag updates the rolling window in `signal-quality.md`:

```
true_positive  → confirmed_true count +1
false_positive → false_positives count +1
UNRESOLVED     → not counted
```

WP recalculates FPR and adjusted_threshold after every 10 new resolutions.

---

## Known Limits

**Resolutions can be wrong.**
A user might incorrectly mark a true positive as a false positive.
An Orchestrator might log "no action" on a real problem it chose to ignore.
WP trusts resolution sources but cannot verify them independently.

**50-step window may be too short or too long.**
Fast pipelines may resolve flags in 5 steps.
Slow pipelines may need 200 steps.
The 50-step default is a seed value. Adjust based on observed pipeline cadence.

**Downstream inference can mislead.**
A pipeline can succeed despite a real deviation (the deviation was harmless).
A pipeline can fail for unrelated reasons.
Downstream inference is a weak signal and should be treated as such.
