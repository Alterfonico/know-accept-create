# ADR-004: Zone A Mobile — UX Vocabulary Layer

**Date:** 2026-03-09
**Status:** Draft
**Domain:** Mobile App Architecture

---

## Context

The mobile app (Stage 4+) extends Zone A with a body-first capture interface.
It operates at Layer 2 of the trinary model — the UX altitude.
It does not replace ADR-002. It inherits from it.

---

## The Vocabulary

Layer 2 names map directly to Layer 1 integers.
No translation layer exists — only altitude.

```
Layer 2 (UX)   →   Layer 1 (ADR-002)   →   Integer
FLAT           →   POKE                →   0
HI             →   LIFE                →   1
LO             →   UPSET               →   2
```

---

## The Classifier

Every echo (log entry) is classified on save.
Classification runs async — non-blocking.
The breath bubble fires immediately. Classification happens in the background.

```json
{
  "voltage": "FLAT" | "HI" | "LO",
  "confidence": float
}
```

Entries below confidence threshold receive `voltage: null`.
Null entries are excluded from pattern views — not misclassified.

---

## The Heatmap Contract

Uptime Visualization reads voltage per day and renders accordingly.

```
Green   →   1 / LIFE / HI     baseline · the smile
Red     →   2 / UPSET / LO    erosion · the frown
Orange  →   0 / POKE / FLAT   presence · no clear state
Grey    →   no entry           nothing logged that day
```

---

## First Capture (Act I)

Classifier runs on save of the first echo.
Single entry is thin signal — confidence threshold matters more here
than at any other point in the system.
If confidence is below threshold: route LO by default, reclassify when
sufficient entries exist.

---

## Act II Classifier

Runs async after every save in the daily ritual loop.
Does not block the somatic close (inhale · exhale 3s).
Failure behavior: entry receives `voltage: null`, excluded from
pattern views until reclassified.

---

## What This Is Not

A replacement for ADR-002. The data layer speaks POKE / LIFE / UPSET.
The UX layer speaks FLAT / HI / LO. Both are correct.
The integer is the ground truth. Everything else is altitude.
