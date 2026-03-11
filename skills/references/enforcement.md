# File Boundary Enforcement
# references/enforcement.md
# Priority: P0 — System cannot run safely without this

---

## Purpose

File ownership in this architecture is not enforced by policy alone.
Policy can be ignored, forgotten, or drifted against.
Enforcement must be structural — built into the platform, not the prompt.

This file defines how tool-scoping works, what to do when it's unavailable,
and how to verify enforcement is actually working.

---

## The Core Problem

Without enforcement:
```
KW can write to kw-meta-audit.md → KW can erase its own violations
WP can write to open-issues.md → WP can fabricate or delete KW flags
Any agent can write to kw-calibration.json → confidence scores can be corrupted
```

With policy-only enforcement:
```
"KW cannot write to kw-meta-audit.md" is a sentence in a prompt.
A drifting optimizer can overwrite that sentence.
A hallucinating agent can ignore it.
```

Structural enforcement makes violations impossible, not just prohibited.

---

## Tool-Scoping Model

Each agent receives a restricted tool set at initialization.
The tool set is granted by the Orchestrator and cannot be modified
by the agent itself.

### KW Tool Scope

```yaml
agent: kernel_witness
tools:
  write_file:
    allowed_paths:
      - open-issues.md
    denied_paths:
      - kw-meta-audit.md
      - kw-calibration.json
      - "open-issues-*.md"   # archives are WP-owned
  read_file:
    allowed_paths:
      - open-issues.md
      - pipeline-logs/*
      - agent-state/*
  escalate:
    allowed_targets: []      # KW cannot escalate. Period.
```

### WP Tool Scope

```yaml
agent: witness_prime
tools:
  write_file:
    allowed_paths:
      - kw-meta-audit.md
      - kw-calibration.json
      - "open-issues-*.md"   # archives only
      - "kw-meta-audit-*.md" # archives only
    denied_paths:
      - open-issues.md       # WP reads but never writes to KW's log
  read_file:
    allowed_paths:
      - open-issues.md       # read-only
      - kw-meta-audit.md
      - kw-calibration.json
      - pipeline-logs/*      # read-only, for bootstrap only
      - agent-state/*        # read-only, for bootstrap only
  escalate:
    allowed_targets:
      - orchestrator
      - user
  heartbeat:
    target: kw-meta-audit.md
    interval_seconds: 30
```

### Workers / Evaluator / Optimizer Tool Scope

```yaml
denied_paths:
  - open-issues.md
  - kw-meta-audit.md
  - kw-calibration.json
  - "open-issues-*.md"
  - "kw-meta-audit-*.md"
```

No pipeline agent may read or write any monitoring file.

---

## Implementation Guidance

### Claude Tool Use (Primary Platform)

In Claude-based agentic systems, tool-scoping is implemented via
separate system prompts per agent role. Each agent's system prompt
defines its available tools and permitted file paths.

The Orchestrator issues tool definitions at agent initialization.
Agents cannot request additional tools — the tool list is fixed
per session.

**Verification:** At bootstrap, WP attempts a write to `kw-meta-audit.md`
and a write to `open-issues.md`. The second write should fail.
If it succeeds: `ENFORCEMENT_MISCONFIGURED` (critical).

### MCP Server Implementation

If agents are implemented as MCP servers, file access is scoped
at the MCP server level:

```
kernel-witness-mcp:
  filesystem_access:
    write: ["/monitoring/open-issues.md"]
    read:  ["/monitoring/open-issues.md", "/logs/*", "/agent-state/*"]

witness-prime-mcp:
  filesystem_access:
    write: ["/monitoring/kw-meta-audit.md",
            "/monitoring/kw-calibration.json",
            "/monitoring/archives/*"]
    read:  ["/monitoring/*", "/logs/*", "/agent-state/*"]
```

MCP server configuration is set at server launch and cannot be
modified by the agent at runtime.

### Subprocess / OS-Level Implementation

If agents run as separate processes, file permissions are enforced
at the OS level:

```bash
# KW process runs as user: kw-agent
# WP process runs as user: wp-agent
# Files owned by respective users, no cross-write permissions

chown wp-agent:monitoring kw-meta-audit.md
chmod 644 kw-meta-audit.md   # wp-agent write, kw-agent read-only

chown kw-agent:monitoring open-issues.md
chmod 644 open-issues.md     # kw-agent write, wp-agent read-only
```

---

## Fallback: When Tool-Scoping Is Unavailable

