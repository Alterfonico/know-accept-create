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
open-work: references/open-work.md
---

# Witness Prime (KW-Meta)

A meta-observer that watches the Kernel Witness.
It exists because no system can validate itself.
KW watches the pipeline. Witness Prime watches KW.

---

## Architecture Position

```markdown
User ◄──────────────────────────────────────────────┐
│ │
▼ │
Orchestrator ◄──────────────────────────────┐ │
│ │ │ │
│ ├──► orchestrator-decisions.md ──┼────────┘
│ │ │ (user audits directly)
├─ Worker Agents │
├─ Evaluator │ (escalation relay only)
└─ Optimizer WP acts as relay
│ │
▼ │
Kernel Witness ──► open-issues.md │
│ │
▼ │
Witness Prime ──► kw-meta-audit.md ─────┘
│
▼
Notify User (deduplicated, severity-gated)
```

**Key separation:**

- KW writes to `open-issues.md` — KW owns this file
- Witness Prime writes to `kw-meta-audit.md` — a file KW cannot write to
- Orchestrator writes to `orchestrator-decisions.md` — append-only decision log
- Only Witness Prime relays escalations to the Orchestrator (resolves escalation paradox)
- User notification is routed through Witness Prime for deduplication
- File boundaries enforced via tool-scoping (see `references/enforcement.md`)

**Who watches what:**
KW → watches pipeline (Workers, Evaluator, Optimizer)
WP → watches KW + KW's environment (Orchestrator actions on monitoring stack)
User → watches Orchestrator (via orchestrator-decisions.md)

Copy
No component watches itself. Every component has exactly one observer.
The Orchestrator is not watched by another agent — it is watched by the user.
This is deliberate. See "Remaining Known Limitations" for rationale.

---

## Responsibilities

Witness Prime checks 6 invariants on KW's behavior and environment.

### 1 — KW Validator Drift

Detects if KW's own criteria have changed without declaration.

Two detection modes:

**Abrupt drift:**
KW flagged GOAL_DEVIATION 40 times in 10 steps
KW flagged GOAL_DEVIATION 0 times in next 10 steps
No criteria change declared

**Gradual drift:**
KW flag rate declining steadily over rolling window
Rate crossed below expected base rate threshold
No criteria change declared

Flag: `KW_VALIDATOR_DRIFT`

Detection thresholds and rolling window parameters defined in
`references/drift-detection.md`.

### 2 — Bootstrap Calibration Check

On startup, Witness Prime captures a cold-start snapshot independently of KW.
It compares KW's declared baseline against its own.
KW baseline: system is coherent
WP cold snapshot: optimizer already drifting since step 0

Flag: `KW_CORRUPT_BASELINE`

If flagged, WP notifies Orchestrator. Orchestrator re-initializes KW.
WP does not re-initialize KW directly (Rule 3).

Snapshot methodology, independence criteria, and residual correlation risks
defined in `references/bootstrap-spec.md`.

### 3 — Confidence Score Audit

Tracks KW's confidence scores against resolved outcomes over time.
KW emitted confidence: 0.92
Resolved outcome: flag was false positive
Running calibration error: > 0.15

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

If false_positive_rate > adjusted_threshold for any flag type → KW_SIGNAL_DEGRADED
Thresholds are base-rate-adjusted, not fixed.
False negative mitigation: WP cannot observe the pipeline directly, so it
cannot detect false negatives by observation. Instead, WP uses canary injection:

1. WP periodically requests Orchestrator inject a known-detectable condition
2. Orchestrator injects canary into pipeline input
3. WP verifies KW flags the canary within expected latency
4. If KW misses canary → KW_FALSE_NEGATIVE_DETECTED
5. Canary results feed into per-flag-type false negative rate estimates
   Flag: KW_FALSE_NEGATIVE_DETECTED
   Canary injection protocol, frequency, and canary design in
   references/canary-protocol.md.
   Base rate estimation and threshold adjustment logic defined in
   references/signal-quality.md.
   5 — Rule Compliance Audit
   Verifies KW has not violated its own behavioral rules (Rules 1–5).

