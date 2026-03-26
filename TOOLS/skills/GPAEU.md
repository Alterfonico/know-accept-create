# GPAEU — The One Ring
<!-- skills/GPAEU.md · Born S85 · 2026-03-26 -->
<!-- Mirror: https://www.notion.so/32f9e3568728814792a6e5e30bf18745 -->

## What This Is

A single recursive loop that governs decisions at every scale — from a one-line
code fix to a multi-session project. Same shape. Same five functions. Only `x` changes.

Twin-atom polarity:

    BUILD SIGNAL:   SCOPE(x) → COMPRESS(log x) → COMPOUND(2ˣ)
    KILL ENTROPY:   EVALUATE(1/x) → CALIBRATE(sin x) → PRUNE or SCALE

A without B = runaway complexity. B without A = premature pruning. A ⊗ B = the one ring.

---

## The Five Functions

| Symbol   | Function          | Role                    | Question it answers                     |
|----------|-------------------|-------------------------|-----------------------------------------|
| `x`      | `f(x) = x`        | Scope / Identity        | What is literally true right now?       |
| `log(x)` | Logarithmic       | Compression / Plan      | What is the minimum structure needed?   |
| `2ˣ`     | Exponential       | Compounding / Act       | Is this building on what came before?   |
| `1/x`    | Hyperbolic decay  | Pruning / Guard         | Is return collapsing as effort grows?   |
| `sin(x)` | Oscillation       | Phase / Calibration     | Am I at a peak or grinding a trough?    |

---

## The Loop

    WHILE goal ≠ done:
      1. SCOPE      f(x) = x       Name the current state exactly.
      2. PLAN       f(x) = log(x)  Compress to minimum structure. ≤5 steps.
      3. ACT        f(x) = 2ˣ      Execute. Each action must build on the last.
      4. EVALUATE   f(x) = 1/x     Is value growing or entropy growing?
      5. CALIBRATE  f(x) = sin(x)  Read the energy phase before deciding.
      6. UPDATE     mutate x        Compress into RING STATE. Carry forward.

---

## Control Constants

    k                  = risk tolerance (0.5 / 1.0 / 1.5 / 2.0)
    threshold_decay    = minimum 1/x before pruning fires (default: 0.1)
    threshold_phase    = sin(x) floor before you pause (default: 0)

---

## Step-by-Step Instructions

### Step 0 — Open the Ring

    IF previous RING STATE exists:
        Load it. Read NEXT x. That is your current x.
    ELSE:
        State your goal in one sentence. That sentence is x.

### Step 1 — SCOPE: f(x) = x

State the current literal situation in ≤3 sentences.
Test: can someone with zero context know exactly what exists right now?
If no → rewrite.

Output:
    SCOPE: [plain factual statement]

### Step 2 — PLAN: f(x) = log(x)

Compress to ≤5 steps. Each step = single verb + noun.
If >5 steps needed → spawn a nested loop, not a longer list.
Set formula pair and k.

Output:
    PLAN:
      1. [verb] [noun]
      ...
    PAIR: 1/x (measuring: ___) vs 2ˣ (measuring: ___)
    k = [value]

### Step 3 — ACT: f(x) = 2ˣ

After each sub-step ask:
    "Does this action USE the output of my last action?"
    YES → compounding → continue
    NO  → additive    → reconnect to chain before continuing

Warning signs of additive work:
  - Restating things already established
  - Switching topics without linking
  - Volume without reference to prior output
  - "Starting fresh" without an explicit PRUNE decision

### Step 4 — EVALUATE: 1/x ⊗ 2ˣ (Guardian Gate)

    DECISION MATRIX:

    δ_growth/δ_decay > k  AND  φ > 0   →  SCALE
    δ_growth/δ_decay > k  AND  φ ≤ 0   →  PAUSE  (value exists, energy low)
    δ_growth/δ_decay ≤ k  AND  φ > 0   →  PIVOT  (energy exists, direction wrong)
    δ_growth/δ_decay ≤ k  AND  φ ≤ 0   →  PRUNE  (kill thread, archive state)

    Simplified:
    2ˣ rising  AND  1/x still > threshold  →  CONTINUE
    2ˣ rising  AND  1/x → 0               →  PRUNE / PIVOT
    2ˣ flat    AND  1/x stable             →  log(x) — replan

    Memory health:
    ψ = log(decisions_made) / (errors_corrected + 1)
    ψ > 2.0   → high confidence, proceed fast
    ψ 1–2     → normal
    ψ < 1.0   → noisy, run Review Loop before next action

