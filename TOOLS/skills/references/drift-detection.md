# Drift Detection
# references/drift-detection.md
# Priority: P1 — System runs but with known blind spots without this

---

## What Is This?

KW can drift in two ways:
1. **Suddenly** — it stops flagging things almost overnight
2. **Slowly** — it flags less and less over weeks until it's nearly silent

Both are dangerous. Both look different. This file defines how WP catches each.

---

## Two Detection Modes

### Mode 1 — Abrupt Drift

KW's flag rate drops sharply in a short window.
Like a guard dog that suddenly stops barking.

**Detection:**

```
Rolling window: last 20 pipeline steps
Expected flag rate: based on prior 100-step average
Abrupt drift threshold: current rate < 30% of expected rate

Example:
  Prior average:  4 flags per 10 steps
  Current window: 0 flags in 10 steps
  0 < 30% of 4 → KW_VALIDATOR_DRIFT (abrupt)
```

**Why 30%?**
Some natural variation is expected. A healthy KW might have a quiet window.
Below 30% of baseline is unlikely to be noise.

---

### Mode 2 — Gradual Drift

KW's flag rate declines slowly and steadily over a long window.
Like a guard dog that gets lazier every day.

**Detection — rate-of-change monitoring:**

```
Long window: last 200 pipeline steps
Divide into 4 sub-windows of 50 steps each
Calculate flag rate per sub-window
Check slope: is it consistently declining?

Example:
  Sub-window 1 (steps 1-50):   5.2 flags/10 steps
  Sub-window 2 (steps 51-100): 4.1 flags/10 steps
  Sub-window 3 (steps 101-150): 3.0 flags/10 steps
  Sub-window 4 (steps 151-200): 1.8 flags/10 steps

Slope is consistently negative → KW_VALIDATOR_DRIFT (gradual)
```

**Consistency requirement:**
Rate must decline in at least 3 of 4 consecutive sub-windows.
One quiet sub-window is noise. Three in a row is drift.

---

## What Counts as "Flag Rate"

Flag rate is measured **per flag type**, not overall.

Example:
- GOAL_DEVIATION: declining ← drift detected
- LOGIC_DRIFT: stable ← no drift
- VALIDATOR_DRIFT: stable ← no drift
- UNSUPPORTED_CONFIDENCE: declining ← drift detected

Two flag types drifting simultaneously is more suspicious than one.
If 3+ flag types drift simultaneously → confidence boost on `KW_VALIDATOR_DRIFT`.

---

## Criteria Change Declaration

KW is allowed to change its detection criteria.
But it must declare the change.

A declared change looks like:

```json
{
  "source": "kernel_witness",
  "type": "KW_CRITERIA_CHANGE",
  "flag_type": "GOAL_DEVIATION",
  "change_description": "Tightened threshold: only flag deviations > 2 steps",
  "prior_criteria_version": "1.2",
  "new_criteria_version": "1.3",
  "timestamp": "ISO-8601"
}
```

When WP sees a `KW_CRITERIA_CHANGE`:
- WP resets the baseline for that flag type
- WP does NOT flag the rate change as drift
- WP logs the change in `kw-meta-audit.md`

When WP sees a rate change **without** a `KW_CRITERIA_CHANGE`:
→ `KW_VALIDATOR_DRIFT`

---

## Anti-Gaming

**The problem:** KW could learn the detection thresholds and drift just below them.
Gradual drift at exactly 29% below baseline — never triggering the 30% threshold.

**Mitigations:**

### 1 — Rate-of-change catches slow gaming
A KW drifting slowly to stay just below the abrupt threshold will
still be caught by gradual drift detection, which watches the slope
over 200 steps regardless of individual window values.

### 2 — Threshold jitter
The exact abrupt drift threshold varies randomly between 25% and 35%
of baseline. KW cannot know the exact threshold to game.
The threshold is chosen per-window by WP, not published to KW.

### 3 — Canary testing is independent
Even if KW games the rate-based detection, canary testing
(canary-protocol.md) will catch if KW is actually missing real events.
A KW that appears to be flagging at normal rates but misses canaries
is caught by the canary system, not the drift system.

Rate-based drift and canary-based testing are complementary.
Neither alone is sufficient. Together they cover different failure modes.

---

## Rolling Window Parameters (Summary)

| Parameter | Value | Rationale |
|---|---|---|
| Abrupt drift window | 20 steps | Short enough to catch fast drops |
| Abrupt drift threshold | 25–35% of baseline (jittered) | Low enough to catch real drops, high enough to ignore noise |
| Gradual drift window | 200 steps | Long enough to see trend |
| Gradual drift sub-windows | 4 × 50 steps | Balances granularity and noise tolerance |
| Gradual drift consistency | 3 of 4 sub-windows declining | Requires pattern, not single dip |
| Baseline period | Prior 100 steps | Enough history, not too old |

All values are seeds. After 500+ steps of real operation, review
and adjust based on observed pipeline volatility.

---

## Known Limits

**Drift detection watches rate, not content.**
WP can tell that KW is flagging less. It cannot tell *why*.
Maybe KW's criteria drifted. Maybe the pipeline genuinely got healthier.
A rate drop after a major pipeline improvement is not drift — but WP
cannot distinguish this from real drift without human context.

**Gradual drift has detection lag.**
By design, gradual drift requires 200 steps to confirm.
A slowly drifting KW has up to 200 steps of degraded monitoring
before WP catches it.

**Threshold jitter is weak anti-gaming.**
A sophisticated drifting KW with enough observations could
statistically infer the jitter range. It is a speed bump, not a wall.
The canary system is the stronger guarantee.