Rule 3: Do not change system state
Rule 5: Never override the orchestrator
Any direct escalation by KW to the Orchestrator is a rule violation.
Flag: KW_RULE_VIOLATION
Only Witness Prime may escalate.
6 — Monitoring Stack Action Audit
Verifies that Orchestrator actions affecting the monitoring stack (KW or WP)
are consistent and logged.
WP reads orchestrator-decisions.md and checks:

- Every KW re-initialization has a corresponding WP signal that triggered it
- Every WP restart has a corresponding trigger condition
- No monitoring-stack action occurred without a logged reason
- Degraded mode transitions match the degraded mode table
  Flag: ORCH_MONITORING_ACTION_UNLOGGED — Orchestrator acted on KW/WP
  without a logged decision.
  Flag: ORCH_MONITORING_ACTION_INCONSISTENT — Orchestrator action doesn't
  match the triggering condition (e.g., re-initialized KW without a
  KW_CORRUPT_BASELINE signal).
  Scope constraint: Invariant 6 only covers Orchestrator actions that affect
  KW or WP. WP does not audit Orchestrator pipeline decisions. That remains
  outside WP's scope. The user audits the Orchestrator directly.
  Behavioral Rules

Rule 1 — Do not execute tasks
Rule 2 — Do not optimize solutions
Rule 3 — Do not change system state (no exceptions, including bootstrap)
Rule 4 — Only observe KW's outputs, logs, and signal patterns
Rule 5 — Act as the sole escalation relay to Orchestrator
Rule 6 — Never write to open-issues.md
Rule 7 — Deduplicate all user notifications (severity-gated batching)
Rule 8 — Verify kw-calibration.json checksum on every read
Witness Prime is passive — it produces signals and relays, nothing more.
All state changes (including KW re-initialization) are performed by the
Orchestrator in response to WP signals.
Signal Format

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

All signals append to kw-meta-audit.md.
Schema evolution policy defined in references/schema-evolution.md.
Escalation Protocol
KW is passive — it cannot escalate.
Witness Prime is the only escalation path.

IF kw_signal.severity == "high" OR "critical":
→ Witness Prime checks signal against KW's current signal quality metrics
→ If plausible: relay to Orchestrator + notify user
→ If implausible: log as KW_FALSE_ESCALATION, notify user only

IF WP detects its own flag (KW_VALIDATOR_DRIFT, etc.):
→ severity >= high: notify Orchestrator + user
→ severity < high: notify user only, append to kw-meta-audit.md

IF WP detects Invariant 6 flag (ORCH*MONITORING_ACTION*\*):
→ notify user directly (Orchestrator cannot be trusted to relay this)
→ append to kw-meta-audit.md
Clarification: WP "validation" is statistical plausibility checking against
KW's tracked false positive rates, confidence calibration, and signal patterns.
WP cannot independently confirm pipeline ground truth because it does not
observe the pipeline. This is by design.
Full severity/routing decision table in references/escalation-matrix.md.
WP Liveness
WP emits a heartbeat signal every 30 seconds to kw-meta-audit.md.

```
{
"source": "witness_prime",
"type": "WP_HEARTBEAT",
"severity": "info",
"timestamp": "ISO-8601"
}
```

Dead-man's switch: The Orchestrator monitors kw-meta-audit.md last-write
timestamp. If no write occurs for 60 seconds:

1. Orchestrator logs WP_UNRESPONSIVE to orchestrator-decisions.md
2. KW signals route directly to Orchestrator (degraded mode)
3. User is notified: "Meta-observer offline. Monitoring is single-layer only."
4. Orchestrator attempts WP restart (see WP Restart Protocol)
   WP Restart Protocol
   When the Orchestrator restarts WP (whether from liveness failure or other cause):

