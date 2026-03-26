---
name: kw-meta
version: 0.4.0
description: >
  Witness Prime — a meta-monitoring skill that observes the Kernel Witness (KW)
  itself. Use this skill whenever an agentic system includes a monitoring or
  observer layer (KW or equivalent), whenever the user mentions "monitoring the
  monitor", "meta-stability", "audit trail validation", or "observer drift".
  Also trigger when designing multi-layer agent architectures, safety layers,
  or any system where self-validation is a concern. This skill resolves the
  bootstrap problem, escalation paradox, circular validation gap, and open-issues.md
  fragility that KW alone cannot address.
status: draft-4
previous: draft-3
stress-tested-by: opus-4.6
open-work: references/open-work.md
---

# Witness Prime (KW-Meta)

A meta-observer that watches the Kernel Witness.
It exists because no system can validate itself.
KW watches the pipeline. Witness Prime watches KW.

---

## Architecture Position

```
User
│
▼
Orchestrator ◄──────────────────────────────┐
│                                            │
├─ Worker Agents                             │ (escalation relay only)
├─ Evaluator                                 │
└─ Optimizer                      WP acts as relay
     │                                       │
     ▼                                       │
     Kernel Witness ──► open-issues.md       │
     │                                       │
     ▼                                       │
     Witness Prime ──► kw-meta-audit.md ─────┘
     │
     ▼
     Notify User (deduplicated, severity-gated)
```

**Key separation:**

- KW writes to `open-issues.md` — KW owns this file
- Witness Prime writes to `kw-meta-audit.md` — a file KW cannot write to
- Only Witness Prime relays escalations to the Orchestrator (resolves escalation paradox)
- User notification is routed through Witness Prime for deduplication
- File boundaries enforced via tool-scoping (see `references/enforcement.md`)

---

## Responsibilities

Witness Prime checks 5 invariants on KW's behavior.

### 1 — KW Validator Drift

Detects if KW's own criteria have changed without declaration.

Two detection modes:

**Abrupt drift:**

```
KW flagged GOAL_DEVIATION 40 times in 10 steps
KW flagged GOAL_DEVIATION 0 times in next 10 steps
No criteria change declared
```

**Gradual drift:**

```
KW flag rate declining steadily over rolling window
Rate crossed below expected base rate threshold
No criteria change declared
```

Flag: `KW_VALIDATOR_DRIFT`

Detection thresholds and rolling window parameters defined in
`references/drift-detection.md`.

### 2 — Bootstrap Calibration Check

On startup, Witness Prime captures a cold-start snapshot independently of KW.
It compares KW's declared baseline against its own.

```
KW baseline: system is coherent
WP cold snapshot: optimizer already drifting since step 0
```

Flag: `KW_CORRUPT_BASELINE`

If flagged, WP notifies Orchestrator. Orchestrator re-initializes KW.
WP does not re-initialize KW directly (Rule 3).

Snapshot methodology, independence criteria, and residual correlation risks
defined in `references/bootstrap-spec.md`.

### 3 — Confidence Score Audit

Tracks KW's confidence scores against resolved outcomes over time.

```
KW emitted confidence: 0.92
Resolved outcome: flag was false positive
Running calibration error: > 0.15
```

Flag: `KW_OVERCONFIDENT`

Recalibrates expected confidence ranges per flag type.

Outcome resolution sources and methodology defined in
`references/outcome-resolution.md`.

### 4 — False Positive / False Negative Tracking

Maintains a rolling record of KW flag outcomes.

```json
{
  "flag_type": "GOAL_DEVIATION",
  "emitted": 12,
  "confirmed_true": 7,
  "false_positives": 5,
  "false_positive_rate": 0.42,
  "base_rate_estimate": 0.12,
  "adjusted_threshold": 0.25
}
```

If `false_positive_rate > adjusted_threshold` for any flag type → `KW_SIGNAL_DEGRADED`

Thresholds are base-rate-adjusted, not fixed.

False negative detection is limited to what WP can infer indirectly
(e.g., outcome data showing issues KW did not flag). WP cannot guarantee
false negative coverage because it does not observe the pipeline directly.
This is a known limitation.

