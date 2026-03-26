# Session Documenter (SD) — Skill v0.1.0

Documents Claude Code chat sessions for the Meverse meta-case-study.
Mirrors KW/WP architecture: Layer 4 (SD) writes, Layer 5 (SM) meta-witnesses.

---

## Architecture

```
Chat Session
|
append every 20min
v
/tmp/meverse-session-{N}.log  (local file, LLM-agnostic)
|
process at session end
v
Session Documenter (SD) ──> sessions/session-{N}.md (per CLAUDE.md)
|
observed by
v
Session Meta (SM) ──> chat-sessions/meta-audit.md
```

---

## Commands

### `/checkpoint`

Append current conversation context to local log file.

**Usage:** Run every 20 minutes during session.

**Behavior:**
- Creates `/tmp/meverse-session-{N}.log` if not exists
- Appends timestamp + full conversation since last checkpoint
- Zero API calls, zero tokens
- Survives crashes (disk persistence)

**Log format:**
```
=== CHECKPOINT YYYY-MM-DD HH:MMZ ===
[User]: message content
[Claude]: response content
...
=== END CHECKPOINT ===
```

### `/document-session`

Process complete log into structured session file.

**Usage:** Run at session end, before closing chat.

**Behavior:**
1. Reads `/tmp/meverse-session-{N}.log`
2. Calls OpenRouter (gpt-4o-mini) to extract:
   - One-line title
   - State on arrival
   - What happened (summary)
   - Produced (artifacts, commits, decisions)
   - Open question
3. Writes `sessions/session-{N}.md` with full template
4. Archives log to `chat-sessions/raw/session-{N}.log`
5. Deletes `/tmp` file

**Output format:** Standard session template per CLAUDE.md

---

## File Locations

| File | Purpose |
|------|---------|
| `/tmp/meverse-session-{N}.log` | Active checkpoint buffer (session runtime) |
| `sessions/session-{N}.md` | Final documented session (committed to repo, per CLAUDE.md) |
| `chat-sessions/raw/session-{N}.log` | Archive of raw checkpoint data |
| `chat-sessions/meta-audit.md` | SM observations (drift, silence, violations) |
| `chat-sessions/INDEX.md` | Chronological index |

---

## Session Meta (SM) — Layer 5

Watches SD output for three invariants:

1. **Drift** — SD output format changed without declaration
2. **Silence** — Session closed but no session-N.md produced within 1h
3. **Violation** — SD wrote to wrong file, modified raw archive, etc.

**Trigger:** Every 12 hours (Claude Code scheduled task)
**Output:** `chat-sessions/meta-audit.md`

---

## Integration with Meverse

Session documentation feeds the meta-case-study:
- Patterns across sessions → insights
- Voltage swings in session content → Operator/Ghost observations
- Decision velocity → system health metric

Future: SD could auto-tag sessions for `thoughts` table correlation.

---

## Changelog

| Version | Change |
|---------|--------|
| 0.1.0 | Initial — checkpoint + document-session commands, SM architecture |
