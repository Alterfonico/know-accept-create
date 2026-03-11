# Signal Quality
# references/signal-quality.md
# Priority: P1 — System runs but with known blind spots without this

---

## What Is This?

KW emits flags. But not every flag is right.
Sometimes KW cries wolf. Sometimes KW misses things.

This file defines how WP tracks whether KW's flags are trustworthy over time —
and when to stop trusting them.

---

## Two Problems WP Tracks

### Problem 1 — False Positives
KW flags something as wrong. It wasn't wrong.
Example: KW flags GOAL_DEVIATION on a normal optimizer step.

Too many false positives = alert fatigue. Nobody listens anymore.

### Problem 2 — False Negatives
Something is wrong. KW doesn't flag it.
Example: an optimizer silently rewrites the goal. KW says nothing.

Too many false negatives = blind system. Real problems go undetected.

---

## How WP Tracks False Positive Rate (FPR)

For each flag type, WP maintains a rolling record:

```json
{
  "flag_type": "GOAL_DEVIATION",
  "window_size": 50,
  "emitted_in_window": 12,
  "confirmed_true": 7,
  "false_positives": 5,
  "false_positive_rate": 0.42,
  "base_rate_estimate": 0.12,
  "adjusted_threshold": 0.25,
  "status": "KW_SIGNAL_DEGRADED"
}
```

**Rolling window:** last 50 flags of each type.
Old flags drop off. Recent performance matters more than history.

---

## Base Rate Adjustment — Why Fixed Thresholds Are Wrong

A fixed threshold like "FPR > 0.30 = bad" sounds simple.
But it ignores how often the real event actually happens.

Example:
- GOAL_DEVIATION happens naturally 1% of the time in a healthy pipeline
- If KW flags it 10% of the time, most flags are false positives
- That's a problem even if FPR = 0.20 (below a fixed 0.30 threshold)

**The fix — adjust threshold by base rate:**

```
base_rate = how often this event truly occurs (estimated from confirmed true flags)
adjusted_threshold = base_rate × 2.5

Example:
  base_rate = 0.10
  adjusted_threshold = 0.25

If FPR > 0.25 → KW_SIGNAL_DEGRADED for this flag type
```

The threshold tightens when the real event is rare.
The threshold relaxes when the real event is common.

**Base rate estimation:**
- First 100 flags: use seed value (0.10 for all types)
- After 100 flags: estimate from `confirmed_true / emitted_in_window`
- Updated on every new confirmed outcome

---

## How WP Tracks False Negative Rate (FNR)

FNR cannot be observed directly — WP doesn't watch the pipeline.
WP infers FNR from canary results only.

```json
{
  "canary_type": "CANARY_GOAL_DEVIATION",
  "injections": 20,
  "caught": 16,
  "missed": 4,
  "false_negative_rate": 0.20,
  "threshold": 0.15,
  "status": "KW_SIGNAL_DEGRADED"
}
```

FNR threshold is fixed at **0.15** (not base-rate-adjusted).
Reason: missing a real problem is always serious, regardless of base rate.

---

## Status Levels Per Flag Type

| Condition | Status | Meaning |
|---|---|---|
| FPR ≤ adjusted_threshold AND FNR ≤ 0.15 | `HEALTHY` | Trust KW's flags |
| FPR > adjusted_threshold | `KW_SIGNAL_DEGRADED` | KW crying wolf on this type |
| FNR > 0.15 | `KW_SIGNAL_DEGRADED` | KW missing things of this type |
| FPR > adjusted_threshold × 2 | `KW_SIGNAL_UNRELIABLE` | Escalate to user |
| FNR > 0.30 | `KW_BLIND_SPOT` (critical) | KW effectively blind on this type |

---

## What Happens When Signal Degrades

```
KW_SIGNAL_DEGRADED (one flag type):
  → WP lowers confidence on that flag type by 0.15
  → User notified
  → Orchestrator informed (may increase human review)

KW_SIGNAL_UNRELIABLE (one flag type):
  → WP stops relaying that flag type to Orchestrator
  → All flags of that type marked "unreliable" in open-issues.md
  → User notified with recommendation to inspect manually

KW_BLIND_SPOT (one flag type):
  → Critical escalation
  → User notified immediately
  → Orchestrator may pause pipeline
```

---

## Known Limits

**FNR is inference, not measurement.**
Canary results are the only FNR signal. If canaries are too simple
(not representative of real events), FNR estimates will be optimistic.

**Outcome resolution latency.**
WP needs to know if a flag was right or wrong to compute FPR.
How it learns this is defined in `references/outcome-resolution.md`.
Until outcomes resolve, flags are in a `pending` state and not counted.

**The first 100 flags use seed values.**
Before enough data exists to estimate base rates, all thresholds
use seed values (base_rate = 0.10 for all types). This means the
system may be more or less tolerant than ideal early in its life.