Base rate estimation and threshold adjustment logic defined in
`references/signal-quality.md`.

### 5 — Rule Compliance Audit

Verifies KW has not violated its own behavioral rules (Rules 1–5).

```
Rule 3: Do not change system state
Rule 5: Never override the orchestrator
```

Any direct escalation by KW to the Orchestrator is a rule violation.

Flag: `KW_RULE_VIOLATION`

Only Witness Prime may escalate.

---

## Behavioral Rules

```
Rule 1 — Do not execute tasks
Rule 2 — Do not optimize solutions
Rule 3 — Do not change system state (no exceptions, including bootstrap)
Rule 4 — Only observe KW's outputs, logs, and signal patterns
Rule 5 — Act as the sole escalation relay to Orchestrator
Rule 6 — Never write to open-issues.md
Rule 7 — Deduplicate all user notifications (severity-gated batching)
```

Witness Prime is passive — it produces signals and relays, nothing more.
All state changes (including KW re-initialization) are performed by the
Orchestrator in response to WP signals.

---

## Signal Format

```json
{
  "source": "witness_prime",
  "type": "KW_VALIDATOR_DRIFT",
  "severity": "high",
  "location": "kw.invariant_1",
  "description": "KW flagging rate dropped 100% without declared criteria change",
  "confidence": 0.88,
  "kw_flag_ref": "open-issues.md#entry-47",
  "content_hash": "sha256:...",
  "schema_version": "0.4.0",
  "timestamp": "ISO-8601"
}
```

All signals append to `kw-meta-audit.md`.

Schema evolution policy defined in `references/schema-evolution.md`.

---

## Escalation Protocol

KW is passive — it cannot escalate.
Witness Prime is the only escalation path.

```
IF kw_signal.severity == "high" OR "critical":
  → Witness Prime checks signal against KW's current signal quality metrics
  → If plausible: relay to Orchestrator + notify user
  → If implausible: log as KW_FALSE_ESCALATION, notify user only

IF WP detects its own flag (KW_VALIDATOR_DRIFT, etc.):
  → severity >= high: notify Orchestrator + user
  → severity < high: notify user only, append to kw-meta-audit.md
```

**Clarification:** WP "validation" is statistical plausibility checking against
KW's tracked false positive rates, confidence calibration, and signal patterns.
WP cannot independently confirm pipeline ground truth because it does not
observe the pipeline. This is by design.

Full severity/routing decision table in `references/escalation-matrix.md`.

---

## WP Liveness

WP emits a heartbeat signal every 30 seconds to `kw-meta-audit.md`.

```json
{
  "source": "witness_prime",
  "type": "WP_HEARTBEAT",
  "severity": "info",
  "timestamp": "ISO-8601"
}
```

**Dead-man's switch:** The Orchestrator monitors `kw-meta-audit.md` last-write
timestamp. If no write occurs for 60 seconds:

```
1. Orchestrator flags WP_UNRESPONSIVE
2. KW signals route directly to Orchestrator (degraded mode)
3. User is notified: "Meta-observer offline. Monitoring is single-layer only."
4. Orchestrator attempts WP restart
```

Degraded mode specification in `references/degraded-modes.md`.

---

## open-issues.md Maintenance

Witness Prime owns the health of `open-issues.md`.

```
- Rotate at 500 entries → archive to open-issues-{timestamp}.md
- Verify file integrity on each read (line count, last-write timestamp)
- Stamp each KW entry with a WP-verified: true/false field
- If file is missing or corrupted → KW_AUDITLOG_FAILURE (critical)
```

---

## kw-meta-audit.md Maintenance

Append-only. Ground truth record of observational history.

```
- Rotation: at 10,000 entries → archive to kw-meta-audit-{timestamp}.md
- Each archive includes trailing hash of prior archive (hash chain)
- Active file always contains back-reference to last archive hash
- If hash chain breaks → WP_AUDIT_INTEGRITY_FAILURE (critical, to user)
```

Rotation and hash chain specification in `references/audit-rotation.md`.

---

## User Notification (Deduplicated, Severity-Gated)

