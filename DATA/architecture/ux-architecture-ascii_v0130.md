# MEVERSE — UX ARCHITECTURE

# THREE-ACT LOOP · as of v0.18.0 · 2026-03-10

```
╔══════════════════════════════════════════════════════════════════╗
║  ACT I — HOOK                                                    ║
║  First-time only                                                 ║
╚══════════════════════════════════════════════════════════════════╝

  [ Splash ]
      │
      ▼
  [ Register / Login ]
      │
      ▼
  [ First Capture ]  ◀── half-screen modal · "what's here right now..."
      │                   [ save for now ]  [ send ]
      │
      │  save for now ──▶ echo appended silently · navigate to 🪵 Home
      │                   detail panel auto-opens on origin echo
      │
      ▼  AI classifier runs on send
      │  { voltage: "FLAT"|"HI"|"LO", confidence: float }
      │  failure → voltage: null · entry stored · silent · re-classifiable
      │
      ├── [LO / FLAT] ───────────────────────────────────────────────┐
      │                                                              │
      └── [HI] ─────────────────────────────────────────────┐        │
                                                            │        │
                                                            ▼        │
                                                 [ Voltage Bubble ]  │
                                                 modal expands       │
                                                 half → full screen  │
                                                 ambient hold 1.5s   │
                                                            │        │
                                         ┌──────────────────┤        │
                                         │                  │        │
                                   confidence           confidence   │
                                    ≥ 0.85               < 0.85      │
                                         │                  │        │
                                         ▼                  ▼        │
                                   ~ WAVE ~           ▪ WALL ▪       │
                                   smooth expand      fast snap      │
                                   pulse animation    still          │
                                         │                  │        │
                                         ▼                  │        │
                              "want to go deeper?"          │        │
                                         │                  │        │
                                   ┌─────┴──────┐          │        │
                                   │            │          │        │
                                  [Y]          [N]         │        │
                                   │            │          │        │
                                   ▼            │          │        │
                          [ Analysis            │          │        │
                            WAVE ]              │          │        │
                          full-bleed            │          │        │
                          ~70% viewport         │          │        │
                          2-3 observations      │          │        │
                          staggered fade        │          │        │
                          question at bottom    │          │        │
                               │               │          │        │
                               │  "open        │  direct  │ direct │
                               │  echoes →"    │  to 🪵   │ to 🪵  │
                               │               │          │        │
                               └───────────────┴──────────┴────────┘
                                                       │
                                                       ▼
                                                 [ 🪵 Home ]
                                                 ALL Act I exits
                                                 auto-open detail panel
                                                 on origin echo
                                                 origin echo marked ◆
                                                       │
                                                       ▼
                                                 [ Detail Panel ]
                                                 slides from right · 82%
                                                 full text · meta · analysis
                                                 ─────────────────────
                                                 inquiry input pinned
                                                 at bottom:
                                                 "ask about this moment..."
                                                 ─────────────────────
                                                 answer stored as
                                                 child echo · linked
                                                 to parent
                                                 ─────────────────────
                                                 ✕ close · overlay tap
                                                 or navigate away
                                                       │
                                                       ▼
                                                     [ 🪵 ]

  ✓ RESOLVED — Act I post-send destination locked 2026-03-10
  Updated v0.18.0: uniform destination for ALL Act I → Home exits.
  Detail panel auto-opens on origin echo regardless of path.
  No intermediate screens between any Act I exit and Home.

  Origin echo marker:
  Subtle visual distinction on first echo — quiet signal that this one
  started something. CSS class only · ◆ top-right · color-matched · applies all paths.

  Detail panel (v0.18.0):
  Tap any echo → panel slides from right (82% width).
  Shows: full text · timestamp · voltage · confidence · words · origin marker.
  Analysis block below metadata.
  Inquiry input pinned at bottom: "ask about this moment..."
  Answer stored as child echo · linked to parent.
  In Act I: auto-opens on origin echo for ALL exits to Home.
  Reusable in Act II and Act III (any echo, any time).

  Path-specific behavior when detail panel auto-opens on origin echo:
  ┌────────────────┬──────────────────────────────────────────────────┐
  │ save-for-now   │ header flash: "saved. that took something." 3s  │
  │                │ analysis: "classifying..."                       │
  │                │ inquiry placeholder: seed question               │
  ├────────────────┼──────────────────────────────────────────────────┤
  │ wall           │ header: "◆ origin echo"                         │
  │                │ analysis: wall text (purple accent)              │
  │                │ inquiry placeholder: seed question               │
  ├────────────────┼──────────────────────────────────────────────────┤
  │ wave "not now" │ header: "◆ origin echo"                         │
  │                │ analysis: default from classifier                │
  │                │ inquiry placeholder: seed question               │
  ├────────────────┼──────────────────────────────────────────────────┤
  │ wave "yes"     │ header: "◆ origin echo"                         │
  │                │ analysis: default from classifier                │
  │                │ inquiry placeholder: seed question               │
  │                │ (user already saw wave analysis on prior screen) │
  └────────────────┴──────────────────────────────────────────────────┘

  ╔════════════════════════════════════════════════════════════════╗
  ║  TOMBSTONE — lo-path modal · removed v0.18.0                   ║
  ╚════════════════════════════════════════════════════════════════╝

  WHAT IT WAS:
  A bottom-sheet modal that appeared after save-for-now and as a
  waypoint for wall/wave-not-now paths. Contained three pieces:
  1. Acknowledgment copy ("saved. that took something.")
  2. Seed question ("what's the thing you keep almost saying...")
  3. Wall analysis (merged when coming from wall path)

  WHY IT WAS KILLED:
  The detail panel (v0.18.0) absorbs all three jobs. The modal was
  a redundant waypoint adding one tap to every Act I exit. Every path
  now routes directly to Home with the detail panel auto-opening on
  the origin echo. The acknowledgment becomes a header flash. The
  seed question becomes the inquiry placeholder. The wall analysis
  becomes the analysis block.

  WHAT CHANGED:
  - Save-for-now: was 3 taps (save → modal → skip → home). Now 1 tap (save → home).
  - Wall: was 3 taps (wall → modal → skip → home). Now 1 tap (wall → home).
  - Wave "not now": was 3 taps (not now → modal → skip → home). Now 1 tap (not now → home).
  - Every path lost exactly one screen and one tap.

  Lo-path modal scope note (updated): no longer applies.
  Previous rule: "Act I only, one-time globally."
  Now: no modal exists. Act II wave/wall returns directly to 🪵 Home.

  Second-order seed question trigger → PARKED (Stage 5)
  Re-surface seed question when behavioral signals indicate depth-seeking:
  sustained HI streaks · increasing word count trend · low LO/FLAT ratio.
  Threshold TBD from real data — not assumptions.
  Requires N sessions before classifier can distinguish processing from dumping.


╔══════════════════════════════════════════════════════════════════╗
║  ACT II — RITUAL                                                 ║
║  Every subsequent use · re-entry lands on 🪵                     ║
╚══════════════════════════════════════════════════════════════════╝

  App re-entry ──▶ [ 🪵 ]  ◀── this is the capture surface
                      │
                      │  full-width input bar · always present
                      │  draft persists on navigate · cleared by send
                      │  or save for now only
                      │
                      ▼
                  [ tap input ]
                      │
                      ▼
                  [ type · send ]
                  [ save for now ] → stays on 🪵 · clears draft
                                     confirmation copy: TBD
                                     PARKED: "got it, be back when you're ready"
                                     — not in mockup as of v0.16.0
                                     NOTE: same label as Act I but different behavior.
                                     Act I triggers lo-modal (one-time). Act II stays on 🪵.
                                     Difference is invisible to user after onboarding.
                      │
                      ▼  AI classifier → { voltage, confidence }
                      │  voltage inferred · never explicitly selected
                      │  failure → voltage: null · entry stored · silent
                      │  classifier calls queued · no concurrency
                      │
                      ├── [LO / FLAT] ──▶ echo appended · accent bar pulses once
                      │                   post-send signal: placeholder flash
                      │                   "breathe, captured." · 2s · reverts
                      │                   send only · save-for-now stays silent
                      │                   copy rotates in future · single string for now
                      │
                      └── [HI] ──▶ Wave or Wall (confidence decides)
                                   accent bar pulses once on return
                                   voltage revealed passively
                                   ──────────────────
                                   Wave → Analysis Wave → "open echoes →" → 🪵
                                   Wall → Analysis Wall (lower third) → auto-dismiss → 🪵
                                   No lo-modal · Act I only · one-time globally
                      │
                      └──▶ [ 🪵 ] ──────────────────────────────▶ loop

  other screens: pill ~60% width · thumb-sized · centered
                 tap → capture sheet slides up
                 same send flow · same classifier · same draft persistence


╔══════════════════════════════════════════════════════════════════╗
║  ACT III — MIRROR                                                ║
║  Pattern → meaning                                               ║
╚══════════════════════════════════════════════════════════════════╝

  ┌──────────────────────────────────────────────────────────────┐
  │  🪵  HOME (Echoes)                                           │
  │                                                              │
  │  ≡  echoes                                      [full input] │
  │  ─────────────────────────────────────────────────────────   │
  │  ┌─────────────────────────────────────────────────────┐     │
  │  │▓ something is shifting and I can't quite name it    │     │
  │  │  today · 09:14  HI · 1 · LIFE                       │     │
  │  └─────────────────────────────────────────────────────┘     │
  │  ┌─────────────────────────────────────────────────────┐     │
  │  │▓ I keep cancelling things I actually want to do     │     │
  │  │  yesterday · 22:03  LO · 2 · UPSET                  │     │
  │  └─────────────────────────────────────────────────────┘     │
  │                                                              │
  └──────────────────────────────────────────────────────────────┘
         │                    │                    │
  [≡ swipe right]    [tap echo]             [long press on echo]
         │                    │                    │
         │                    ▼                    ▼
         │          [ Detail Panel ]       [ Action Menu Modal ]
         │          slides from right        max 3 actions · TBD
         │          82% width
         │          ──────────────────
         │          full text · timestamp
         │          voltage · confidence
         │          word count · analysis
         │          ──────────────────
         │          local Fractal          ◀── hidden until threshold
         │          shown only when data        absent > empty principle
         │          exists · no placeholder
         │          ──────────────────
         │          inquiry input pinned:
         │          "ask about this moment..."
         │          answer → child echo
         │
         ▼
  ┌─────────────┐
  │  SIDE NAV   │
  │             │
  │  ⌕ search  │
  │    echoes   │
  │  ◎ echoes  ──────▶ [ 🪵 ]
  │  ◈ insights──────▶ [ Insights ]
  │  ──────────│
  │  ◇ profile │
  │    settings│
  └─────────────┘

  ┌──────────────────────────────────────────────────────────────┐
  │  INSIGHTS                              ← back to 🪵          │
  │                                                [pill input]  │
  │  [ uptime ]              [ fractal ]                         │
  │  ─────────────────────────────────────────────────────────  │
  │                                                              │
  │  UPTIME tab:                  FRACTAL tab (global):          │
  │  heatmap grid                 all echoes as hub              │
  │  day = square                 ring 1 = recent entries        │
  │  color = voltage              ring 2 = older, faded          │
  │  3-month view                 same renderer as local fractal │
  │  tap = tooltip                zoom out = global view         │
  │                               hidden until threshold         │
  │  ■ green  1 · LIFE · HI                                     │
  │  ■ red    2 · UPSET · LO                                    │
  │  ■ orange 0 · POKE · FLAT                                   │
  │  □ grey   no entry                                           │
  │                                                              │
  └──────────────────────────────────────────────────────────────┘

  FRACTAL — ONE RENDERER · TWO ENTRY POINTS
  ┌──────────────────────────────────────────┐
  │  local  · from echo drawer               │
  │           hidden until threshold met     │
  │           this echo = center             │
  │           N degrees of connection out    │
  │                                          │
  │  global · from Side Nav → Insights       │
  │           hidden until threshold met     │
  │           all echoes · full network      │
  │           zoom level = parameter only    │
  └──────────────────────────────────────────┘


╔══════════════════════════════════════════════════════════════════╗
║  DESIGN PRINCIPLES                                               ║
╚══════════════════════════════════════════════════════════════════╝

  Absent > Empty
  If a feature has no data, remove it from the layout entirely.
  A placeholder is a last resort, not a default.

  Voltage is metadata · text is the asset
  Classifier failure never loses an entry. voltage: null is valid state.

  Frictionless beats, 8/10 times
  When in doubt, remove the step.

  The system reads · the user witnesses
  Voltage is never selected explicitly. It is inferred and revealed.


╔══════════════════════════════════════════════════════════════════╗
║  PARKED                                                          ║
╚══════════════════════════════════════════════════════════════════╝

  · Capture intent as routing signal — quick input → classify and move on ·
    slow/deliberate input → offer wave/wall. Body-first principle extended to
    the act of typing itself. Possible implementation: input symbols, dwell time,
    or word count threshold. Stage 5+ · needs behavioral data first.
  · Reply (right swipe on echo) — linked log, directional ref to parent
    NOTE: will conflict with edge swipe (Side Nav) — resolve before shipping
  · Local Fractal threshold — exact number TBD
  · First Capture as multi-turn intake session
  · Second-order seed question trigger — re-surface when behavioral signals
    indicate depth-seeking (HI streak · word count trend · LO/FLAT ratio).
    Stage 5 feature · needs real data · not assumptions.
  · Search expansion: phase 1 text ✓ → date → voltage → analysis → semantic
  · Decision skill — lightweight protocol for low-context decisions
  · Headphone/AirPods layer — gesture + audio input, haptic breath
  · Long press action menu — actions undefined
  · Inquiry child echo — classifier/storage spec TBD.
    Same classifier as main echo? Stored as linked child or top-level?
    Async failure → same pattern (null voltage, stored silent). Spec when building pipeline.
  · Fragmented logging prevention — cool-down timer, min char count,
    side notification, or other. Solve separately from core UX.
  · Additional input modes — trinary pulse, voice. Revisit when
    text capture is stable.


╔══════════════════════════════════════════════════════════════════╗
║  TRINARY STATE · same integer · different altitude               ║
╚══════════════════════════════════════════════════════════════════╝

  Layer 0 — Metaphysical   0 = infinite potential  1 = polarity A   2 = polarity B
  Layer 1 — Biological     0 = POKE                1 = LIFE         2 = UPSET
  Layer 2 — UX/Mobile      0 = FLAT                1 = HI           2 = LO

  Green  = 1 · LIFE · HI
  Red    = 2 · UPSET · LO
  Orange = 0 · POKE · FLAT
  Grey   = no entry
```