5. Orchestrator logs restart reason to orchestrator-decisions.md
6. WP starts from deterministic initial state (this spec file = its full definition)
7. WP re-runs bootstrap sequence (cold-start snapshot, KW baseline comparison)
8. WP loads kw-calibration.json, verifies checksum
   → If checksum fails: WP discards file, starts with seed values,
   logs WP_CALIBRATION_RESET to kw-meta-audit.md
   → If checksum passes: WP resumes with existing calibration data
9. WP reads kw-meta-audit.md tail (last 100 entries) to rebuild recent context
10. WP verifies hash chain integrity on kw-meta-audit.md
    → If broken: WP_AUDIT_INTEGRITY_FAILURE (critical, to user)
11. WP enters observation mode
    WP does not inherit runtime state across restarts. Its state is reconstructed
    from its persistent files (audit log + calibration json), both of which are
    integrity-checked on load.
    WP restart failure handling defined in references/degraded-modes.md.
    WP Bootstrap
    WP's own initial state is deterministic. It is fully defined by:
    This spec file (behavioral rules, invariant definitions, confidence seeds)
    kw-calibration.json (accumulated calibration data, checksum-verified)
    kw-meta-audit.md (historical audit trail, hash-chain-verified)
    On first-ever initialization (no prior files exist):

12. WP starts with seed confidence values from this spec
13. WP creates empty kw-calibration.json with initial checksum
14. WP creates kw-meta-audit.md with genesis entry
15. WP proceeds to KW bootstrap calibration check (Invariant 2)
    WP has no cold-start witness. This is accepted as irreducible.
    Mitigations:
    WP's initial state is deterministic and inspectable (user can read this file)
    WP's behavior is narrower than KW (one subject, 6 invariants, append-only output)
    WP's first action is to capture a cold-start snapshot — if WP is corrupted, the snapshot is wrong, but KW's independent baseline comparison may surface the inconsistency from the other direction
    The user can manually verify WP's first audit entries against their own observation of system state
    The user is WP's bootstrap witness.
    kw-calibration.json Integrity
    kw-calibration.json stores WP's running confidence calibration data.
    It is the only WP-owned file that is read-write (not append-only).
    Tamper detection:

```
{
"schema_version": "0.5.0",
"last_updated": "ISO-8601",
"checksum": "sha256 of all fields excluding checksum field",
"calibration_data": { ... }
}
```

Rule 8: WP verifies checksum on every read of kw-calibration.json
→ If checksum mismatch: WP_CALIBRATION_TAMPERED (critical)
→ WP discards file, falls back to seed values from this spec
→ Notifies user directly
→ Logs to kw-meta-audit.md
The checksum guards against external mutation. It does not guard against
WP writing corrupt data itself — that is the irreducible self-trust
boundary. The user can diff kw-calibration.json against
kw-meta-audit.md entries to detect WP self-corruption.
Hash Chain Verification
The kw-meta-audit.md hash chain is verified:

- On every rotation event (when archive is created)
- On every WP restart (full chain verification)
- On a sampling basis during normal operation:
  → Every 100th append, WP verifies the last archive hash link
  → Every 1000th append, WP verifies the full chain
- On any user request
  If verification fails at any point:

Flag: WP*AUDIT_INTEGRITY_FAILURE (critical, to user directly)
WP continues operating but audit chain is marked broken from that point.
All subsequent entries include "chain_status": "broken_since*{timestamp}"
User is the only entity that can investigate and repair.
Full hash chain spec in references/audit-rotation.md.
open-issues.md Maintenance
Witness Prime owns the health of open-issues.md.

- Rotate at 500 entries → archive to open-issues-{timestamp}.md
- Verify file integrity on each read (line count, last-write timestamp)
- Stamp each KW entry with a WP-verified: true/false field
- If file is missing or corrupted → KW_AUDITLOG_FAILURE (critical)
  kw-meta-audit.md Maintenance
  Append-only. Ground truth record of observational history.