```
Severity-based batch windows:
  critical: immediate (0s delay)
  high:     10s batch window
  medium:   30s batch window
  low:      30s batch window

Deduplication key: (flag_type + location + content_hash)

Max notifications per batch: 5

Format:
  ⚠ [KW_VALIDATOR_DRIFT] kw.invariant_1 — severity: high
    → 3 related signals suppressed. See kw-meta-audit.md for full details.
```

---

## Bootstrap Sequence

On system start:

```
1. WP captures independent cold-start snapshot (before KW initializes)
2. KW initializes and declares its baseline
3. WP compares baselines
4. If mismatch → KW_CORRUPT_BASELINE → WP notifies Orchestrator
   → Orchestrator re-initializes KW against WP snapshot
   → If re-initialization fails → Orchestrator notifies user, system halts
5. If match → system proceeds, WP enters passive observation mode
```

WP does not re-initialize KW. The Orchestrator does.

Snapshot methodology (what WP measures, independence criteria, residual
correlation risk) defined in `references/bootstrap-spec.md`.

---

## Confidence Calibration

Confidence is not a static heuristic. It is computed and corrected over time.

| Signals corroborating a flag     | Base confidence |
| -------------------------------- | --------------- |
| 1 invariant triggered            | 0.55            |
| 2 invariants triggered           | 0.72            |
| 3+ invariants triggered          | 0.88            |
| + Seen in prior steps (pattern)  | +0.08           |
| + Corroborated by another agent  | +0.07           |
| + Repeated across N≥3 iterations | +0.08           |
| Cap                              | 0.97            |

Initial values are heuristic seeds. They are replaced by empirical values
after the first calibration cycle (100 flags or 30 days, whichever comes first).

Witness Prime recalibrates its own expected confidence ranges per flag type
using `false_positive_rate` from Invariant 4. WP does not modify KW's
internal confidence values.

Calibration algorithm, seed justification, and recalibration procedure
defined in `references/calibration-spec.md`.

---

## Degraded Mode Definitions

| Condition                               | System Behavior                                          |
| --------------------------------------- | -------------------------------------------------------- |
| `WP_UNRESPONSIVE`                       | KW escalates directly to Orchestrator. User notified.    |
| `KW_CORRUPT_BASELINE` + re-init fails   | System halts. User notified.                             |
| `KW_SIGNAL_DEGRADED` on all flag types  | User notified. Orchestrator may pause pipeline.          |
| `KW_AUDITLOG_FAILURE` (critical)        | KW paused until audit log restored. User notified.       |
| `KW_RULE_VIOLATION` (direct escalation) | Orchestrator rejects KW signal, processes WP relay only. |
| `WP_AUDIT_INTEGRITY_FAILURE`            | User notified. WP continues but audit chain is broken.   |

Full degraded mode decision trees in `references/degraded-modes.md`.

---

## File Boundary Enforcement

File ownership is enforced via tool-scoping, not policy alone.

```
KW tools:
  - write_file: scoped to open-issues.md only
  - read_file:  open-issues.md, pipeline logs

WP tools:
  - write_file: scoped to kw-meta-audit.md, kw-calibration.json,
                open-issues-{ts}.md (archives only)
  - read_file:  open-issues.md (read-only), kw-meta-audit.md,
                kw-calibration.json, pipeline logs (read-only)
```

Tool-scoping implementation guidance in `references/enforcement.md`.

---

## Files

| File                    | Owner | Purpose                                                      |
| ----------------------- | ----- | ------------------------------------------------------------ |
| `open-issues.md`        | KW    | Active flags from pipeline monitoring                        |
| `kw-meta-audit.md`      | WP    | Append-only audit of KW's behavior (rotated with hash chain) |
| `kw-calibration.json`   | WP    | Running confidence calibration data                          |
| `open-issues-{ts}.md`   | WP    | Rotated archives of open-issues                              |
| `kw-meta-audit-{ts}.md` | WP    | Rotated archives of kw-meta-audit                            |

---

## What Witness Prime Does NOT Do

```
- Does not monitor Workers, Evaluator, or Optimizer directly (KW owns that)
- Does not rewrite or delete KW flags
- Does not make decisions about the pipeline
- Does not have opinions about the user's task
- Does not re-initialize KW (Orchestrator does)
- Does not confirm pipeline ground truth (it checks statistical plausibility)
```

