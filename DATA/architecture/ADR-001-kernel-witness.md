# ADR-001: The Kernel Witness (KW)

**Date:** 2026-02-26  
**Status:** Accepted  
**Domain:** System Architecture

---

## Context

A self-validating meta-factory requires an integrity layer that sits above all other agents. Without it, every sub-agent optimizes within its own domain with no reference to the universal ground truth. Garbage compounds confidently across the entire system.

The question raised: how does the system decide when to birth a new sub-agent pair — and who makes that decision?

---

## Decision

The Kernel Witness is not an authority. It is a witness.

It does not decide — it detects. The conditions of the system trigger differentiation, not the will of a central controller. This distinction prevents the KW from becoming a single point of failure and a single point of manipulation.

---

## The KW Holds Three Things

**1. The axiom** — immutable reference. All agents are measured against it regardless of their specialization. The axiom can evolve but only through the protocol the axiom itself established.

**2. The gap metric** — the distance between what the system predicted and what reality delivered. This is the only self-validation that isn't circular.

**3. The differentiation protocol** — the conditions under which a new builder/validator pair is born.

---

## The Differentiation Protocol

A new sub-agent pair is born when the KW detects all three:

1. A single agent producing outputs that require correction in the **same direction** across minimum **three cycles**
2. The gap metric confirms the deviation is **systematic**, not random
3. The three closing questions of The Loop confirm the gap is **real and persistent**

When all three conditions are met the KW issues a **differentiation signal** containing:

- The domain requiring specialized handling
- The evidence from the logs
- The constraints the new pair will operate within
- The success condition — how we know the pair is working

---

## The Twin Principle

The KW never births a builder without a validator or a validator without a builder.

**Builder alone** = hallucination engine  
**Validator alone** = paralysis  
**Both together** = a productive, self-correcting pair

This is the Father/Mother framework implemented at the agent level. Every child arrives with both polarities intact.

---

## Architecture

```
KW — Kernel Witness
│
├── axiom v1.0 — immutable reference
│
├── Pair 01: Emotional Capture         ← Stage 1
│   ├── Builder — logs triggers
│   └── Validator — checks integrity
│
├── Pair 02: Pattern Recognition        ← Stage 2
│   ├── Builder — surfaces patterns
│   └── Validator — checks against gap metric
│
└── Pair 0N: [born when logs demand it]
    ├── Builder — domain defined by data
    └── Validator — domain defined by data
```

---

## The KW's Own Integrity

The KW is validated by the axiom it holds. It cannot approve a change to the axiom without running that change through the axiom's own upgrade conditions. This is not circular — this is integrity. The witness cannot corrupt what it witnesses without leaving evidence in the gap metric.

---

## Current Implementation

**Stage 0:** The KW is human. One breath before every input. The three gates. The three closing questions. Manual, present, irreplaceable.

**Stage 3–4:** The KW becomes a schema constraint — structural integrity enforced at the database level.

**Stage 5+:** The KW becomes an agent — the axiom validator running automatically, watching for drift across all pairs.

---

## What This Solves

The question that surfaced this decision:

> *"What if I'm confidently wrong and hallucinate math and convince myself a new axiom is better?"*

The KW is the answer. Not because it prevents the question — but because it requires that question to leave evidence before any change propagates.

Hallucination doesn't survive a gap metric. Confident wrongness doesn't survive three cycles of logged reality.

The witness just watches. Reality does the rest.