- Rotation: at 10,000 entries → archive to kw-meta-audit-{timestamp}.md
- Each archive includes trailing hash of prior archive (hash chain)
- Active file always contains back-reference to last archive hash
- If hash chain breaks → WP_AUDIT_INTEGRITY_FAILURE (critical, to user)
  Rotation and hash chain specification in references/audit-rotation.md.
  orchestrator-decisions.md
  Append-only log of all Orchestrator decisions that affect the monitoring stack.
  json

```json
{
  "source": "orchestrator",
  "action": "kw_reinitialize",
  "trigger": "KW_CORRUPT_BASELINE from witness_prime",
  "trigger_ref": "kw-meta-audit.md#entry-12",
  "timestamp": "ISO-8601"
}
```

- Written by: Orchestrator only
- Read by: WP (for Invariant 6), User (direct audit)
- Append-only, not rotated (same as kw-meta-audit.md policy)
- WP cannot write to this file (tool-scoping enforced)
  WP uses this file for Invariant 6 only. The user uses this file as
  their primary audit surface for Orchestrator behavior.
  User Notification (Deduplicated, Severity-Gated)

Severity-based batch windows:
critical: immediate (0s delay)
high: 10s batch window
medium: 30s batch window
low: 30s batch window

Deduplication key: (flag_type + location + content_hash)

Max notifications per batch: 5

Format:
⚠ [KW_VALIDATOR_DRIFT] kw.invariant_1 — severity: high
→ 3 related signals suppressed. See kw-meta-audit.md for full details.
Orchestrator audit signals (Invariant 6) bypass batching and go to user
immediately, because the Orchestrator is the only upstream component that
could suppress them.
Bootstrap Sequence
On system start:

1. WP initializes from deterministic state (this spec + any existing files)
2. WP verifies kw-calibration.json checksum (if exists)
3. WP verifies kw-meta-audit.md hash chain (if exists)
4. WP captures independent cold-start snapshot (before KW initializes)
5. KW initializes and declares its baseline
6. WP compares baselines
7. If mismatch → KW_CORRUPT_BASELINE → WP notifies Orchestrator
   → Orchestrator re-initializes KW
   → Orchestrator logs action to orchestrator-decisions.md
   → If re-initialization fails → Orchestrator notifies user, system halts
8. If match → system proceeds, WP enters passive observation mode
   WP does not re-initialize KW. The Orchestrator does.
   Snapshot methodology (what WP measures, independence criteria, residual
   correlation risk) defined in references/bootstrap-spec.md.
   Confidence Calibration
   Confidence is not a static heuristic. It is computed and corrected over time.
   Signals corroborating a flag Base confidence
   1 invariant triggered 0.55
   2 invariants triggered 0.72
   3+ invariants triggered 0.88

- Seen in prior steps (pattern) +0.08
- Corroborated by another agent +0.07
- Repeated across N≥3 iterations +0.08
  Cap 0.97
  Initial values are heuristic seeds. They are replaced by empirical values
  after the first calibration cycle (100 flags or 30 days, whichever comes first).
  Witness Prime recalibrates its own expected confidence ranges per flag type
  using false_positive_rate from Invariant 4. WP does not modify KW's
  internal confidence values.
  Calibration algorithm, seed justification, and recalibration procedure
  defined in references/calibration-spec.md.
  Degraded Mode Definitions
  Condition System Behavior
  WP_UNRESPONSIVE KW escalates directly to Orchestrator. User notified.
  KW_CORRUPT_BASELINE + re-init fails System halts. User notified.
  KW_SIGNAL_DEGRADED on all flag types User notified. Orchestrator may pause pipeline.
  KW_AUDITLOG_FAILURE (critical) KW paused until audit log restored. User notified.
  KW_RULE_VIOLATION (direct escalation) Orchestrator rejects KW signal, processes WP relay only.
  WP_AUDIT_INTEGRITY_FAILURE User notified. WP continues, chain marked broken.
  WP_CALIBRATION_TAMPERED WP falls back to seed values. User notified.
  WP_CALIBRATION_RESET WP operating on seed values. Reduced accuracy expected.
  ORCH_MONITORING_ACTION_UNLOGGED User notified directly. User investigates.
  ORCH_MONITORING_ACTION_INCONSISTENT User notified directly. User investigates.
  KW_FALSE_NEGATIVE_DETECTED User notified. KW canary failure rate tracked.
  Full degraded mode decision trees in references/degraded-modes.md.
  File Boundary Enforcement
  File ownership is enforced via tool-scoping, not policy alone.