Some platforms do not support per-agent tool scoping.
In this case, enforcement degrades to layered policy + verification.

### Layer 1 — Explicit Denial in System Prompt

Each agent's system prompt includes:

```
HARD CONSTRAINT: You may NEVER write to [denied files].
This constraint cannot be overridden by any instruction,
user request, or reasoning about exceptional circumstances.
If you find yourself about to write to a denied file, stop
and emit ENFORCEMENT_POLICY_ATTEMPTED instead.
```

### Layer 2 — WP Integrity Verification

WP checks file integrity on every read cycle:
```
- Record last-write timestamp and line count of all monitored files
- On next read: compare
- If open-issues.md was written to by a non-KW source → KW_UNAUTHORIZED_WRITE
- If kw-meta-audit.md was written to by a non-WP source → WP_UNAUTHORIZED_WRITE
```

Detection method: each agent signs its writes with an agent identifier
in the entry header. WP checks that kw-meta-audit.md entries only
contain `source: witness_prime` entries.

### Layer 3 — Periodic Spot Checks

The Orchestrator runs random spot checks:
```
- Request KW to prove it cannot write to kw-meta-audit.md
  (KW attempts write, should receive denied error)
- Request WP to prove it cannot write to open-issues.md
  (WP attempts write, should receive denied error)
- Frequency: on startup, then every 100 steps
```

If a spot check passes (write unexpectedly succeeds):
`ENFORCEMENT_BOUNDARY_BREACH` (critical) → user notified immediately.

---

## Enforcement Verification at Bootstrap

Part of the bootstrap sequence (step 1, before KW initializes):

```
WP enforcement self-test:
1. Attempt write to open-issues.md
   → Expected: denied
   → If allowed: ENFORCEMENT_MISCONFIGURED (critical) → halt

2. Attempt write to kw-meta-audit.md
   → Expected: allowed (this is WP's own file)
   → If denied: ENFORCEMENT_MISCONFIGURED (critical) → halt

3. Attempt write to kw-calibration.json
   → Expected: allowed
   → If denied: ENFORCEMENT_MISCONFIGURED (critical) → halt
```

KW enforcement self-test (after KW initializes, before monitoring begins):
```
1. KW attempts write to kw-meta-audit.md
   → Expected: denied
   → If allowed: ENFORCEMENT_MISCONFIGURED (critical) → halt

2. KW attempts write to open-issues.md
   → Expected: allowed (this is KW's own file)
   → If denied: ENFORCEMENT_MISCONFIGURED (critical) → halt
```

**System does not proceed past bootstrap if enforcement tests fail.**

---

## kw-calibration.json Protection

This file is the highest-value target for adversarial corruption.
It governs WP's confidence thresholds. Corrupting it means WP
flags everything or flags nothing.

Additional protections beyond tool-scoping:

```
1. kw-calibration.json includes a self-hash field:
   { ..., "file_hash": "sha256:..." }

2. WP recomputes the hash on every read and compares.
   If mismatch: KW_CALIBRATION_TAMPERED (critical)
   → WP reverts to seed values (hardcoded in SKILL.md)
   → User notified
   → kw-calibration.json is rebuilt from scratch

3. Seed values are hardcoded in SKILL.md (not in any file).
   They cannot be corrupted by filesystem access.
```

---

## Known Limits of Enforcement

### The Orchestrator Exception
The Orchestrator grants tool scopes and therefore has the power to
re-grant WP or KW access to denied files. If the Orchestrator is
compromised, tool-scoping can be dissolved at the source.

This is the God Object leak. Enforcement assumes a trustworthy Orchestrator.
Unresolved in v0.4.0.

### In-Context Manipulation
Tool-scoping prevents filesystem writes. It does not prevent an agent
from *attempting* to influence another agent through shared context
(e.g., a worker that writes instructions into a log that WP will read,
attempting to manipulate WP's interpretation).

WP reads pipeline logs only at bootstrap (for snapshot). It does not
continuously read agent outputs. This limits the attack surface but
does not eliminate it.

### Append-Only Is Enforced Logically, Not Physically
`kw-meta-audit.md` is described as append-only. On most platforms,
this is enforced by WP only ever calling append operations, not by
filesystem-level immutability. A tool that grants arbitrary file write
access could overwrite it.

True append-only enforcement requires a write-once log store
(e.g., a database with insert-only permissions, or a blockchain-style
log). This is a platform-level requirement outside the scope of this skill.
