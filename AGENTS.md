# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## What this is

Meverse: a mobile app treating the user as a meta-case study subject. Two parts:
a magical ledger (input capture) and an AI analysis layer (pattern recognition).
Goal: identify true drivers/desires and expose the pain behind daily experiences.

The repo is intentionally public. The documentation trail is the gold.

## Collaborator rules

- Precise and direct. Treat the user as a builder who understands the concepts.
- Before any code change: remind the user not to deploy without reading every line.
- **Always default to the simplest viable solution.** Plain HTML/CSS before React. SQL before an ORM. A file before a database.
- Session logs are the source of truth. Reference `sessions/INDEX.md` when continuity matters. Ask for session files if you cannot find them.
- One active chat at a time. When a session closes, it gets committed to the repo. The repo is the memory.

## Build & development commands

### React demo app (`meverse-demo/`)

```bash
# Dev server (localhost:3000)
npm start --prefix meverse-demo

# Run tests (interactive watch mode)
npm test --prefix meverse-demo

# Production build
npm run build --prefix meverse-demo
```

### Supabase Edge Functions (`supabase/functions/`)

Edge Functions are Deno/TypeScript. They run on Supabase infrastructure, not locally via Node.

```bash
# Deploy a single function
supabase functions deploy <function-name> --project-ref <ref>

# Deploy all functions
supabase functions deploy --project-ref <ref>

# Serve locally for development (requires Supabase CLI + Docker)
supabase functions serve
```

Required environment secrets (set in Supabase dashboard, never committed):
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENROUTER_API_KEY`, `SLACK_BOT_TOKEN`, `SLACK_CAPTURE_CHANNEL`

## Architecture

### Trinary state model

One integer, three altitudes of meaning:

```
Layer 0 — Metaphysical   0 = infinite potential  1 = polarity A   2 = polarity B
Layer 1 — Biological     0 = POKE                1 = LIFE         2 = UPSET
Layer 2 — UX/Mobile      0 = FLAT                1 = HI           2 = LO
```

The database stores the integer. The layer determines how it is read.
Voltage is inferred by AI classifier, never selected explicitly by the user.

### Three-act UX loop

```
ACT I  — Hook    First-time: Splash -> Register -> First Capture -> Voltage -> Home
ACT II — Ritual  Every use:  App re-entry -> 🪵 Home -> Input -> Send -> Classifier -> Wave/Wall
ACT III — Mirror Pattern:    🪵 Home -> Side Nav -> Insights (heatmap, fractal map)
```

Full spec: `architecture/ux-architecture-ascii_v0130.md`

### Design principles

- **Absent > Empty** — no data = remove from layout, not placeholder
- **Voltage is metadata, text is the asset** — classifier failure never loses an entry
- **Frictionless beats, 8/10 times** — when in doubt, remove the step
- **The system reads, the user witnesses** — voltage inferred and revealed, never selected

### Two capture paths (do not confuse)

1. **HTTP Shortcuts (Zone A):** User manually declares 0/1/2 → Supabase REST direct. No classifier. Live on Android.
2. **Meverse app (Stage 5+):** User types text → `capture-echo` infers voltage via AI → wave/wall UX.

### Edge Functions

| Function | Purpose |
|---|---|
| `capture-echo` | Production ingestion: text → classify voltage + embed → store → return result |
| `ingest-thought` | Slack capture: message → embed + extract metadata → store → reply in thread |
| `backfill-classify` | On-demand: classify all rows with null `trinary_state` |
| `backfill-embeddings` | On-demand: embed all rows with null `embedding` |
| `open-brain-mcp` | MCP server for thought retrieval |

**Failure contract (ADR-004):** Classifier failure → store with `voltage: null`. Embedding failure → store with `embedding: null` (backfill later). DB failure → 500. An echo is NEVER silently lost.

### Observation stack

```
Layer 0-3 — Action/Evaluation/Optimization/Routing (Workers, Evaluator, Optimizer, Orchestrator)
Layer 4   — Kernel Witness (KW): watches the pipeline, writes to open-issues.md
Layer 5   — Witness Prime (WP): watches KW for drift, writes to kw-meta-audit.md
Layer 6   — Human (final witness)
```

KW and WP run as local scheduled tasks (Claude Code scheduled-tasks MCP), not in this repo.
If missing: recreate via `create_scheduled_task` using `skills/062-kw-meta-SKILL.md` (WP source) and `sessions/session-37.md` (KW procedure).

### AI models (via OpenRouter)

- Classification: `openai/gpt-4o-mini` (temperature 0.3)
- Embeddings: `openai/text-embedding-3-small`
- Confidence threshold: 0.60 — below this, voltage stored as null

## Tech stack

- **Database:** Supabase (PostgreSQL + pgvector)
- **Edge Functions:** Deno (Supabase Edge Functions)
- **AI:** OpenRouter (gpt-4o-mini for classification/metadata, text-embedding-3-small for vectors)
- **Capture:** Android HTTP Shortcuts → Supabase direct; Slack → Edge Function
- **Mockups:** Plain HTML/CSS (v0.1–v0.21), React component for Act II (v0.21.0)
- **Demo app:** React 19 (Create React App) in `meverse-demo/`

## Commit convention

Format: `prefix: scope — short description`

| Prefix | Use |
|---|---|
| `sessions:` | session files + INDEX |
| `design:` | mockups, flows, screens, visions |
| `arch:` | ADRs + UX maps |
| `log:` | open-issues, daily logs |
| `chore:` | tooling, gitignore, cleanup |
| `feat:` | new working code |
| `fix:` | corrections |
| `refactor:` | code restructure only |
| `skills:` | skill files |

## Session protocol

Sessions follow a strict template (see `CLAUDE.md` for full template). Key points:
- All timestamps UTC/Zulu: `YYYY-MM-DD HH:MMZ`
- On open: run `date -u` to calibrate, read handoff from previous session
- On close: write session `.md`, update `sessions/INDEX.md`, commit both in one push (`sessions: SN sealed`)
- Parallel threads get `PARKED: [thought]` — not chased mid-session

## Key files

| File | Purpose |
|---|---|
| `sessions/INDEX.md` | Chronological session log — source of truth |
| `open-issues.md` | All known open issues, grouped by zone/act |
| `architecture/ADR-003-roadmap.md` | System roadmap, stage-based |
| `architecture/ux-architecture-ascii_v0130.md` | Full UX spec (three-act loop) |
| `architecture/ADR-001-kernel-witness.md` | KW architecture |
| `architecture/ADR-002-zone-a-input-gate.md` | Trinary input spec |
| `architecture/ADR-004-mobile-ux-vocabulary.md` | UX vocabulary (FLAT/HI/LO) |
| `design/mockups/meverse-act-ii_v0_21_0.jsx` | Act II React component (canonical) |
| `skills/062-kw-meta-SKILL.md` | Witness Prime v0.6.2 (active skill source) |
| `supabase/functions/capture-echo/index.ts` | Production capture pipeline |

## Current stage

**Stage 7 — Production Pipeline** (active work)

Stages 0–6 complete. UX designed, data model exists, skills installed.
Next: wire the production pipeline (Edge Function orchestration, OpenRouter trinary inference, Mac-side capture, reader deployment).

See `architecture/ADR-003-roadmap.md` for the full stage map.
