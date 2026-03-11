# Escalation Matrix
# references/escalation-matrix.md
# Priority: P1 — System runs but with known blind spots without this

---

## What Is This?

Every flag WP emits needs to go somewhere.
This file defines exactly: **who gets notified, how fast, and what happens next.**

Two axes:
- **Severity** — how urgent is this?
- **Flag type** — what kind of problem is it?

---

## Severity Definitions

| Severity | Plain English | Delay |
|---|---|---|
| `critical` | System may be broken right now | 0s — immediate |
| `high` | Something important is wrong | 10s batch window |
| `medium` | Worth knowing, not urgent | 30s batch window |
| `low` | Informational, track over time | 30s batch window |
| `info` | Heartbeat / status only | Not notified to user |

---

## Full Routing Table

| Flag | Severity | → Orchestrator? | → User? | Bypasses batching? |
|---|---|---|---|---|
| `KW_CORRUPT_BASELINE` | critical | ✅ yes | ✅ yes | ✅ yes |
| `KW_AUDITLOG_FAILURE` | critical | ✅ yes | ✅ yes | ✅ yes |
| `WP_AUDIT_INTEGRITY_FAILURE` | critical | ✅ yes | ✅ yes | ✅ yes |
| `WP_CALIBRATION_TAMPERED` | critical | ✅ yes | ✅ yes | ✅ yes |
| `BOOTSTRAP_FAILURE` | critical | ✅ yes | ✅ yes | ✅ yes |
| `KW_BLIND_SPOT` | critical | ✅ yes | ✅ yes | ✅ yes |
| `WP_UNRESPONSIVE` | critical | ✅ yes (Orchestrator self-detects) | ✅ yes | ✅ yes |
| `KW_VALIDATOR_DRIFT` | high | ✅ yes | ✅ yes | ❌ no |
| `KW_RULE_VIOLATION` | high | ❌ Orchestrator rejects KW signal | ✅ yes | ❌ no |
| `KW_SIGNAL_DEGRADED` | high | ✅ yes | ✅ yes | ❌ no |
| `KW_FALSE_NEGATIVE_DETECTED` | high | ✅ yes | ✅ yes | ❌ no |
| `CANARY_INJECTION_REFUSED` | high | ❌ (Orchestrator is the problem) | ✅ yes | ✅ yes |
| `ORCH_MONITORING_ACTION_UNLOGGED` | high | ❌ (Orchestrator is the problem) | ✅ yes | ✅ yes |
| `ORCH_MONITORING_ACTION_INCONSISTENT` | high | ❌ (Orchestrator is the problem) | ✅ yes | ✅ yes |
| `KW_OVERCONFIDENT` | medium | ❌ no | ✅ yes | ❌ no |
| `KW_FALSE_ESCALATION` | medium | ❌ no | ✅ yes | ❌ no |
| `CANARY_RESULT_MISSING` | medium | ✅ yes | ✅ yes | ❌ no |
| `CANARY_UNLOGGED_INJECTION` | medium | ✅ yes | ✅ yes | ❌ no |
| `WP_CALIBRATION_RESET` | medium | ❌ no | ✅ yes | ❌ no |
| `KW_RULE_VIOLATION_PATTERN` | medium | ✅ yes | ✅ yes | ❌ no |
| `WP_BOOTSTRAP_TIMING_ANOMALY` | medium | ❌ no | ✅ yes | ❌ no |
| `KW_CANARY_PASSED` | info | ❌ no | ❌ no | — |
| `WP_HEARTBEAT` | info | ❌ no | ❌ no | — |
| `WP_BOOTSTRAP_OK` | info | ❌ no | ❌ no | — |
| `WP_RECOVERY` | info | ❌ no | ✅ yes (summary only) | ❌ no |

---

## The Orchestrator Exception Rule

Some flags are **caused by the Orchestrator**.
For those, WP never routes through the Orchestrator — it goes direct to user.

```
IF flag source is Orchestrator behavior:
  → skip Orchestrator notification
  → notify user directly
  → bypass batching (user must not miss this)

Affected flags:
  ORCH_MONITORING_ACTION_UNLOGGED
  ORCH_MONITORING_ACTION_INCONSISTENT
  CANARY_INJECTION_REFUSED
```

---

## Degraded Mode Routing

When WP is offline (`WP_UNRESPONSIVE`), normal routing breaks.
KW signals route directly to Orchestrator with reduced filtering:

```
Normal:   KW severity >= high → WP validates → Orchestrator
Degraded: KW severity >= medium → Orchestrator directly (no WP validation)
```

When WP comes back online, it reviews all flags emitted during its absence
and stamps them `wp_verified: false` in `open-issues.md`.

---

## What "Notify User" Looks Like

```
⚠ [KW_VALIDATOR_DRIFT] kw.invariant_1 — severity: high
  KW's flagging rate dropped 100% with no declared criteria change.
  → 2 related signals suppressed. See kw-meta-audit.md for full details.
```

For critical flags:

```
🚨 [BOOTSTRAP_FAILURE] — severity: critical
  System could not establish a coherent baseline after two attempts.
  All agents are paused. Manual inspection required.
  → See kw-meta-audit.md for full failure trace.
```
