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
      │
      ▼  AI classifier runs on save
      │  { voltage: "FLAT"|"HI"|"LO", confidence: float }
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
                                   ▼            │         │           │
                          [ Analysis            │         │           │
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
                                                  [ HOME ]

  NOTE: lo-path is the unified exit for every non-HI-yes path.
        HI → Wave → Yes is the only route that skips it entirely.


╔══════════════════════════════════════════════════════════════════╗
║  ACT II — RITUAL                                                 ║
║  Daily capture loop                                              ║
╚══════════════════════════════════════════════════════════════════╝

  [ Lock Screen / Any Screen ]
      │
      │  home: full-width input bar · always present
      │  other screens: pill ~60% width · thumb-sized · centered
      │
      ▼
  [ tap input ]
      │
      ├── home → expands inline · textarea + save/cancel appear
      └── other → pill expands to capture sheet · slides up from bottom
      │
      ▼
  [ type entry ]
      │
      ├── [ cancel ] ── "got it, be back when you're ready"
      │        │
      │        └──▶ dissolves · stays on current screen
      │
      └── [ save ]
               │
               ▼
      [ Breath Overlay ]  ◀── z-index 200 · full screen
      inhale · exhale 3s       dissolves in place · no navigation
               │
               ▼  [async] AI classifier → { voltage, confidence }
      [ back to current screen ]
      null entries excluded from pattern views


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
  │  [tap echo] ──▶ expands 30% → 60%                           │
  │                 drawer reveals:                              │
  │                 voltage · confidence · word count            │
  │                 analysis text                                │
  │                 local fractal                                │
  │                                                              │
  └──────────────────────────────────────────────────────────────┘
         │                    │                    │
  [≡ swipe right]   [left swipe on echo]   [long press on echo]
         │                    │                    │
         ▼                    ▼                    ▼
  ┌─────────────┐   [ Entry Detail       [ Action Menu Modal ]
  │  SIDE NAV   │     Drawer ]             max 3 actions
  │             │     TBD contents         TBD
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
  │  ─────────────────────────────────────────────────────────  │
  │  [ uptime ]              [ fractal ]                         │
  │  ─────────────────────────────────────────────────────────  │
  │                                                              │
  │  UPTIME tab:                  FRACTAL tab:                   │
  │  heatmap grid                 node network                   │
  │  day = square                 hub = all echoes               │
  │  color = voltage              ring 1 = recent entries        │
  │  3-month view                 ring 2 = older, faded          │
  │  tap = tooltip                zoom = local ↔ global          │
  │                                                              │
  │  ■ green  1 · LIFE · HI                                     │
  │  ■ red    2 · UPSET · LO                                    │
  │  ■ orange 0 · POKE · FLAT                                   │
  │  □ grey   no entry                                           │
  │                                                              │
  └──────────────────────────────────────────────────────────────┘


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
  · App re-entry empty state — Log List with zero echoes


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