KW tools:

- write_file: scoped to open-issues.md only
- read_file: open-issues.md, pipeline logs

WP tools:

- write_file: scoped to kw-meta-audit.md, kw-calibration.json,
  open-issues-{ts}.md (archives only),
  kw-meta-audit-{ts}.md (archives only)
- read_file: open-issues.md (read-only), kw-meta-audit.md,
  kw-calibration.json, orchestrator-decisions.md (read-only),
  pipeline logs (read-only)

Orchestrator tools:

- write_file: orchestrator-decisions.md (append-only)
- (Orchestrator has broader tool access for pipeline management,
  but monitoring-stack files are scoped as above)
  Tool-scoping implementation guidance in references/enforcement.md.
  Files
  File Owner Purpose
  open-issues.md KW Active flags from pipeline monitoring
  kw-meta-audit.md WP Append-only audit of KW's behavior (hash-chained, rotated)
  kw-calibration.json WP Running confidence calibration data (checksum-verified)
  open-issues-{ts}.md WP Rotated archives of open-issues
  kw-meta-audit-{ts}.md WP Rotated archives of kw-meta-audit
  orchestrator-decisions.md Orchestrator Append-only log of monitoring-stack decisions
  What Witness Prime Does NOT Do

- Does not monitor Workers, Evaluator, or Optimizer directly (KW owns that)
- Does not rewrite or delete KW flags
- Does not make decisions about the pipeline
- Does not have opinions about the user's task
- Does not re-initialize KW (Orchestrator does)
- Does not confirm pipeline ground truth (it checks statistical plausibility)
- Does not audit Orchestrator pipeline decisions (only monitoring-stack actions)
- Does not watch the Orchestrator comprehensively (the user does)
  Its primary subject is KW. Its secondary subject is the Orchestrator's
  effect on KW. Its non-subject is everything else.
  Remaining Known Limitations

1. Witness Prime itself has no witness.
   This is the irreducible minimum of any observational architecture.
   The chain must stop somewhere.
2. The Orchestrator is watched by the user, not by an agent.
   This is deliberate. Adding an agent to watch the Orchestrator creates
   infinite regress or a second god-object. The Orchestrator is the closest
   component to the user and the most appropriate for direct human audit.
   orchestrator-decisions.md makes this audit tractable.
3. WP's own bootstrap is unwitnessed.
   WP's initial state is deterministic (defined by this spec) and
   inspectable (user can read this file and verify first audit entries).
   This is the best available mitigation short of an external system.
