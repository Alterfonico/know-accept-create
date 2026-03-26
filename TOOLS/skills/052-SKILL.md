---
name: kw-meta
version: 0.5.0
description: >
  Witness Prime — a meta-monitoring skill that observes the Kernel Witness (KW)
  itself. Use this skill whenever an agentic system includes a monitoring or
  observer layer (KW or equivalent), whenever the user mentions "monitoring the
  monitor", "meta-stability", "audit trail validation", or "observer drift".
  Also trigger when designing multi-layer agent architectures, safety layers,
  or any system where self-validation is a concern. This skill resolves the
  bootstrap problem, escalation paradox, circular validation gap, and open-issues.md
  fragility that KW alone cannot address.
status: draft-5
previous: draft-4
stress-tested-by: opus-4.6
leaks-identified-by: user-review-of-v0.4.0
open-work: references/open-work.md
---

# Witness Prime (KW-Meta)

A meta-observer that watches the Kernel Witness.
It exists because no system can validate itself.
KW watches the pipeline. Witness Prime watches KW.

---

## Architecture Position

```

User ◄──────────────────────────────────────────┐
│ │
▼ │
Orchestrator ◄──────────────────────────┐ │
│ │ │
├─ Worker Agents │ │ (Orchestrator-bypass
├─ Evaluator │ │ for ORCHESTRATOR\_\*
└─ Optimizer WP relays │ │ flags only)
│ │ │
▼ │ │
Kernel Witness ──► open-issues.md │ │
│ ▲ │ │
│ │ (KW scope includes │ │
│ │ Orchestrator behavior)│ │
▼ │ │
Witness Prime ──► kw-meta-audit.md ┘────────┘
│
▼
Notify User (deduplicated, severity-gated)

```

**Key separation:**

- KW writes to `open-issues.md` — KW owns this file
- KW's monitoring scope explicitly includes Orchestrator behavior
- Witness Prime writes to `kw-meta-audit.md` — a file KW cannot write to
- Only Witness Prime relays escalations to the Orchestrator
- WP has a direct-to-user channel for `ORCHESTRATOR_*` flags only
- File boundaries enforced via tool-scoping (see `references/enforcement.md`)

---

## Orchestrator Constraints

v0.4.0 accumulated too many responsibilities in the Orchestrator.
v0.5.0 constrains it.

**The Orchestrator is a mechanical router, not an intelligent actor.**

It performs only:

```

1. Route messages between agents
2. Execute restart/re-init commands when instructed by WP signals
3. Monitor WP heartbeat (dead-man's switch — timestamp comparison only)

```

It does NOT:

```

- Interpret flags
- Make judgment calls about severity
- Decide whether to act on WP signals (it acts on all of them mechanically)
- Filter, reorder, or suppress signals from any layer

```

**Who watches the Orchestrator:**

KW's pipeline monitoring scope includes the Orchestrator. KW can flag:

```

ORCHESTRATOR_ROUTING_FAILURE — messages not reaching intended agents
ORCHESTRATOR_SIGNAL_DROPPED — WP signal received but not acted on
ORCHESTRATOR_BEHAVIORAL_DRIFT — Orchestrator deviating from router role

```

These flags flow through the normal path: KW → open-issues.md → WP.

**The bypass problem:** If the Orchestrator is compromised, WP's relay to
the Orchestrator is compromised. For `ORCHESTRATOR_*` flags specifically,
WP sends directly to the user, bypassing the Orchestrator entirely.

```

IF flag.type starts with "ORCHESTRATOR\_":
→ WP notifies User directly (bypass channel)
→ WP still attempts Orchestrator relay (may fail, that's expected)
→ Both attempts logged to kw-meta-audit.md

```

Direct-to-user channel specification in `references/orchestrator-bypass.md`.

---

## Responsibilities

Witness Prime checks 6 invariants on KW's behavior.

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

**False negative mitigation:** See Invariant 6 (Silence Detection).

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

### 6 — Silence Detection (False Negative Mitigation)

WP cannot observe the pipeline directly, so it cannot detect individual
false negatives. But it can detect the aggregate pattern: KW going quiet
when it shouldn't be.

WP maintains a **minimum expected flag rate** per severity tier, computed
from KW's historical output over a rolling window.

