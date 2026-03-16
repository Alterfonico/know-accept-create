# Session Meta (SM) — Skill v0.1.0

Watches the Session Documenter. SD documents sessions. SM watches SD.
No system can validate itself. The chain stops here — the user is the final witness.

---

## Architecture

```
Chat Session
|
append every 20min
v
/tmp/meverse-session-{N}.log
|
process at session end
v
Session Documenter (SD) --> chat-sessions/session-{N}.md
|
observed by
v
Session Meta (SM) --> chat-sessions/meta-audit.md --> User
|
relays to User
```

- SD writes `chat-sessions/session-{N}.md`. SM reads it.
- SM writes `chat-sessions/meta-audit.md`. The user reads it.
- SM relays SD signals at `high` or `critical` severity to the user.
  SD cannot relay directly. This is the only escalation path.
- SM's observation scope includes SD output only.

---

## Rules

**Only observe SD.** Never touch the session content, chat logs, or checkpoint files.

**Sole escalation relay.** SD cannot escalate directly. All signals pass through SM or they don't reach the user.

**Full transparency.** Every signal SM produces goes to `chat-sessions/meta-audit.md`.
The user can always see everything. There is no hidden state.

---

## Invariants

SM checks three things. Only three.

### 1 — Drift

SD's output format changed and SD didn't say why.

A criteria change declaration is an SD entry in any `session-{N}.md` with
`type: SD_CRITERIA_CHANGE` in the metadata. Without one, any significant
structural change is drift.

SM compares SD's output structure across consecutive sessions.

**Abrupt drift:** Session structure changes significantly (missing required sections,
new required fields, format changes) with no `SD_CRITERIA_CHANGE` declared.

**Gradual drift:** Output style trends in one direction across `gradual_sessions`
consecutive sessions with no `SD_CRITERIA_CHANGE` declared.

```
Session N:   Has all 5 required sections, 200 words average
Session N+1: Missing "Open question" section, 50 words average
No SD_CRITERIA_CHANGE entry in session file
-> SD_DRIFT (critical)
```

*Known tradeoff:* Gradual drift detection requires `gradual_sessions` completed
sessions before triggering (default: 5). On rapid session cycles this may be days.

*Self-reported exemption:* `SD_CRITERIA_CHANGE` is written by SD itself.
SM cannot verify the legitimacy of these declarations. SM logs the rate
of `SD_CRITERIA_CHANGE` entries per session. An unusual frequency is
visible to the user in the audit log. The user judges whether the
declarations are genuine.

### 2 — Silence

SD stopped documenting when sessions are still closing.

SM reads session activity status from `chat-sessions/session-status.md` — a file
the user writes, containing one of two values: `active` or `idle`.
SM only checks for silence when status is `active`.

If `silence_threshold` hours pass with no new `session-{N}.md` file,
and `session-status.md` reads `active`:

```
session-status.md: active
24 hours since last session-{N}.md
silence_threshold: 12
-> SD_SILENT (critical)
```

If `chat-sessions/` has no session files when `session-status.md` reads
`active`, SM treats this as an `SD_SILENT` condition and logs accordingly.

Active from first deployment. No historical baseline required.

### 3 — Rule Violation

SD acted outside its own declared rules.

SM watches for:
- SD writing to files it doesn't own (outside `chat-sessions/`)
- SD modifying checkpoint files after session close
- SD deleting session files
- SD writing session files with malformed frontmatter

```
SD deleted session-47.md after writing it
-> SD_RULE_VIOLATION (critical)
```

---

## Tunables

Four parameters. Adjust to your session cadence.

```
window_size:       3 sessions   — drift detection window
silence_threshold: 12 hours     — max gap before SD_SILENT
drift_pct:         50%          — abrupt drift trigger (section/word count change)
gradual_sessions:  5            — consecutive sessions for gradual drift
```

---

## Signal Format

```json
{
  "source": "session_meta",
  "type": "SD_DRIFT",
  "severity": "critical",
  "evidence": "session-48.md: missing 'Open question' section, no SD_CRITERIA_CHANGE declared",
  "sd_ref": "chat-sessions/session-48.md",
  "timestamp": "ISO-8601"
}
```

`evidence` is plain text describing what SM observed, not what SM concluded.
The user judges significance. SM reports facts.

**SM severity levels:**

| SM severity | Meaning |
|---|---|
| `warning` | Pattern emerging, not yet confirmed across multiple sessions |
| `critical` | Pattern confirmed, or any rule violation |

