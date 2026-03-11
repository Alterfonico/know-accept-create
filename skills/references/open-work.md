# Open Work Index
# references/open-work.md
# This file tracks everything unresolved. Update it as work completes.

---

## Status Key

✅ Done — built and integrated
🔴 P0 — must exist before first deployment
🟡 P1 — must exist before production use
🟢 P2 — build when defaults prove insufficient
💬 Discussion — design decision not yet made

---

## Reference Files

| File | Priority | Status | What it covers |
|---|---|---|---|
| `references/signal-types.md` | — | ✅ Done | Full catalog of all flag types |
| `references/bootstrap-spec.md` | P0 | ✅ Done | Cold-start snapshot methodology |
| `references/degraded-modes.md` | P0 | ✅ Done | Decision trees for every broken state |
| `references/enforcement.md` | P0 | ✅ Done | Tool-scoping and file boundary enforcement |
| `references/canary-protocol.md` | P0 | ✅ Done | False negative detection via canary injection |
| `references/escalation-matrix.md` | P1 | ✅ Done | Who gets notified, how fast, what happens next |
| `references/signal-quality.md` | P1 | ✅ Done | When to stop trusting KW's flags |
| `references/outcome-resolution.md` | P1 | ✅ Done | How WP learns if a flag was right or wrong |
| `references/drift-detection.md` | P1 | ✅ Done | Catching slow and sudden KW drift |
| `references/calibration-spec.md` | P2 | ✅ Done | How confidence values improve over time |
| `references/audit-rotation.md` | P2 | ✅ Done | Log rotation and hash chain |
| `references/schema-evolution.md` | P2 | ✅ Done | Signal format versioning |
| `references/orchestrator-log-spec.md` | P2 | ✅ Done | What the Orchestrator must write and how to read it |

---

## Known Architectural Limitations (Accepted, Not Resolved)

These are not bugs. They are documented tradeoffs.

| # | Limitation | Why accepted |
|---|---|---|
| 1 | WP has no witness | The chain must stop. WP is narrow, deterministic, and transparent to the user. |
| 2 | Orchestrator watched by user, not agent | Adding an agent creates infinite regress. User + orchestrator-decisions.md is the right tradeoff. |
| 3 | WP bootstrap is unwitnessed | WP starts from a deterministic spec. User is WP's bootstrap witness. |
| 4 | Correlated failure possible | KW and WP may share substrate. Independence criteria reduce but cannot eliminate this. |
| 5 | Canary can't cover novel failure modes | Only 4 canary types. Unknown blind spots remain unknown by definition. |
| 6 | Append-only is logical, not physical | True write-once storage requires platform-level infrastructure outside this skill. |
| 7 | Corrupt Orchestrator can write false log entries | Mitigated by Invariant 6 + user direct audit. Not eliminable without a second Orchestrator (infinite regress). |

---

## Open Design Questions

| # | Question | Status |
|---|---|---|
| 1 | Should canary frequency increase automatically when FNR is high? | 💬 Open |
| 2 | Should WP ever surface a confidence interval instead of a point estimate? | 💬 Open |
| 3 | Should `orchestrator-decisions.md` have a hash chain like `kw-meta-audit.md`? | 💬 Open |

---

## Skill Version

Current: **v0.5.0**
All reference files written against this version.
When the main SKILL.md bumps to v0.6.0, update `schema_version` here.