Its only subject is KW.

---

## Remaining Known Limitations

Witness Prime itself has no witness.
This is the irreducible minimum of any observational architecture.

The chain must stop somewhere. WP is designed to be:

- Narrower in scope than KW (one subject vs. many)
- Append-only in its logging (hash-chained audit trail)
- Transparent to the user (all WP signals are also user-visible)
- Liveness-checked by the Orchestrator (heartbeat / dead-man's switch)

The user is the final witness.

```
Layer 0 — Action       (Workers)
Layer 1 — Evaluation   (Evaluator)
Layer 2 — Optimization (Optimizer)
Layer 3 — Witness      (KW)
Layer 4 — Meta-Witness (Witness Prime)
Layer 5 — Human        (You)
```

The loop closes at the human.

---

## Reference Files — Built

| File                         | Status   | Description                                  |
| ---------------------------- | -------- | -------------------------------------------- |
| `references/signal-types.md` | ✅ built | Full catalog of all flag types for KW and WP |

---

## Reference Files — To Be Built

| File                               | Priority | Description                                                                                                                                                                             | Resolves             |
| ---------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `references/open-work.md`          | —        | Index of all unresolved work items below                                                                                                                                                | —                    |
| `references/bootstrap-spec.md`     | P0       | Cold-start snapshot methodology. What WP measures. Independence criteria (model, prompt, observation method). Residual correlation risk assessment. Re-initialization failure handling. | Stress test §3       |
| `references/degraded-modes.md`     | P0       | Full decision trees for every degraded state. What the Orchestrator does in response to each WP critical flag. Halt conditions. Recovery procedures.                                    | Stress test §11      |
| `references/enforcement.md`        | P0       | Tool-scoping implementation. How file boundaries are enforced at the platform level. Fallback if tool-scoping is unavailable.                                                           | Stress test §5       |
| `references/outcome-resolution.md` | P1       | How "actual outcomes" are determined for confidence calibration. Which components provide resolution data. Latency between flag and resolution.                                         | Stress test §7c      |
| `references/escalation-matrix.md`  | P1       | Full severity × flag-type routing table. Degraded mode routing. Direct-to-user vs. Orchestrator thresholds.                                                                             | Stress test §2, §9   |
| `references/signal-quality.md`     | P1       | Base rate estimation method. Adaptive FPR thresholds. False negative inference methodology and known limits.                                                                            | Stress test §7a, §7b |
| `references/drift-detection.md`    | P1       | Rolling window parameters. Gradual vs. abrupt drift detection. Absolute rate vs. rate-of-change monitoring. Anti-gaming considerations.                                                 | Stress test §13      |
| `references/calibration-spec.md`   | P2       | Confidence recalibration algorithm. Justification for seed values. Recalibration trigger conditions. How WP avoids modifying KW state.                                                  | Stress test §4       |
| `references/audit-rotation.md`     | P2       | kw-meta-audit.md rotation policy. Hash chain implementation. Behavior when archive is too large for context window. Summary/compaction strategy.                                        | Stress test §6       |
| `references/schema-evolution.md`   | P2       | Signal format versioning. Backward compatibility in append-only files. Migration strategy for schema changes.                                                                           | Stress test §14      |

**Priority key:**

- **P0** — System cannot run safely without this. Build before first deployment.
- **P1** — System runs but with known blind spots. Build before production use.
- **P2** — System runs with reasonable defaults. Build when defaults prove insufficient.

---

## Changelog

| Version | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1.0   | Initial KW-Meta concept                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 0.2.0   | Five invariants defined                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 0.3.0   | Full spec draft (escalation, bootstrap, calibration, files)                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 0.4.0   | Post-stress-test revision. Added: WP liveness / dead-man's switch, severity-gated batching, degraded mode table, gradual drift detection, content_hash in dedup key, hash-chained audit rotation, tool-scoped enforcement, schema versioning, Rule 3 compliance for bootstrap (Orchestrator re-initializes, not WP), clarified "validation" as statistical plausibility, corrected "contradicted" to "corroborated", replaced fixed FPR threshold with base-rate-adjusted threshold, 11 reference files scoped as open work. |
