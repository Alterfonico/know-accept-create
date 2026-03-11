# Calibration Specification
# references/calibration-spec.md
# Priority: P2 — System runs with reasonable defaults without this

---

## What Is This?

WP starts with guessed confidence values (seeds).
Over time it replaces guesses with real numbers based on what actually happened.
This file defines exactly how that replacement works.

---

## Seed Values (Starting Point)

When WP runs for the first time, it uses these:

| Corroborating signals | Starting confidence |
|---|---|
| 1 invariant triggered | 0.55 |
| 2 invariants triggered | 0.72 |
| 3+ invariants triggered | 0.88 |
| + Pattern seen before | +0.08 |
| + Another agent agrees | +0.07 |
| + Repeated 3+ times | +0.08 |
| Hard cap | 0.97 |

These are educated guesses, not measured values.
They get replaced after the first calibration cycle.

---

## When Recalibration Triggers

```
Trigger 1: 100 resolved flags accumulated (whichever comes first)
Trigger 2: 30 days since last calibration
Trigger 3: User requests recalibration manually
Trigger 4: KW_SIGNAL_DEGRADED fires on any flag type
```

Trigger 4 forces an early recalibration because degraded signal quality
means the current confidence values may be contributing to the problem.

---

## How New Values Are Calculated

For each flag type, WP looks at resolved flags and computes:

```
precision = confirmed_true / (confirmed_true + false_positives)

Example:
  GOAL_DEVIATION: 7 true, 5 false positive
  precision = 7 / 12 = 0.583
```

New base confidence for that flag type = `precision × 0.90 + 0.05`

The formula:
- Scales precision into the range [0.05, 0.95]
- Never lets confidence reach 0 or 1 (both are epistemically overconfident)
- Applies a slight conservative discount (× 0.90) because past performance
  doesn't guarantee future accuracy

```
Example:
  precision = 0.583
  new base confidence = 0.583 × 0.90 + 0.05 = 0.575
```

---

## What Gets Updated

WP updates `kw-calibration.json` with new per-flag-type base confidences.
The corroboration bonuses (+0.08, +0.07, +0.08) are not recalibrated —
they are structural and remain as seeds indefinitely.

Only the base confidence per flag type changes.

---

## Recalibration Record

Every recalibration is logged to `kw-meta-audit.md`:

```json
{
  "source": "witness_prime",
  "type": "WP_RECALIBRATION",
  "trigger": "100_resolved_flags",
  "flags_used": 100,
  "prior_values": {
    "GOAL_DEVIATION": 0.55,
    "LOGIC_DRIFT": 0.55
  },
  "new_values": {
    "GOAL_DEVIATION": 0.575,
    "LOGIC_DRIFT": 0.61
  },
  "schema_version": "0.5.0",
  "timestamp": "ISO-8601"
}
```

The user can read this log to see how WP's accuracy has evolved over time.

---

## Known Limits

**100 flags is a small sample.**
Confidence values after the first calibration are better than seeds
but still imprecise. Values stabilize after ~500 resolved flags per type.

**Calibration is per flag type, not per context.**
GOAL_DEVIATION in a coding pipeline may be different from
GOAL_DEVIATION in a data pipeline. WP does not distinguish contexts.
A single system with very different pipeline modes may need manual review.

**WP cannot recalibrate its own corroboration bonuses.**
The +0.08/+0.07/+0.08 bonuses are structural assumptions.
If they are wrong, WP has no mechanism to detect or correct them.
