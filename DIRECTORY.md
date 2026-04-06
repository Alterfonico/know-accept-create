# ── DIRECTORY.md ──────────────────────────────────────────────
# Live address book. Companion to CLAUDE.md.
# CLAUDE.md    = what the system IS   (architecture, invariants)
# DIRECTORY.md = where things ARE     (paths, roles, status)
#
# Rules:
#   One entry per address. No prose. No architecture.
#   Updated at every U (SHIP) stage by conductor.
#   Cold-boot: find anything in <60 seconds.
#   Address changes → this file changes same session.
#
# Two environments. Two structures. One system.
#   Notion   → RECORD (LOGS) / REUSE (LAB) — decisions and reusables
#   Proto-Lab → /workspace map — execution environment
#   These are parallel. Do not conflate them.
#
# version: 0.3 | born: S99 | updated: S101 · 2026-04-05
# ─────────────────────────────────────────────────────────────

# ── NOTION ────────────────────────────────────────────────────

notion:
  index:
    id: 2ef9e35687288000ba87ff09f3a74c7d
    role: master map — boot here every session
  sessions:
    id: c4e95f12-f579-4051-a0c8-eb411cbb4102
    role: SESSIONS database — one page per session
    template: 32a9e356-8728-8006-aec7-d0b3e75d51a8
  lab:
    id: 2ef9e35687288055981dd1926aeabf89
    role: REUSE — skills, cards, tools that outlive the session
  logs:
    id: 2ef9e356872880f9a36ce529a3acddd3
    role: RECORD — sealed session pages, entries, time-stamped records
  entries:
    id: 9c4392a5-4d5b-4487-8110-bc13c7467213
    role: ENTRIES database — research, tests, standalone artifacts
  drift_log:
    id: 32f9e356872881ffb3bad421dcd17625
    role: system integrity log — write at every seal
  master_protocol:
    id: 2ef9e35687288020bc40f565f960b408
    role: ARCHIVED — do not boot from here

# ── PROTO-LAB /workspace ──────────────────────────────────────

proto_lab:
  router:
    path: /workspace/router.md
    role: always-loaded — identity, directives, token budget, light map
    status: MISSING
  ram:
    path: /workspace/ram/
    role: active session state — loaded dynamically, volatile
    children:
      - active_task.md   # current task + exact status
      - scratchpad.md    # conductor's temporary thinking space
  system:
    path: /workspace/system/
    role: how to act — fetched only when conductor needs behavioural rules
    children:
      - overview.md
      - /orchestration/  # context-builder, polarity-rules, retrieval-policy,
                         # conflict-resolution, source-reliability
      - /identity/       # principles.md, constraints.md, style.md — MISSING
      - /architecture/   # ADRs
  library:
    path: /workspace/library/
    role: never loaded by default — fetched via search or explicit read
    children:
      - /semantic/       # glossary.md, patterns/, rules/
      - /episodic/       # sessions/, decisions.md
  flow:
    path: /workspace/flow/
    role: working directories for input/output processing
    children:
      - intake/
      - research/
      - build/
      - output/

# ── RING MAP ──────────────────────────────────────────────────

ring:
  G: notion.index           # intent lives in INDEX handoff
  P: proto_lab.system       # think using /system/ rules
  A: proto_lab.flow.build   # execute in /flow/build/
  E: proto_lab.flow.output  # evaluate against DONE_WHEN
  U: notion.lab             # fold verdict back — update LAB or LOGS

# ── MISSING ───────────────────────────────────────────────────

missing:
  - id: router_md
    path: /workspace/router.md
    gap: not yet written — blocked by empty /system/ and /library/
  - id: identity_folder
    path: /workspace/system/identity/
    gap: style.md and principles.md not written
  - id: max_retries
    gap: exit gate value not set
  - id: async_failures
    gap: Generator + Evaluator have no failure paths