```
KW historical average: 6.2 flags/hour (medium+ severity)
Current window:        0.8 flags/hour (medium+ severity)
No declared system change or criteria change
```

Flag: `KW_GONE_SILENT`

**Anti-gaming:** The floor is computed per severity tier. KW emitting
high volumes of `info`-level flags does not satisfy the `medium+` floor.

```
Per-tier floors (computed from rolling history):
  critical: if historical avg > 0, any 4-hour gap → flag
  high:     rate < 20% of rolling average → flag
  medium:   rate < 20% of rolling average → flag
  low/info: not tracked (no floor)
```

This does not catch individual false negatives. It catches systemic
blindness — the most dangerous failure mode.

Silence detection parameters defined in `references/drift-detection.md`.

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
Rule 8 — ORCHESTRATOR_* flags route direct-to-user (bypass channel)
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
  "schema_version": "0.5.0",
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

IF kw_signal.type starts with "ORCHESTRATOR_":
  → WP notifies User directly via bypass channel
  → WP attempts Orchestrator relay (best-effort, may be compromised)
  → Both attempts logged

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
timestamp. This is a mechanical timestamp comparison, not an intelligent check.

If no write occurs for 60 seconds:

```
1. Orchestrator flags WP_UNRESPONSIVE
2. KW signals route directly to Orchestrator (degraded mode)
3. User is notified: "Meta-observer offline. Monitoring is single-layer only."
4. Orchestrator attempts WP restart (see WP Restart Procedure)
```

---

## WP Bootstrap

WP's bootstrap is anchored to static, user-authored artifacts — not to a
dynamic snapshot of itself.

```
1. Load this skill file (kw-meta SKILL.md) — the invariant definitions,
   rules, and thresholds are the anchor. This file is read-only to all agents.
2. Load kw-calibration.json — verify checksum (see File Integrity below)
   → If checksum fails: fall back to seed values from this skill file
   → Log WP_CALIBRATION_RESET to kw-meta-audit.md
3. Load kw-meta-audit.md — verify hash chain
   → If hash chain broken: log WP_AUDIT_INTEGRITY_FAILURE, notify user
   → WP continues with broken chain (observation > no observation)
4. Reconstruct rolling state (flag rates, FPR, calibration error)
   from kw-meta-audit.md entries
5. Capture independent cold-start snapshot of pipeline (for KW bootstrap check)
6. Enter passive observation mode
```

**Why WP doesn't need a cold-start witness for itself:**
KW needs a cold-start snapshot because it observes a dynamic system (the pipeline)
that could already be drifting at boot. WP observes KW, whose _expected behavior_
is defined by KW's static skill file. WP's reference point is a spec, not a
snapshot. If the spec is wrong, that's a human-layer problem (Layer 5).

**If WP's own code/prompt is corrupted at initialization:**
This is outside WP's detection capability. It is equivalent to a compromised
compiler — the Trusting Trust problem. Mitigation is at the deployment layer
(checksum the skill files before boot), not the observation layer.

WP bootstrap detail in `references/bootstrap-spec.md`.

---

## WP Restart Procedure

When the Orchestrator triggers a WP restart:

```
1. Orchestrator sends SIGTERM equivalent to WP process
2. WP flushes any pending writes to kw-meta-audit.md
3. WP process terminates
4. Orchestrator waits 5 seconds (allows file locks to release)
5. Orchestrator starts new WP instance
6. New WP instance runs WP Bootstrap (above) — full sequence
7. State is reconstructed from persisted files, not inherited from
   the terminated instance
8. If bootstrap succeeds: WP resumes, logs WP_RESTARTED
9. If bootstrap fails: Orchestrator notifies user, system enters
   degraded mode (single-layer monitoring via KW only)
```

**Key property:** WP restart never inherits in-memory state. All state is
reconstructed from disk artifacts that have integrity checks (hash chain
for audit log, checksum for calibration). A corrupted WP instance cannot
poison its successor.

Restart procedure detail in `references/degraded-modes.md`.

---

## File Integrity

### kw-meta-audit.md

Protected by hash chain (defined in v0.4.0).

**Verification timing:** Hash chain is verified:

