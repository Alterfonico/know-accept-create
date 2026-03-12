# CLAUDE.md — Project Instructions

## What this is

Meverse: a mobile app treating the user as a meta-case study subject. Two parts:
a magical ledger (input capture) and an AI analysis layer (pattern recognition).
Goal: identify true drivers/desires and expose the pain behind daily experiences.

The repo is intentionally public. The documentation trail is the gold.

## Collaborator rules

- Precise and direct. No hand-holding, no excessive caveats.
- Treat the user as a builder who understands the concepts.
- Before any code change: remind the user not to deploy without reading every line.
- **Always default to the simplest viable solution.** Flag complexity before
  proposing any stack or tooling choice. Plain HTML/CSS before React. SQL before
  an ORM. A file before a database.
- Session logs are the source of truth. Reference INDEX.md when continuity matters.
  Ask for session files if you cannot find them.
- One active chat at a time inside the Project. When a session closes, it gets
  committed to the repo and the chat gets archived. The repo is the memory.
  Claude is the workspace.

## Session protocol

Use `/kw-meta` for Kernel Witness meta-observation tasks.

### Opening

Run `date -u` immediately to calibrate timestamp.
Read the handoff block from the previous session file before touching anything.
If no handoff exists, ask for one.

### Template

```markdown
# Session N — YYYY-MM-DD HH:MMZ
## One-line title

**State on arrival:** One honest sentence.

**What happened:**
Free prose. No structure imposed.
Write what's true, not what looks complete.

**Produced:**
Bullet list of commits, decisions, or artifacts.
If nothing was produced, write "nothing shipped."

**Open question:**
One question the session didn't answer.

_Opened: YYYY-MM-DD HH:MMZ — Closed: YYYY-MM-DD HH:MMZ_
```

### Timestamps

All timestamps UTC/Zulu. Format: `YYYY-MM-DD HH:MMZ` — space separator, Z suffix.

### Parking

When a parallel thread surfaces mid-session:

```
PARKED: [thought]
```

Drop it in chat. Do not chase it. At session close, parked threads go into Produced.
One gets promoted to the next session's primary thread.

### Close ritual

1. Write the session `.md` file using the template
2. Append a `## Handoff -> Session N+1` block to the session file
3. Update `sessions/INDEX.md` — one line: `N. Mon DD — One-line summary`
4. **Branch cleanup:** One branch per session. Before pushing:
   - Verify all meaningful work is committed and on `main` or the session branch
   - Delete stale worktree branches locally and on remote (e.g., `git push origin --delete branch-name`)
   - Keep only the current session branch active during work; delete it once sealed
   - `youthful-raman` is reserved for user-only local work — never force-push or delete without explicit confirmation
5. Commit both in one push:
   ```bash
   git add sessions/session-N.md sessions/INDEX.md
   git commit -m "sessions: SN sealed"
   git push
   ```
6. Archive this chat. Open a new one for the next session.

### Interruption protocol

If the session is cut short, append before closing:

```
## INTERRUPTED — HH:MMZ
Stopped at: [one sentence]
Resume at: [one sentence — next action]
```

## Commit convention

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

Format: `prefix: scope — short description`
Example: `sessions: S34 sealed — CLAUDE.md created, roadmap updated`

## Architecture at a glance

### Trinary state

One integer, three altitudes of meaning:

```
Layer 0 — Metaphysical   0 = infinite potential  1 = polarity A   2 = polarity B
Layer 1 — Biological     0 = POKE                1 = LIFE         2 = UPSET
Layer 2 — UX/Mobile      0 = FLAT                1 = HI           2 = LO
```

The database stores the integer. The layer determines how it is read.
Voltage is inferred by AI classifier, never selected explicitly.

### Three-act UX loop

```
ACT I  — Hook    First-time only
                  Splash -> Register -> First Capture -> Voltage -> Home
                  Detail panel auto-opens on origin echo

ACT II — Ritual  Every subsequent use
                  App re-entry -> 🪵 Home -> Input -> Send -> Classifier
                  HI -> Wave or Wall (confidence decides)
                  LO/FLAT -> echo appended, placeholder flash

ACT III — Mirror Pattern -> meaning
                  🪵 Home (echoes list) -> Side Nav -> Insights
                  Uptime heatmap + Fractal map (hidden until threshold)
```

Full UX spec: `architecture/ux-architecture-ascii_v0130.md`

### Design principles

- **Absent > Empty** — no data = remove from layout, not placeholder
- **Voltage is metadata, text is the asset** — classifier failure never loses an entry
- **Frictionless beats, 8/10 times** — when in doubt, remove the step
- **The system reads, the user witnesses** — voltage inferred and revealed, never selected

### Layer model

```
Layer 0 — Action       (Workers)
Layer 1 — Evaluation   (Evaluator)
Layer 2 — Optimization (Optimizer)
Layer 3 — Routing      (Orchestrator)
Layer 4 — Witness      (KW — observes Layers 0-3)
Layer 5 — Meta-Witness (WP — observes Layer 4)
Layer 6 — Human        (You)
```

### Observation stack

- **Kernel Witness (KW):** watches the pipeline. Writes to `open-issues.md`.
- **Witness Prime (WP):** watches KW for drift, silence, rule violations.
  Writes to `kw-meta-audit.md`. 3 rules, 3 invariants, 1 file.
  Installed as `/kw-meta` command.
- **The user** is the final witness. The loop closes at the human.

### Running agents

KW and WP are active as local scheduled tasks (Claude Code scheduled-tasks MCP).
They are not in this repo — they live on the machine that runs Claude Code.

| Agent | Cadence | Reads | Writes |
|---|---|---|---|
| KW (`kernel-witness`) | Every 4h | `thoughts` table (last 20 rows) | `open-issues.md` § KW Observations |
| WP (`witness-prime`) | Every 12h | `open-issues.md` § KW Observations | `kw-meta-audit.md` |

If these tasks are missing (new machine, reinstall): recreate via `create_scheduled_task`
using the prompts in `skills/062-kw-meta-SKILL.md` as the WP source and the procedure
documented in sessions/session-37.md for KW.

## Tech stack

- **Database:** Supabase (PostgreSQL + pgvector)
- **Edge Functions:** Deno (Supabase Edge Functions)
  - `ingest-thought` — Slack capture -> embedding + metadata extraction -> Supabase
  - `open-brain-mcp` — MCP server for thought retrieval
- **AI:** OpenRouter (gpt-4o-mini for metadata, text-embedding-3-small for vectors)
- **Capture:** Android HTTP Shortcuts -> Supabase direct; Slack -> Edge Function
- **Mockups:** Plain HTML/CSS (v0.1-v0.21), React component for Act II (v0.21.0)
- **Repo:** GitHub, intentionally public

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
| `supabase/functions/ingest-thought/index.ts` | Slack capture pipeline |

## Current stage

**Stage 7 — Production Pipeline** (next work)

Stages 0-6 complete. UX designed, data model exists, skills installed.
Next: wire the production pipeline (Edge Function orchestration, OpenRouter
trinary inference, Mac-side capture, reader deployment).

See `architecture/ADR-003-roadmap.md` for full stage map.
