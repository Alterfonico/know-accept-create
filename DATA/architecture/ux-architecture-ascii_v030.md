# MEVERSE — UX ARCHITECTURE
# THREE-ACT LOOP · as of v0.6.0 · 2026-03-09

```
╔══════════════════════════════════════════════════════════════════╗
║  ACT I — HOOK                                                    ║
║  Acquisition + first signal                                      ║
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
      ▼  AI classifier runs on save
      │  { voltage: "FLAT"|"HI"|"LO", confidence: float }
      │  confidence below threshold → voltage: null
      │  null entries excluded from pattern views · not misclassified
      │
      ├── [LO / FLAT] ──────────────────────────────────────────────┐
      │                                                              │
      └── [HI] ────────────────────────────────────────────┐        │
                                                            │        │
                                                            ▼        │
                                                 [ Voltage Bubble ]  │
                                                 modal expands       │
                                                 half → full screen  │
                                                 ambient hold 1.5s   │
                                                            │        │
                                         ┌──────────────────┤        │
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
                                   │            │    ~35% viewport    │
                                  [Y]          [N]   1-2 lines       │
                                   │            │    auto-dismiss 7s  │
                                   ▼            │    tap to dismiss   │
                          [ Analysis            │    early            │
                            WAVE ]              │         │           │
                          full-bleed            └────┬────┘           │
                          ~70% viewport              │                │
                          2-3 observations           │                │
                          staggered fade             ▼                │
                          question at bottom  ┌──────────────────┐   │
                               │              │  lo-path modal   │◀──┘
                               │              │  wall-style      │
                               │              │  ──────────────  │
                               │              │  saved.          │
                               │              │  that took       │
                               │              │  something.      │
                               │              │  ──────────────  │
                               │              │  seed question   │
                               │              │  ai-generated    │
                               │              └────────┬─────────┘
                               │                       │
                               └───────────────────────┤
                                                       │
                                                       ▼
                                                  [ HOME ] ◀─────────────────┐
                                                       │                      │
                                                       │                      │
  NOTE: lo-path is the unified exit for every          │    ACT II feeds      │
  non-HI-yes path. HI → Wave → Yes is the only         └────back every────────┘
  route that goes directly home.                            capture


╔══════════════════════════════════════════════════════════════════╗
║  ACT II — RITUAL                                                 ║
║  Daily capture loop · re-enters from Home every time            ║
╚══════════════════════════════════════════════════════════════════╝

  [ Home / Any Screen ]
      │
      │  home:          full-width input bar · always present
      │  other screens: pill ~60% width · thumb-sized · centered
      │
      ▼
  [ tap input ]
      │
      ├── home  → keyboard opens inline · input bar widens
      │           user perceives: sending a chat message
      │           no save/cancel · CTAs are:
      │           [ save for now ]     [ send ]
      │
      └── other → pill expands to capture sheet · slides up from bottom
                  [ save for now ]     [ send ]
      │
      ▼
  [ send ]
      │
      ▼  [async] AI classifier → { voltage, confidence }
      │  confidence below threshold → voltage: null
      │  null entries stored · excluded from pattern views
      │
      └──▶ [ HOME ] · echo appears at top of list ──────────────▶ loop

  [ save for now ]
      │
      └──▶ "got it, be back when you're ready" · dissolves
           stays on current screen · no breath · no classifier


╔══════════════════════════════════════════════════════════════════╗
║  ACT III — MIRROR                                                ║
║  Pattern → meaning                                               ║
╚══════════════════════════════════════════════════════════════════╝

  ┌──────────────────────────────────────────────────────────────┐
  │  HOME — Log List (Echoes)                                    │
  │                                                              │
  │  ≡  echoes                                      [full input] │
  │  ─────────────────────────────────────────────────────────  │
  │  ┌─────────────────────────────────────────────────────┐    │
  │  │▓ something is shifting and I can't quite name it    │    │
  │  │  today · 09:14  HI · 1 · LIFE                   ↕  │    │
  │  └─────────────────────────────────────────────────────┘    │
  │  ┌─────────────────────────────────────────────────────┐    │
  │  │▓ I keep cancelling things I actually want to do     │    │
  │  │  yesterday · 22:03  LO · 2 · UPSET              ↕  │    │
  │  └─────────────────────────────────────────────────────┘    │
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
         │          local Fractal          ◀── same renderer as global
         │          this echo as center        zoom = parameter
         │          N degrees out              not a separate feature
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
  │  ◎ echoes  │
  │  ◈ insights│
  │  ──────────│
  │  ◇ profile │
  │    settings│
  └──────┬──────┘
         │
    [ insights ]
         │
         ▼
  ┌──────────────────────────────────────────────────────────────┐
  │  INSIGHTS                                    [pill input]    │
  │                                                              │
  │  ← insights                                                  │
  │  [ uptime ]              [ fractal ]                         │
  │  ─────────────────────────────────────────────────────────  │
  │                                                              │
  │  UPTIME tab:                  FRACTAL tab (global):          │
  │  heatmap grid                 all echoes as hub              │
  │  day = square                 ring 1 = recent entries        │
  │  color = voltage              ring 2 = older, faded          │
  │  3-month view                 same renderer as local fractal │
  │  tap = tooltip                zoom out = global view         │
  │                                                              │
  │  ■ green  1 · LIFE · HI                                     │
  │  ■ red    2 · UPSET · LO                                    │
  │  ■ orange 0 · POKE · FLAT                                   │
  │  □ grey   no entry                                           │
  │                                                              │
  └──────────────────────────────────────────────────────────────┘

  FRACTAL — ONE RENDERER · TWO ENTRY POINTS
  ┌──────────────────────────────────────────┐
  │  local  · from echo drawer               │
  │           this echo = center             │
  │           N degrees of connection out    │
  │           hidden until min. threshold    │
  │                                          │
  │  global · from Side Nav → Insights       │
  │           all echoes · full network      │
  │           zoom level = parameter only    │
  └──────────────────────────────────────────┘


╔══════════════════════════════════════════════════════════════════╗
║  PARKED                                                          ║
╚══════════════════════════════════════════════════════════════════╝

  · Reply (right swipe on echo) — linked log, directional ref to parent
  · Local Fractal hidden until minimum entry threshold [TBD]
  · First Capture as multi-turn intake session
  · Search expansion: phase 1 text ✓ → date → voltage → analysis → semantic
  · Decision skill — lightweight protocol for low-context decisions
  · Headphone/AirPods layer — gesture + audio input, haptic breath
  · Long press action menu — actions undefined
  · Entry detail drawer — contents undefined
  · Fragmented logging prevention — cool-down timer, min char count, side notification, or other. Solve separately from core UX.


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
