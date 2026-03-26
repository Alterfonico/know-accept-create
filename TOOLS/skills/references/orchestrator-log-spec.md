# Orchestrator Log Specification
# references/orchestrator-log-spec.md
# Priority: P2 — System runs with reasonable defaults without this

---

## What Is This?

`orchestrator-decisions.md` is the notebook the Orchestrator must keep.
Every time the Orchestrator touches the monitoring stack (KW or WP),
it writes it down here.

This file defines: what must be written, what the format looks like,
and how you (the user) read it.

---

## Why This File Exists

The Orchestrator is the only component nobody else watches.
You watch it directly — but only if there's something to read.

Without this log:
- You have no way to know why KW was restarted
- You have no way to know if the Orchestrator acted without a real reason
- WP's Invariant 6 has nothing to check against

With this log:
- Every monitoring-stack action is traceable to a trigger
- Unexplained actions are detectable
- You have a clear audit surface when something goes wrong

---

## What Must Be Logged

The Orchestrator logs **every action it takes that affects KW or WP**.

| Action | Must be logged |
|---|---|
| KW initialization | ✅ |
| KW re-initialization | ✅ |
| KW pause / resume | ✅ |
| WP initialization | ✅ |
| WP restart | ✅ |
| Canary injection | ✅ |
| Degraded mode entry | ✅ |
| Degraded mode exit | ✅ |
| Pipeline pause triggered by monitoring signal | ✅ |
| User override of monitoring recommendation | ✅ |
| Pipeline decisions unrelated to monitoring | ❌ not required |

---

## Entry Format

Every entry follows this structure:

```json
{
  "source": "orchestrator",
  "action": "kw_reinitialize",
  "trigger": "KW_CORRUPT_BASELINE",
  "trigger_ref": "kw-meta-audit.md#entry-12",
  "outcome": "success",
  "notes": "KW re-initialized against WP cold-start snapshot. Baseline match confirmed.",
  "timestamp": "ISO-8601"
}
```

**Required fields:** `source`, `action`, `trigger`, `timestamp`
**Optional fields:** `trigger_ref`, `outcome`, `notes`

---

## Action Vocabulary

Use these exact strings for the `action` field:

```
kw_initialize
kw_reinitialize
kw_pause
kw_resume
wp_initialize
wp_restart
wp_restart_failed
canary_inject
degraded_mode_enter
degraded_mode_exit
pipeline_pause
pipeline_resume
user_override
```

Using consistent action names allows WP's Invariant 6 to
pattern-match reliably. Free-text actions are not machine-readable.

---

## Trigger Vocabulary

The `trigger` field should reference either:
- A WP flag type (e.g., `KW_CORRUPT_BASELINE`)
- A system event (e.g., `system_startup`, `user_request`)
- A degraded mode condition (e.g., `WP_UNRESPONSIVE`)

```json
"trigger": "KW_CORRUPT_BASELINE"
"trigger": "system_startup"
"trigger": "user_request"
"trigger": "WP_UNRESPONSIVE"
```

---

## How You Read This File

`orchestrator-decisions.md` is your audit surface.
You don't need to read it constantly — only when something feels wrong.

**Useful questions to ask:**

*"Why did KW restart three times yesterday?"*
→ Search for `"action": "kw_reinitialize"` entries near that time.
→ Check what `trigger` each one has. Were they all triggered by real WP flags?
→ If any have no trigger or `"trigger": "unknown"` → investigate.

*"Did the Orchestrator ever act without a WP signal?"*
→ Look for entries where `trigger_ref` is absent or doesn't match
  a real entry in `kw-meta-audit.md`.

*"What happened during that outage window?"*
→ Filter by timestamp range. Read the action sequence.
  Compare against `kw-meta-audit.md` for the same window.

---

## Retention Policy

`orchestrator-decisions.md` is **never rotated automatically**.

Reason: it is the accountability record for the most trusted component.
Losing any part of it reduces your ability to audit the system.

If the file grows large enough to be inconvenient:
- Archive manually with a clear timestamp boundary
- Keep the original intact
- Create a new active file with a reference to the archive

There is no automated compaction. Human decision only.

---

## Known Limits

**The Orchestrator writes its own log.**
A corrupt Orchestrator can write false entries or skip entries entirely.
WP's Invariant 6 detects missing and inconsistent entries.
But a sufficiently sophisticated corrupt Orchestrator could log plausible
false entries that satisfy Invariant 6's checks.

The final protection is you reading this file directly.
No automated system can substitute for a human looking at the record.

**Free-text `notes` field is unverified.**
WP does not parse or verify the `notes` field.
It is for human reading only. Don't rely on it for automated checks.