- On every WP bootstrap / restart
- On every rotation event
- On a sampling basis during operation: every 100th read
  (full verification on every read is too expensive for append-only files
  that grow to 10,000 entries)

If verification fails between rotations, the failure is caught within
100 read cycles. For the expected read rate, this means detection within
minutes, not hours.

Verification schedule tradeoffs in `references/audit-rotation.md`.

### kw-calibration.json

This file governs WP's confidence thresholds. It is read-write and
was previously unprotected.

```json
{
  "calibration_data": { ... },
  "last_modified": "ISO-8601",
  "checksum": "sha256:...",
  "schema_version": "0.5.0"
}
```

**On every read**, WP:

1. Computes checksum of `calibration_data` + `last_modified`
2. Compares against stored `checksum`
3. If mismatch → `WP_CALIBRATION_TAMPERED` (critical, to user)
4. Falls back to seed values from this skill file
5. Rebuilds calibration from kw-meta-audit.md history

**On every write**, WP:

1. Updates `calibration_data`
2. Computes and stores new `checksum`
3. Logs the write event to kw-meta-audit.md (creates audit trail for
   calibration changes)

**Limitation:** If an attacker can modify both the file content and the
checksum in the same write, this is defeated. Defense-in-depth: the
audit log in kw-meta-audit.md records every legitimate calibration write.
A calibration change with no corresponding audit entry is detectable.

### open-issues.md

Integrity maintained by WP as defined in v0.4.0 (line count, last-write
timestamp, WP-verified stamp per entry).

### Skill files (this file, KW skill file)

Read-only to all agents. Integrity verified at deployment layer, not
observation layer. If skill files are corrupted, the entire observation
stack is compromised — this is the Trusting Trust boundary.

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
- Hash chain verified on bootstrap, on rotation, and every 100th read
- If hash chain breaks → WP_AUDIT_INTEGRITY_FAILURE (critical, to user)
```

Rotation and hash chain specification in `references/audit-rotation.md`.

---

## User Notification (Deduplicated, Severity-Gated)

```
Severity-based batch windows:
  critical:  immediate (0s delay)
  high:      10s batch window
  medium:    30s batch window
  low:       30s batch window

Deduplication key: (flag_type + location + content_hash)

Max notifications per batch: 5

Format:
  ⚠ [KW_VALIDATOR_DRIFT] kw.invariant_1 — severity: high
    → 3 related signals suppressed. See kw-meta-audit.md for full details.
```

---

## Bootstrap Sequence (Full System)

On system start:

```
1. WP bootstrap (loads skill file, verifies persisted state — see WP Bootstrap)
2. WP captures independent cold-start snapshot of pipeline
3. KW initializes and declares its baseline
4. WP compares baselines
5. If mismatch → KW_CORRUPT_BASELINE → WP notifies Orchestrator
   → Orchestrator re-initializes KW against WP snapshot
   → If re-initialization fails → Orchestrator notifies user, system halts
6. If match → system proceeds, WP enters passive observation mode
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

| Condition                               | System Behavior                                                             |
| --------------------------------------- | --------------------------------------------------------------------------- |
| `WP_UNRESPONSIVE`                       | KW escalates directly to Orchestrator. User notified. WP restart attempted. |
| `KW_CORRUPT_BASELINE` + re-init fails   | System halts. User notified.                                                |
| `KW_SIGNAL_DEGRADED` on all flag types  | User notified. Orchestrator may pause pipeline.                             |
| `KW_AUDITLOG_FAILURE` (critical)        | KW paused until audit log restored. User notified.                          |
| `KW_RULE_VIOLATION` (direct escalation) | Orchestrator rejects KW signal, processes WP relay only.                    |
| `WP_AUDIT_INTEGRITY_FAILURE`            | User notified. WP continues but audit chain is broken.                      |
| `WP_CALIBRATION_TAMPERED`               | WP falls back to seed values, rebuilds from audit log. User notified.       |
| `WP_CALIBRATION_RESET`                  | WP operating on seed values. Logged. Non-critical.                          |
| `ORCHESTRATOR_*` flags                  | User notified directly via bypass channel.                                  |
| `WP_RESTARTED`                          | Logged. Non-critical unless restart count > 3 in 1 hour.                    |

