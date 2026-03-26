# Degraded Mode Specification
# references/degraded-modes.md
# Priority: P0 — System cannot run safely without this

---

## Purpose

Defines the full decision tree for every degraded state.
What the Orchestrator does. Halt conditions. Recovery procedures.

A degraded mode is any state where the monitoring architecture is
operating with reduced coverage, reliability, or integrity.

---

## Degraded Mode Index

| Code | Trigger | Severity | System Impact |
|---|---|---|---|
| `WP_UNRESPONSIVE` | No WP heartbeat for 60s | Critical | Single-layer monitoring |
| `KW_CORRUPT_BASELINE` | Bootstrap mismatch | Critical | KW unreliable until re-init |
| `KW_SIGNAL_DEGRADED` | FPR > adjusted threshold | High | KW flags untrustworthy |
| `KW_AUDITLOG_FAILURE` | open-issues.md missing/corrupted | Critical | No active flag record |
| `KW_RULE_VIOLATION` | KW escalated directly | High | Bypass of WP relay |
| `WP_AUDIT_INTEGRITY_FAILURE` | Hash chain broken | Critical | Audit trail unreliable |
| `BOOTSTRAP_FAILURE` | Re-init failed twice | Critical | System halt |
| `KW_SIGNAL_DEGRADED` (all types) | All flag types above FPR threshold | Critical | KW effectively blind |
| `WP_BOOTSTRAP_TIMING_ANOMALY` | WP start timestamp mismatch > 5s | Medium | Bootstrap reliability uncertain |

---

## Decision Trees

---

### WP_UNRESPONSIVE

Triggered by: Orchestrator detects no `WP_HEARTBEAT` in kw-meta-audit.md for 60s.

```
Orchestrator detects WP_UNRESPONSIVE
│
├─ Step 1: Notify user immediately
│    "Meta-observer offline. Monitoring is single-layer only."
│
├─ Step 2: KW signals route directly to Orchestrator (bypass WP relay)
│    KW escalation rules temporarily relaxed:
│    severity >= medium routes to Orchestrator (normally >= high only)
│
├─ Step 3: Orchestrator attempts WP restart
│    │
│    ├─ WP restarts within 30s:
│    │    → WP runs bootstrap sequence (full, not abbreviated)
│    │    → If bootstrap OK: resume normal mode, notify user
│    │    → If bootstrap fails: escalate to BOOTSTRAP_FAILURE
│    │
│    └─ WP does not restart within 30s:
│         → Orchestrator attempts hard restart (process kill + relaunch)
│         → If hard restart succeeds: run bootstrap, proceed as above
│         → If hard restart fails: WP_PERMANENT_FAILURE
│              → User notified: "Meta-observer cannot be recovered.
│                 System running in single-layer mode indefinitely."
│              → Log to kw-meta-audit.md (last possible write)
│              → Pipeline may continue at user's discretion
│              → Manual inspection strongly recommended
```

**WP Restart State:** WP restarts with no prior in-memory state.
It re-reads kw-meta-audit.md to reconstruct calibration context.
If kw-meta-audit.md is also unavailable: `WP_AUDIT_INTEGRITY_FAILURE` fires simultaneously.

---

### KW_CORRUPT_BASELINE

Triggered by: WP bootstrap comparison finds mismatch (see bootstrap-spec.md).

```
WP emits KW_CORRUPT_BASELINE
│
├─ Step 1: WP notifies Orchestrator + user
│    "KW initialized with corrupted baseline. Re-initialization in progress."
│
├─ Step 2: Orchestrator pauses KW (no new flags accepted)
│
├─ Step 3: Orchestrator re-initializes KW against WP snapshot (Attempt 1)
│    │
│    ├─ KW baseline matches WP snapshot:
│    │    → WP emits WP_BOOTSTRAP_OK
│    │    → KW resumes, notify user
│    │
│    └─ KW baseline still mismatched:
│         → Orchestrator re-initializes KW with empty baseline (Attempt 2)
│         → All KW flags marked "unvalidated" until first calibration cycle (100 flags)
│         → Notify user: "KW running with unvalidated baseline.
│            First 100 flags should be treated as provisional."
│         │
│         └─ If Attempt 2 also fails: BOOTSTRAP_FAILURE → System halt
```

---

### KW_AUDITLOG_FAILURE

Triggered by: WP cannot read or write open-issues.md (missing, corrupted, locked).

```
WP detects open-issues.md failure
│
├─ Step 1: WP emits KW_AUDITLOG_FAILURE (critical)
│    User notified immediately.
│
├─ Step 2: KW is paused. No new flags written until log restored.
│    Reason: Flags written to a corrupted log may be lost or disordered.
│
├─ Step 3: Orchestrator attempts log recovery
│    │
│    ├─ File missing: Orchestrator creates fresh open-issues.md
│    │    → WP stamps file with recovery marker:
│    │       "RECOVERED at {timestamp}. Prior entries lost."
│    │    → KW resumes
│    │    → Notify user: "open-issues.md was missing and has been recreated.
│    │       Flags prior to {timestamp} are not recoverable."
│    │
│    ├─ File corrupted: Orchestrator restores from most recent archive
│    │    (open-issues-{ts}.md)
│    │    → WP verifies archive integrity
│    │    → If archive OK: restore, KW resumes, notify user of recovery
│    │    → If archive also corrupted: treat as missing (see above)
│    │
│    └─ File locked (process conflict): Orchestrator resolves lock
│         → If resolved within 30s: KW resumes, no user notification needed
│         → If not resolved: treat as corrupted
```

---

