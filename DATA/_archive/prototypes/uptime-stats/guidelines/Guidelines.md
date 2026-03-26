# Meverse UI Guidelines

**Date:** 2026-03-06
**Status:** First draft — not validated by users yet
**Based on:** Pixel Arrt

## Global Aesthetic: 8-Bit / Retro Dark Mode

- **Palette**:
  - Background: #1A1A1A
  - Gold Border: #FFD700
  - Purple Accent: #9D50BB
  - Green / Operational: #4CAF50
  - Red / Outage: #F44336
  - Orange / Degraded: #FF9800
  - Muted text: #888
  - Deep background: #0D0D0D

- **Geometry**: No border-radius. Everything must be square/rectangular.

- **Typography**: Use 'Press Start 2P' (Google Fonts) or equivalent monospace pixel font.
  - Title: 10–13px, gold, letter-spacing 0.08em
  - Labels: 5–7px, muted or accent color
  - Values: 9px, color-coded by status

- **Effects**:
  - Scanline overlay on all screens
  - Glitch shadow on primary titles (purple offset left, red offset right)
  - Gold glow on key elements: `text-shadow: 0 0 20px #FFD70099`
  - Live indicator: pulsing green dot

---

## Screen: Uptime Statistics

- **Header**: "UPTIME VISUALIZATION" in gold 8-bit glitch text
- **Top bar**: MEVERSE label (purple), LIVE indicator (green pulse), version tag (muted)
- **Status tiles**: Four metric badges — UPTIME, INCIDENTS, WARNINGS, SLA
  - Each bordered and tinted by its status color
- **Section label**: "QUARTERLY HEATMAP" in purple, Q1 label right-aligned
- **Core component**: Heatmap Grid
  - 3 columns (months), each containing a 5×7 grid of pixel squares
  - Colors: #4CAF50 (Operational), #F44336 (Outage), #FF9800 (Degraded)
  - Day-level tooltip on tap — shows: Month, Day, Status, Uptime %
- **System Status Breakdown**: expandable rows, progress bars, NOMINAL/DEGRADED badges
- **Navigation**: Bottom bar — Heatmap (active), Network, Hierarchy
  - Square icons only, no border-radius

---

## Screen: Incident Log Modal

- Triggered by tapping any day in the heatmap
- Shows: Month + Day header, Status badge, timestamped incident log
- Log format: `> [HH:MM] EVENT DESCRIPTION`
- Single action: ACKNOWLEDGE button (gold, full width)
- Background: blurred parent screen

---

## Component Rules

- Only use absolute positioning when necessary
- Default to flexbox and grid for layout
- Keep file sizes small — helpers and components in their own files
- Refactor as you go
- Bottom nav maximum 4 items
- No floating action button with bottom nav
- No border-radius anywhere in the design system