### Step 5 — CALIBRATE: sin(x)

    Peak        → output may look better than it is. Stress-test.
    Trough      → output may look worse than it is. Don't kill good work.
    Zero-cross  → phase transition. Decide carefully.

### Step 6 — UPDATE: mutate x

Write the RING STATE. See memory section below.

---

## RING STATE Template

    ## RING STATE — [session / date / loop N]

    ### Identity
    - x (current state):       [one sentence, factual]
    - x_desired (goal):        [one sentence, measurable]

    ### Momentum
    - 2ˣ signal:               [what's compounding?]
    - 1/x signal:              [what's decaying?]
    - ψ (compression score):   log(decisions) / (errors + 1)

    ### Phase
    - sin(x) reading:          [peak / trough / zero-crossing]
    - Phase-adjusted decision: [SCALE / PAUSE / PIVOT / PRUNE]

    ### Plan State
    - Completed:  [...]
    - Remaining:  [...]
    - k:          [current value]

    ### Next Loop
    - NEXT x:      [mutated input for next iteration]
    - NEXT action: [single verb + noun]
    - Nested loops: [any open sub-loops?]

---

## Compact Notation

    [GOAL] state₀ → state_desired
    [PLAN] (1/x ⊗ 2ˣ) with k=1.2, phase=sin(t)
    [ACT]  execute · f(x)=x in scope
    [OBS]  measure {δ_decay, δ_growth, φ_phase}
    [EVAL] if δ_growth/δ_decay > k AND φ > 0 → SCALE else PRUNE
    [UPD]  compress → ψ_memory

---

## Scenario Quick-Reference

| Scenario             | 1/x (decay)             | 2ˣ (growth)              | k   |
|----------------------|-------------------------|--------------------------|-----|
| Code refactor        | bugs / complexity       | speed / clarity          | 1.0 |
| Feature scoping      | edge cases / creep      | user value delivered     | 0.7 |
| Learning             | confusion / time        | capability gained        | 1.5 |
| Session continuity   | context decay           | thread relevance         | 0.5 |
| Writing              | revision fatigue        | clarity per paragraph    | 1.2 |
| Agent/tool build     | complexity added        | problem actually solved  | 1.5 |
| Emotional processing | rumination / drain      | clarity gained           | 0.5 |
| Session ritual       | steps added / friction  | sessions sealed cleanly  | 0.7 |
| Notion structure     | pages / complexity      | info found quickly       | 0.8 |

---

## Quick-Start (copy-paste)

    ## SESSION OPEN — GPAEU
    Previous RING STATE: [paste or FRESH START]
    Current x: [one sentence — what is literally true right now?]
    Goal:      [one sentence — what does done look like?]
    k:         [0.5 / 1.0 / 1.5 / 2.0]
    Begin loop.

---

## Verification — it's working when:

- You can resume any session from just a RING STATE with no context loss
- You prune threads before they become debt
- Plans are shorter than problems
- Each action references the previous action's output
- You can distinguish a phase trough from actual failure
- You never ask "where was I?" — the state tells you

---

## Drift Log
<!-- Record improvements, deviations, and corrections here. Append only. -->
<!-- Format: DATE · VERSION · CHANGE · REASON -->
<!-- First entry added at birth. Subsequent entries added by system ENTRIES record. -->

| Date | Version | Change | Reason |
|------|---------|--------|--------|
| 2026-03-26 | v1.0 | Born | Forged from GPAEU refine-cycle (ENTRIES). Champion pair 1/x + 2ˣ confirmed in Glossary Register 4. |

---

*Part of → GPAEU — The One Ring (Notion LAB)*
*Sessions covenant: Forge ✅ / Fire ⏳ / Fractalize 🌀*
