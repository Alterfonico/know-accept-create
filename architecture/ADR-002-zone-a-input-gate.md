# ADR-002: Zone A — The Nursery Gate

**Date:** 2026-03-01  
**Status:** Updated 2026-03-03
**Domain:** Input Architecture

---

## The Law

A deterministic state machine. Three discrete integers. Nothing else.

```
0 = POKE   — presence, contact, attention
1 = LIFE   — baseline, maturation, the smile
2 = UPSET  — erosion, stress, the frown
```

---

## The Map

```
Zone A  →  Zone B  →  Zone C
Input      Process    Ledger
Gate       n8n        Tally
```

---

## The Payload

```json
{
  "state": 0 | 1 | 2,
  "timestamp": "ISO 8601",
  "device": "computer" | "mobile" | "other"
}
```

No PII. No narrative. No tags — intentionally absent in v1.0, not overlooked.

---

## Validation

State must be within `{0,1,2}` before transmission. On rejection — silent log, no retry prompt. The gate does not ask twice.

---

## Amendments from v1.0 Review

- `context` field captures dual-channel source — user-initiated vs system-prompted signals are stored together, queried separately in Zone C
- Rejection behavior defined at the boundary
- Tags deferred to v1.1
- `device` field formally documented: `mac`, `phone`, `other`
  `mac` confirmed in production 2026-03-02

---

## What This Is Not

A mood app. The payload carries no interpretation.
Meaning lives downstream, never at the gate.
