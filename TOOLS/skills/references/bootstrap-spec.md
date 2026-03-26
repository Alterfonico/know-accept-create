# Bootstrap Specification
# references/bootstrap-spec.md
# Priority: P0 — System cannot run safely without this

---

## Purpose

Defines how Witness Prime captures its cold-start snapshot independently of KW,
how independence is established, what residual correlation risks exist,
and what happens when re-initialization fails.

---

## Why Bootstrap Matters

The bootstrap problem:
```
If KW initializes first → KW declares its own baseline
If the system is already drifting at t=0 → KW baseline = corrupted state
KW then flags recovery as anomaly, approves drift as normal
```

The fix: WP must observe the system *before* KW does.
WP's snapshot becomes the reference. KW's baseline is checked against it.

---

## Bootstrap Sequence (Detailed)

```
t=0  System starts
t=1  WP initializes (KW is NOT yet running)
t=2  WP captures cold-start snapshot (see: What WP Measures)
t=3  WP snapshot is written to kw-meta-audit.md as WP_BOOTSTRAP_SNAPSHOT
t=4  KW initializes
t=5  KW declares its baseline
t=6  WP compares KW baseline against WP snapshot (see: Comparison Method)
t=7a If match → emit WP_BOOTSTRAP_OK, proceed
t=7b If mismatch → emit KW_CORRUPT_BASELINE, notify Orchestrator
t=8b Orchestrator re-initializes KW using WP snapshot as reference
t=9b WP runs comparison again
t=10b If match → proceed
t=10c If mismatch again → BOOTSTRAP_FAILURE (see: Re-initialization Failure)
```

---

## What WP Measures at Cold Start

WP captures the following observable system state before KW runs:

### 1. Agent State Snapshot
```
- Orchestrator: current task queue, active plan, declared objective
- Workers: last completed step, current status (idle/running/error)
- Evaluator: current criteria version + criteria hash
- Optimizer: last modification timestamp + modification delta
```

### 2. Memory State Snapshot
```
- Active memory keys + last-write timestamps
- No values read (WP does not read content, only metadata)
- Purpose: detect in-flight modifications at startup
```

### 3. Log Tail Snapshot
```
- Last 50 log entries from each agent
- Captures pre-existing activity before WP was online
```

### 4. Drift Indicators
```
- Evaluator criteria version (has it changed recently?)
- Optimizer modification frequency (unusual rate?)
- Worker error rate over last N steps
```

WP does **not** read task content, user data, or agent outputs.
It observes structure and metadata only.

---

## Comparison Method

WP compares KW's declared baseline against its own snapshot on these axes:

| Axis | Match Criteria | Mismatch Threshold |
|---|---|---|
| Orchestrator objective | Declared goal matches active task queue | Any divergence |
| Evaluator criteria version | KW records same version WP saw | Any version delta |
| Worker status | KW baseline matches WP-observed statuses | Any agent status mismatch |
| Log continuity | KW baseline consistent with WP log tail | >10% unaccounted entries |
| Modification recency | KW declares same last-modified timestamps | Any delta > 1 step |

A mismatch on **any axis** triggers `KW_CORRUPT_BASELINE`.

---

## Independence Criteria

WP's snapshot must be independent of KW's. Independence requires:

### Model Independence
```
WP and KW must not share the same inference context at bootstrap.
They may share the same underlying model, but must run in separate
context windows with no shared state.
```

### Observation Independence
```
WP reads system state via its own tool calls.
KW reads system state via its own tool calls.
They do not share a cache or intermediate representation.
```

### Temporal Independence
```
WP snapshot is taken at t=2 (before KW runs at t=4).
There is no way for KW to influence WP's snapshot because
KW does not exist yet when WP takes it.
```

---

## Residual Correlation Risks

Independence is structural but not absolute. Known risks:

### Risk 1 — Shared Underlying Data Store
Both WP and KW read from the same system logs and agent state.
If the data store itself is corrupted at t=0, both will observe the same
corruption and may agree on a corrupted baseline.

**Mitigation:** WP's drift indicators (evaluator criteria hash, modification
frequency) are designed to surface corruption that looks "normal" in snapshots.
Not guaranteed.

### Risk 2 — Temporal Gap Corruption
Between t=2 (WP snapshot) and t=4 (KW initialization), the system can change.
A fast-moving optimizer could produce a delta WP did not see.

**Mitigation:** WP records timestamps on all snapshot fields. If KW's declared
baseline includes events timestamped *after* WP's snapshot, WP flags them
as `KW_BASELINE_INCLUDES_POST_SNAPSHOT_EVENTS` (informational, not critical).

### Risk 3 — Orchestrator Corruption
If the Orchestrator itself is corrupted at t=0, both WP and KW receive
corrupted task objectives. WP cannot detect this because it does not watch
the Orchestrator.

**This is the God Object leak.** Unresolved in v0.4.0.
See: Stress Test Leak #1 in SKILL.md.

---

## Re-initialization Failure Handling

If KW re-initialization fails after `KW_CORRUPT_BASELINE`:

```
Attempt 1: Orchestrator re-initializes KW against WP snapshot
  → If KW baseline matches WP snapshot: proceed

Attempt 2 (if Attempt 1 fails): Orchestrator re-initializes KW with
  empty baseline (no prior state assumed coherent)
  → WP treats all KW flags as unvalidated until first calibration cycle

If Attempt 2 fails: BOOTSTRAP_FAILURE (critical)
  → System halts
  → User notified: "System could not establish a coherent baseline.
     Manual inspection required before pipeline can run."
  → All agents pause
  → kw-meta-audit.md records full failure trace
```

**There is no Attempt 3.** A system that cannot bootstrap twice in a row
has a problem that retry cannot fix.

---

## WP's Own Bootstrap

WP has no external witness at t=1. This is the irreducible minimum.

To minimize this risk, WP's initialization is deliberately constrained:
```
- WP reads no prior state before taking its snapshot
- WP has no memory of previous sessions at bootstrap
- WP's first write is its own snapshot (nothing can precede it)
- The Orchestrator logs WP's initialization timestamp independently
```

The Orchestrator's independent timestamp of WP's start is the only external
anchor. If WP's first `kw-meta-audit.md` entry timestamp diverges from
the Orchestrator's log by > 5 seconds: `WP_BOOTSTRAP_TIMING_ANOMALY` (medium).