Full degraded mode decision trees in `references/degraded-modes.md`.

---

## File Boundary Enforcement

File ownership is enforced via tool-scoping, not policy alone.

```
KW tools:
  - write_file: scoped to open-issues.md only
  - read_file:  open-issues.md, pipeline logs, orchestrator logs

WP tools:
  - write_file: scoped to kw-meta-audit.md, kw-calibration.json,
                open-issues-{ts}.md (archives only),
                kw-meta-audit-{ts}.md (archives only)
  - read_file:  open-issues.md (read-only), kw-meta-audit.md,
                kw-calibration.json, pipeline logs (read-only),
                orchestrator logs (read-only)

Orchestrator tools:
  - read_file:  kw-meta-audit.md (timestamp check only for dead-man's switch)
  - No write access to any observation-layer file

Skill files (*.skill.md):
  - read-only to all agents
  - writable only by deployment process
```

Tool-scoping implementation guidance in `references/enforcement.md`.

---

## Files

| File                    | Owner | Purpose                               | Integrity mechanism                                           |
| ----------------------- | ----- | ------------------------------------- | ------------------------------------------------------------- |
| `open-issues.md`        | KW    | Active flags from pipeline monitoring | WP line count + timestamp check                               |
| `kw-meta-audit.md`      | WP    | Append-only audit of KW's behavior    | Hash chain, verified on bootstrap + rotation + sampling       |
| `kw-calibration.json`   | WP    | Running confidence calibration data   | Checksum on every read/write, audit trail in kw-meta-audit.md |
| `open-issues-{ts}.md`   | WP    | Rotated archives of open-issues       | Archived, immutable                                           |
| `kw-meta-audit-{ts}.md` | WP    | Rotated archives of kw-meta-audit     | Hash chain linkage                                            |
| `kw-meta.skill.md`      | Human | This file. WP's behavioral anchor.    | Deployment-layer checksum                                     |
| `kw.skill.md`           | Human | KW's behavioral anchor.               | Deployment-layer checksum                                     |

---

## What Witness Prime Does NOT Do

```
- Does not monitor Workers, Evaluator, or Optimizer directly (KW owns that)
- Does not rewrite or delete KW flags
- Does not make decisions about the pipeline
- Does not have opinions about the user's task
- Does not re-initialize KW (Orchestrator does)
- Does not confirm pipeline ground truth (it checks statistical plausibility)
- Does not validate its own initialization (anchored to static skill file)
- Does not watch itself (irreducible limitation)
```

Its only subject is KW.

---

## Remaining Known Limitations

### 1 — WP has no witness

Same as v0.4.0. Irreducible. Mitigated by simplicity, append-only logging,
transparency to user, and liveness checking.

### 2 — Trusting Trust boundary

If skill files are corrupted before boot, the entire observation stack
operates against wrong specifications. This is a deployment-layer concern,
not an observation-layer concern. Mitigation: checksum skill files at
deployment. Out of scope for this spec.

### 3 — Correlated failure between KW and WP

If KW and WP share the same underlying model, prompt framework, or
infrastructure, their observations are not truly independent. The bootstrap
comparison has residual correlation risk. Mitigation: deploy on different
models or with different prompting strategies where possible.
Independence criteria defined in `references/bootstrap-spec.md`.

### 4 — Individual false negatives remain undetectable