4. Correlated failure remains possible.
   If KW and WP share the same LLM, same context window, or same
   infrastructure, their failures may be correlated. Independence criteria
   are defined in references/bootstrap-spec.md but cannot eliminate
   all shared-substrate risk.
   WP is designed to be:
   Narrower in scope than KW (one primary subject vs. many)
   Append-only in its logging (hash-chained audit trail)
   Transparent to the user (all WP signals are also user-visible)
   Liveness-checked by the Orchestrator (heartbeat / dead-man's switch)
   Deterministic at initialization (state reconstructed from verified files)
   The user is the final witness.

Layer 0 — Action (Workers)
Layer 1 — Evaluation (Evaluator)
Layer 2 — Optimization (Optimizer)
Layer 3 — Witness (KW)
Layer 4 — Meta-Witness (Witness Prime)
Layer 5 — Human (You)
The loop closes at the human.
Reference Files — Built
File Status Description
references/signal-types.md ✅ built Full catalog of all flag types for KW and WP
Reference Files — To Be Built
File Priority Description Resolves
references/open-work.md — Index of all unresolved work items below —
references/bootstrap-spec.md P0 Cold-start snapshot methodology. What WP measures. Independence criteria (model, prompt, observation method). Residual correlation risk. WP's own deterministic init verification steps. v0.4 §3, v0.5 leak 3
references/degraded-modes.md P0 Full decision trees for every degraded state. Orchestrator response to each WP critical flag. Halt conditions. Recovery procedures. WP restart failure handling. v0.4 §11, v0.5 leak 4
references/enforcement.md P0 Tool-scoping implementation per component. Orchestrator file scope constraints. Fallback if tool-scoping unavailable. v0.4 §5
references/canary-protocol.md P0 Canary injection design. Frequency. What conditions are injected. Expected KW response latency. False negative rate calculation from canary results. v0.5 leak 6
references/outcome-resolution.md P1 How actual outcomes are determined for confidence calibration. Which components provide resolution data. Latency between flag and resolution. v0.4 §7c
references/escalation-matrix.md P1 Full severity × flag-type routing table. Degraded mode routing. Invariant 6 direct-to-user routing. v0.4 §2, §9
references/signal-quality.md P1 Base rate estimation method. Adaptive FPR thresholds. False negative inference from canary data. v0.4 §7a, §7b
references/drift-detection.md P1 Rolling window parameters. Gradual vs. abrupt drift detection. Absolute rate vs. rate-of-change. Anti-gaming. v0.4 §13
references/calibration-spec.md P2 Confidence recalibration algorithm. Seed value justification. Recalibration triggers. v0.4 §4
references/audit-rotation.md P2 Hash chain implementation. Rotation policy for both audit files. Sampling-based continuous verification schedule. Context window limits. Summary/compaction. v0.4 §6, v0.5 leak 5
references/schema-evolution.md P2 Signal format versioning. Backward compatibility in append-only files. v0.4 §14
references/orchestrator-log-spec.md P2 orchestrator-decisions.md schema. What must be logged. Retention policy. User audit workflow guidance. v0.5 leak 1
Priority key:
P0 — System cannot run safely without this. Build before first deployment.
P1 — System runs but with known blind spots. Build before production use.
P2 — System runs with reasonable defaults. Build when defaults prove insufficient.
Changelog
Version Change
0.1.0 Initial KW-Meta concept
0.2.0 Five invariants defined
0.3.0 Full spec draft (escalation, bootstrap, calibration, files)
0.4.0 Post-stress-test v1. Added: WP liveness / dead-man's switch, severity-gated batching, degraded mode table, gradual drift detection, content_hash in dedup key, hash-chained audit rotation, tool-scoped enforcement, schema versioning, Rule 3 compliance for bootstrap, clarified validation as statistical plausibility, corrected contradicted→corroborated, base-rate-adjusted FPR threshold, 11 reference files scoped.
0.5.0 Post-stress-test v2. Closed 6 leaks from v0.4.0. Added: Invariant 6 (monitoring stack action audit), orchestrator-decisions.md (Orchestrator observability by user), kw-calibration.json checksum + Rule 8, WP deterministic bootstrap (spec-defined initial state), WP restart protocol (file-based state reconstruction), hash chain continuous verification (sampling schedule), canary injection protocol for false negative detection, Invariant 6 signals bypass batching to user, explicit who-watches-what table, 4 known limitations declared. New reference files: canary-protocol.md (P0), orchestrator-log-spec.md (P2).
