# MEVERSE — UX ARCHITECTURE

# THREE-ACT LOOP · as of v0.6.0 · 2026-03-09

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
      │  save for now ──▶ lo-path modal · with "skip →" escape to 🪵
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
                                         ▼                  ▼        │
                              "want to go deeper?"  [ Analysis       │
                                         │            WALL ]         │
                                   ┌─────┴──────┐    lower third     │
                                   │            │    ~35% viewport   │
                                  [Y]          [N]   1-2 lines       │
                                   │            │    auto-dismiss 7s │
                                   ▼            │    tap to dismiss  │
                          [ Analysis            │    early           │
                            WAVE ]              │         │          │
                          full-bleed            └────┬────┘          │
                          ~70% viewport              │               │
                          2-3 observations           │               │
                          staggered fade             ▼               │
                          question at bottom  ┌──────────────────┐   │
                               │              │  lo-path modal   │◀──┘
                               │              │  one-time only   │
                               │              │  ──────────────  │
                               │              │  Wall analysis   │
                               │              │  merged here     │
                               │              │  if Wall path    │
                               │              │  ──────────────  │
                               │              │  saved.          │
                               │              │  that took       │
                               │              │  something.      │
                               │              │  ──────────────  │
                               │              │  seed question   │
                               │              │  ai-generated    │
                               │              │  ──────────────  │
                               │              │  skip →  (dim)   │
                               │              └────────┬─────────┘
                               │                       │
                               └───────────────────────┤
                                                       │
                                                       ▼
                                                     [ 🪵 ]


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
                  [ save for now ] → "got it, be back when you're ready"
                                     dissolves · stays on 🪵 · clears draft
                      │
                      ▼  AI classifier → { voltage, confidence }
                      │  voltage inferred · never explicitly selected
                      │  failure → voltage: null · entry stored · silent
                      │  classifier calls queued · no concurrency
                      │
                      ├── [LO / FLAT] ──▶ echo at top · silent
                      │                   accent bar pulses once
                      │                   voltage confirmed visually
                      │
                      └── [HI] ──▶ Wave or Wall (confidence decides)
                                   accent bar pulses once on return
                                   voltage revealed passively
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
  │  🪵  HOME — Log List (Echoes)                                │
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
  [≡ swipe right]   [tap echo to expand]    [long press on echo]
         │                    │                    │
         │                    ▼                    ▼
         │          expands 30% → 60%     [ Action Menu Modal ]
         │          drawer reveals:         max 3 actions · TBD
         │          voltage · confidence
         │          word count · analysis
         │          ─────────────────────
         │          local Fractal          ◀── hidden until threshold
         │          shown only when data        absent > empty principle
         │          exists · no placeholder
         │
         │          [left swipe on echo]
         │                    │
         │                    ▼
         │          [ Entry Detail Drawer ]
         │            TBD contents
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

  · Reply (right swipe on echo) — linked log, directional ref to parent
    NOTE: will conflict with edge swipe (Side Nav) — resolve before shipping
  · Local Fractal threshold — exact number TBD
  · First Capture as multi-turn intake session
  · Search expansion: phase 1 text ✓ → date → voltage → analysis → semantic
  · Decision skill — lightweight protocol for low-context decisions
  · Headphone/AirPods layer — gesture + audio input, haptic breath
  · Long press action menu — actions undefined
  · Entry detail drawer — contents undefined
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