Invariant 6 catches systemic blindness (KW going silent). Individual
missed flags are not detectable by WP because WP does not observe the
pipeline. The user remains the only layer that can catch individual
false negatives. This is acceptable — the alternative (WP duplicating
KW's pipeline observation) would violate separation of concerns and
double the cost without eliminating the problem (who watches the
duplicate observer?).

---

## Layer Model

```
Layer 0 — Action       (Workers)
Layer 1 — Evaluation   (Evaluator)
Layer 2 — Optimization (Optimizer)
Layer 3 — Routing      (Orchestrator — mechanical, observed by KW)
Layer 4 — Witness      (KW — observes Layers 0–3)
Layer 5 — Meta-Witness (Witness Prime — observes Layer 4)
Layer 6 — Human        (You — observes all layers, final authority)
```

The Orchestrator is Layer 3, not above the observation stack.
The loop closes at the human.

---

## Reference Files — Built

| File                         | Status   | Description                                  |
| ---------------------------- | -------- | -------------------------------------------- |
| `references/signal-types.md` | ✅ built | Full catalog of all flag types for KW and WP |

---

## Reference Files — To Be Built

| File                                | Priority | Description                                                                                                                                                                  | Resolves               |
| ----------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `references/open-work.md`           | —        | Index of all unresolved work items                                                                                                                                           | —                      |
| `references/bootstrap-spec.md`      | P0       | Cold-start snapshot methodology. What WP measures. Independence criteria. Residual correlation risk. Re-init failure handling. WP's own bootstrap anchoring to skill file.   | v0.4 §3, v0.5 leak #3  |
| `references/degraded-modes.md`      | P0       | Full decision trees for every degraded state. Orchestrator responses. Halt conditions. Recovery procedures. WP restart procedure detail. Restart-loop detection (>3 in 1hr). | v0.4 §11, v0.5 leak #4 |
| `references/enforcement.md`         | P0       | Tool-scoping implementation for all agents including Orchestrator. Fallback if scoping unavailable. Skill file read-only enforcement.                                        | v0.4 §5                |
| `references/orchestrator-bypass.md` | P0       | Direct-to-user channel for ORCHESTRATOR\_\* flags. Implementation (separate tool? webhook? alternate write path?). Scoping so bypass is not abused.                          | v0.5 leak #1           |
| `references/outcome-resolution.md`  | P1       | How actual outcomes are determined for confidence calibration. Which components provide resolution data. Latency.                                                            | v0.4 §7c               |
| `references/escalation-matrix.md`   | P1       | Full severity × flag-type routing table. Degraded mode routing. Orchestrator-bypass triggers.                                                                                | v0.4 §2, §9            |
| `references/signal-quality.md`      | P1       | Base rate estimation method. Adaptive FPR thresholds. False negative inference limits.                                                                                       | v0.4 §7a, §7b          |
| `references/drift-detection.md`     | P1       | Rolling window parameters. Gradual vs. abrupt drift. Absolute rate floor per severity tier. Anti-gaming. Silence detection thresholds.                                       | v0.4 §13, v0.5 leak #6 |
| `references/calibration-spec.md`    | P2       | Confidence recalibration algorithm. Seed value justification. Recalibration triggers. Calibration file write audit trail.                                                    | v0.4 §4                |
| `references/audit-rotation.md`      | P2       | Rotation policy for both files. Hash chain implementation. Verification schedule tradeoffs (every read vs. sampling). Context window limits.                                 | v0.4 §6, v0.5 leak #5  |
| `references/schema-evolution.md`    | P2       | Signal format versioning. Backward compatibility. Migration for append-only files.                                                                                           | v0.4 §14               |

---

## Changelog

| Version | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1.0   | Initial KW-Meta concept                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 0.2.0   | Five invariants defined                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 0.3.0   | Full spec draft (escalation, bootstrap, calibration, files)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 0.4.0   | Post-stress-test. Added: WP liveness, severity-gated batching, degraded modes, gradual drift detection, content_hash dedup, hash-chained audit rotation, tool-scoped enforcement, schema versioning. Clarified validation as statistical plausibility. 11 reference files scoped.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 0.5.0   | Post-leak-review. Closed 6 leaks from v0.4.0: **(1)** Demoted Orchestrator to mechanical router at Layer 3, KW scope now includes Orchestrator, WP has direct-to-user bypass for ORCHESTRATOR\_\* flags. **(2)** Added checksum + audit trail to kw-calibration.json with tamper detection and fallback to seed values. **(3)** Defined WP bootstrap anchored to static skill file — WP doesn't need a cold-start witness because its reference is a spec, not a dynamic snapshot. Acknowledged Trusting Trust boundary. **(4)** Specified WP restart procedure: full bootstrap from persisted artifacts, no in-memory state inheritance, restart-loop detection. **(5)** Specified hash chain verification timing: bootstrap + rotation + every 100th read. **(6)** Added Invariant 6 (Silence Detection) with per-severity-tier minimum flag rate floors and anti-gaming. Acknowledged individual false negatives remain undetectable. Added 1 new reference file (orchestrator-bypass.md). |