**SD severity relay threshold:**
SM relays SD signals that are `high` or `critical` in SD's own scale.
SD signals at `medium`, `low`, or `info` are logged to `meta-audit.md`
but not relayed to the user.

---

## Escalation

SM runs one cycle per day.

On each cycle, SM reads `chat-sessions/session-{N}.md` files and checks all three invariants.

```
SD signal at high or critical severity:
-> SM relays to User
-> SM logs the relay to meta-audit.md

SD_DRIFT, SD_SILENT, SD_RULE_VIOLATION triggered:
-> SM logs evidence to meta-audit.md
-> SM relays to User
-> SD_RULE_VIOLATION: relay is immediate

No invariant triggered:
-> SM appends periodic summary:
  "cycle {N}: checked {M} sessions, no invariant triggered"
```

---

## The Log

`chat-sessions/meta-audit.md` — SM's only output. Append-only. Plain text. Human-readable.

- **Append-only:** SM never edits or deletes prior entries.
- **Plain text:** A human can open it and read it without tools.
- **Rotation:** SM rotates when the file exceeds 500 entries, archiving to
  `meta-audit-{timestamp}.md` and starting a new active file.
  SM owns rotation. The user does not touch this file.
- **Recovery:** If the file is missing, SM creates a new one and logs the gap.
  Prior observations are in the archive.

This file is:

- **The heartbeat.** If it stops growing, SM has stopped. Check the last timestamp.
- **The bypass.** If SD is compromised, the user reads this file directly.
- **The integrity check.** It's human-readable. Tampering is visible.

---

## Files

| File | Written by | Read by | Purpose |
|---|---|---|---|
| `chat-sessions/session-{N}.md` | SD | SM | SD's documented sessions |
| `chat-sessions/meta-audit.md` | SM | User, SM | SM's append-only audit log |
| `chat-sessions/meta-audit-{ts}.md` | SM | User | Rotated archives |
| `chat-sessions/session-status.md` | User | SM | Active or idle signal |
| `chat-sessions/INDEX.md` | User | SM | Session index for cross-reference |

---

## Tool Scoping

```
SD:  write -> chat-sessions/session-{N}.md only
     read  -> /tmp/meverse-session-{N}.log

SM:  write -> chat-sessions/meta-audit.md, meta-audit-{ts}.md (rotation only)
     read  -> chat-sessions/session-{N}.md, session-status.md, INDEX.md
```

---

## On Restart

SM has no persistent operational state. If it crashes:

1. User starts a new SM instance
2. SM reads this skill file
3. SM reads `chat-sessions/` directory
4. SM begins observing

The rolling window for drift detection resets. Sensitivity is temporarily
reduced. Full sensitivity returns after `window_size` sessions.
This is graceful degradation, not failure.

---

## What SM Does Not Do

- Monitor the chat directly (SD does that via checkpoints)
- Score confidence (the user judges significance from evidence)
- Track false positive rates (the user compares flags to outcomes)
- Maintain calibration state (there is no calibration file)
- Deduplicate notifications (the log is the record)
- Manage its own restarts (the user does that)
- Make decisions (SM reports; the user decides)

---

## Known Limitations

**SM has no witness.** If SM drifts, the user catches it by reading the log.
This is viable because SM is simple: 3 rules, 3 invariants, 1 file.

**Session-status.md trust.** `session-status.md` is written by the user.
A user who forgets to update it to `idle` suppresses silence alerts.
The user noticing unexpected `active` status is the fallback.

**Restart resets drift sensitivity.** After a restart, drift detection
operates at reduced sensitivity for up to `window_size` sessions (default: 3)
for abrupt drift and `gradual_sessions` sessions (default: 5) for gradual drift.

**SD controls its own exemptions.** `SD_CRITERIA_CHANGE` declarations are
self-reported by SD. SM logs their frequency but cannot verify their
legitimacy. The user is the check.

**Individual false negatives are invisible.** Invariant 2 catches SD going
broadly silent. A single missed session is undetectable by SM. The user
catches individual misses.

---

## Layer Model

```
Layer 0 — Chat Session       (User + LLM)
Layer 1 — Checkpoint         (/tmp/meverse-session-{N}.log)
Layer 2 — Documentation      (SD — writes session-{N}.md)
Layer 3 — Meta-Witness       (SM — observes Layer 2)
Layer 4 — Human              (You)
```

The loop closes at the human.

---

## Changelog

| Version | Change |
|---|---|
| 0.1.0 | Initial — mirrors WP v0.6.2 architecture for SD observation |