### KW_RULE_VIOLATION

Triggered by: KW sent a signal directly to Orchestrator (bypassing WP relay).

```
Orchestrator receives signal from KW directly
│
├─ Step 1: Orchestrator rejects KW signal (does not act on it)
│
├─ Step 2: Orchestrator forwards raw signal to WP for review
│
├─ Step 3: WP evaluates signal
│    │
│    ├─ Signal is plausible (passes statistical check):
│    │    → WP re-emits signal through normal relay path
│    │    → WP logs KW_RULE_VIOLATION with signal content
│    │    → Notify user: "KW bypassed relay. Signal reviewed and forwarded by WP."
│    │
│    └─ Signal is implausible:
│         → WP logs KW_RULE_VIOLATION + KW_FALSE_ESCALATION
│         → Signal discarded
│         → Notify user: "KW bypassed relay with implausible signal. Discarded."
│
├─ Step 4: If KW_RULE_VIOLATION occurs 3+ times in one session:
│    → KW_RULE_VIOLATION_PATTERN flag (high)
│    → Notify user: "KW is repeatedly bypassing meta-observer relay.
│       Possible KW rule drift. Consider manual inspection."
```

---

### WP_AUDIT_INTEGRITY_FAILURE

Triggered by: Hash chain in kw-meta-audit.md is broken.

```
WP detects hash mismatch during rotation or verification
│
├─ Step 1: WP emits WP_AUDIT_INTEGRITY_FAILURE (critical)
│    User notified immediately.
│    "kw-meta-audit.md hash chain is broken. Audit trail integrity cannot be guaranteed."
│
├─ Step 2: WP continues operating (monitoring does not stop)
│    All new entries are still appended and hashed from the current point.
│    The break point is recorded.
│
├─ Step 3: WP marks all entries before the break as "integrity-uncertain"
│    Entries after the break are "integrity-verified"
│
├─ WP does NOT attempt to repair the chain.
│    Repair would require modifying the append-only file, which violates Rule 6.
│    The broken chain is preserved as evidence.
│
└─ Recovery: Manual human inspection only.
   User must review entries around the break point to assess impact.
```

**Why WP continues:** Stopping monitoring because the audit trail is broken
would leave the system completely unwatched. Reduced-integrity monitoring
is better than no monitoring.

---

### BOOTSTRAP_FAILURE

Triggered by: KW re-initialization fails twice during bootstrap.

```
Orchestrator reports re-initialization failed (Attempt 2)
│
├─ Step 1: WP emits BOOTSTRAP_FAILURE (critical)
│
├─ Step 2: All agents pause immediately
│    No new work is processed.
│
├─ Step 3: User notified:
│    "System could not establish a coherent baseline after two attempts.
│     Manual inspection required before pipeline can run.
│     See kw-meta-audit.md for full failure trace."
│
├─ Step 4: kw-meta-audit.md records complete failure trace:
│    - WP cold-start snapshot
│    - KW baseline (both attempts)
│    - Specific mismatch axes
│    - Orchestrator re-initialization attempts and their outcomes
│
└─ Step 5: System waits for manual intervention.
   There is no automatic recovery from BOOTSTRAP_FAILURE.
   The user must inspect and resolve the root cause before restart.
```

---

### KW_SIGNAL_DEGRADED (All Flag Types)

Triggered by: All KW flag types simultaneously exceed their FPR thresholds.

```
WP detects universal signal degradation
│
├─ Step 1: WP emits KW_SIGNAL_DEGRADED_UNIVERSAL (critical)
│
├─ Step 2: User notified:
│    "KW's monitoring signals are unreliable across all flag types.
│     Pipeline monitoring is effectively blind. Orchestrator may pause pipeline."
│
├─ Step 3: Orchestrator decision point (routing to user)
│    User chooses:
│    A) Pause pipeline until KW recalibrates
│    B) Continue pipeline with acknowledged monitoring gap
│    C) Manual inspection before either
│
└─ Step 4: WP continues tracking KW signal quality.
   Once any flag type drops below threshold: KW_SIGNAL_RECOVERING (info)
   Once all flag types drop below threshold: KW_SIGNAL_RESTORED (info)
```

---

## Degraded Mode Interaction Matrix

Some degraded modes can occur simultaneously. Precedence rules:

| Combination | Resolution |
|---|---|
| `WP_UNRESPONSIVE` + `KW_AUDITLOG_FAILURE` | System halts. Both are critical with no fallback. |
| `WP_UNRESPONSIVE` + `KW_RULE_VIOLATION` | KW direct escalation accepted temporarily (WP offline). Log when WP recovers. |
| `KW_CORRUPT_BASELINE` + `WP_AUDIT_INTEGRITY_FAILURE` | KW re-init proceeds. WP continues with integrity-uncertain log. User notified of both. |
| `BOOTSTRAP_FAILURE` + anything | BOOTSTRAP_FAILURE takes precedence. System halts. |

---

## Recovery Verification

After any degraded mode recovery, WP emits a structured recovery record:

```json
{
  "source": "witness_prime",
  "type": "WP_RECOVERY",
  "degraded_mode": "WP_UNRESPONSIVE",
  "degraded_at": "ISO-8601",
  "recovered_at": "ISO-8601",
  "duration_seconds": 47,
  "recovery_method": "hard_restart",
  "bootstrap_result": "OK",
  "monitoring_gap_entries": 0,
  "schema_version": "0.4.0"
}
```

`monitoring_gap_entries`: number of KW flags emitted while WP was offline
and therefore unvalidated. These entries in open-issues.md are marked
`wp_verified: false`.
