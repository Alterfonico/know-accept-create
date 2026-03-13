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

### Branch deletion invariant

**User commitment:** Never delete a branch manually without asking Claude to read it first.
**Claude responsibility:** When asked to delete a branch, always read the branch diff and confirm no uncommitted session files, notes, or artifacts are present before proceeding. Block deletion if anything looks unsaved.
**Exception:** Only if Claude is unresponsive. Even then, run `git diff main..branch --stat` before deleting.

This rule exists because a session file was lost when a branch was deleted before the content was committed (S38 / crazy-cerf incident).

### Main branch protection

**The principle:** Main is delicate. It holds the session record only (immutable, safe).

**What can push to main:** Only `sessions/*.md` files (session records and INDEX).
- `sessions/session-N.md` — sealed session record
- `sessions/INDEX.md` — chronological index

**What cannot push to main:** Everything else.
- Design work (`design/mockups/*.html`, `.jsx`)
- Code changes (`supabase/functions/*`, `architecture/*`)
- Configuration (`package.json`, `.env`, etc.)

**How it's enforced:**
- `.git/hooks/pre-push` blocks any non-session files from pushing to main
- Design/code work stays on session branches (e.g., `claude/funny-roentgen`)
- Merging code → main requires:
  1. Open a PR from session branch → main
  2. User reviews the diff
  3. User approves and merges via GitHub
- Session files bypass this (they're immutable records, safe to auto-commit)

**Example workflow:**
```bash
# Design work: push to session branch
git push origin claude/funny-roentgen

# Session sealed: push session file to main (succeeds)
git add sessions/session-N.md sessions/INDEX.md
git commit -m "sessions: SN sealed"
git push origin main  # ✅ Only *.md files, hook allows it

# Later, merge design: open PR, user approves
# DO NOT: git push origin claude/funny-roentgen:main  # ❌ Hook blocks it
```

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

One integer, three altitudes of meaning (recalibrated S40):

```
Layer 0 — Metaphysical   0 = infinite potential  1 = polarity A   2 = polarity B
Layer 1 — Semantic       0 = TASK                1 = IMPORTANT    2 = IMPORTANT
Layer 2 — UX/Mobile      0 = FLAT                1 = HI           2 = LO
```

**Semantics:**
- **TASK (0)** — routine, actionable, neutral. User can mark via "0 " prefix.
- **IMPORTANT (1 & 2)** — IMPORTANT·positive (HI/LIFE, green) or IMPORTANT·negative (LO/UPSET, red).
- **Precedence:** If AI classifier reads as IMPORTANT (HI/LO), it overrides user's TASK marking.

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

KW and WP are cloud-native Edge Functions deployed to Supabase. Triggered by cloud cron service.
Not tied to local machine state. Always running (S41).

| Agent | Cadence | Reads | Writes |
|---|---|---|---|
| KW (`kw-observer`) | Every 4h | `thoughts` table (last 20 rows) | `kw_observations` table |
| WP (`wp-observer`) | Every 12h | `kw_observations` table | `wp_audit` table |

**Data flow:**
```
Pipeline (thoughts table)
  ↓
kw-observer (Edge Function) — scans for friction patterns
  ↓
kw_observations (Supabase table) — KW friction reports
  ↓
wp-observer (Edge Function) — checks 3 invariants (drift, silence, rule violation)
  ↓
wp_audit (Supabase table) — WP meta-observations
  ↓
[Human reads Supabase tables OR export to git files for audit trail]
```

**Cron setup:**
Use EasyCron (free) or similar to trigger:
- `POST https://nlfryozynimffhwkhhls.supabase.co/functions/v1/kw-observer` every 4h
- `POST https://nlfryozynimffhwkhhls.supabase.co/functions/v1/wp-observer` every 12h
- Include Bearer token: anon key from `kw-supabase-config.json`

**Sync to git (optional):**
For audit trail, export observations to git periodically:
- Query `kw_observations` and `wp_audit` tables
- Append to `open-issues.md` and `kw-meta-audit.md`
- Commit to main (manual or via GitHub Actions schedule)

## Tech stack

- **Database:** Supabase (PostgreSQL + pgvector)
- **Edge Functions:** Deno (Supabase Edge Functions)
  - `ingest-thought` — Slack capture -> embedding + metadata extraction -> Supabase
  - `open-brain-mcp` — MCP server for thought retrieval
  - `capture-echo` — App capture -> classifier inference + metadata extraction -> voltage + storage
  - `kw-observer` — Pipeline scanner, friction detection -> kw_observations table
  - `wp-observer` — KW meta-observer, invariant checks -> wp_audit table
- **AI:** OpenRouter (gpt-4o-mini for metadata/classifier, text-embedding-3-small for vectors)
- **Capture:** Android HTTP Shortcuts -> Supabase direct; Slack -> Edge Function; App -> capture-echo
- **Observation:** Cloud cron -> Edge Functions (KW/WP, always running, independent of local state)
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
