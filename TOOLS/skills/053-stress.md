# Stress Test: KW-Meta v0.5.3

## The Central Problem

The spec has crossed a critical threshold. **The defense mechanisms now create more attack surface than they protect against.**

v0.3.0 was 7 pages. v0.5.2 is 16 pages. It has 8 rules, 6 invariants, 12 reference files (11 unbuilt), 10 degraded modes, a hash chain, checksums, a heartbeat, a bypass channel, a restart procedure, a layer model, tool-scoping tables, and a confidence calibration system with empirical recalibration.

This is supposed to be the **simpler** layer. The one with "fewer invariants = less surface area for drift." That claim is no longer true. WP is now at least as complex as KW. And WP has no witness.

Every iteration has followed the same pattern: find a hole → add a mechanism → mechanism creates new surface area → find a hole in the new surface area → add another mechanism. This is the architectural equivalent of the infinite regress the spec was designed to prevent.

The holes below are real. But the fix is not "add more mechanisms." The fix is to cut.

---

## Hole 1: The Spec Exceeds Working Memory

This is the most critical vulnerability and it's invisible from inside the spec.

An LLM agent executing WP must internalize: 8 rules, 6 invariants, 10 degraded modes, signal format, escalation protocol, bootstrap sequence, restart procedure, file integrity checks, heartbeat timing, bypass routing, confidence calibration, deduplication logic, batch windowing, and rotation thresholds.

**If the agent running WP can't hold the full spec in active context, it will deviate from the spec.** That deviation is the one thing nothing in the architecture catches — because WP has no witness, and its "anchor" (this skill file) only works if the agent actually reads and follows all of it.

A 16-page skill file for a passive observer is a contradiction. The complexity budget for the unwatched layer should be the smallest in the stack, not the largest.

---

## Hole 2: The Bypass Channel Is an Unguarded Escape Hatch

Rule 8: `ORCHESTRATOR_* flags route direct-to-user (bypass channel)`

The bypass exists because: if the Orchestrator is compromised, WP's normal relay is compromised, so WP needs an alternate path.

**But the bypass is gated by a naming convention, not an access control.** WP decides what constitutes an `ORCHESTRATOR_*` flag. Nothing prevents WP from routing non-Orchestrator signals through the bypass — either through drift, misclassification, or edge cases where the line is ambiguous.

Worse: the bypass was designed for a rare failure mode (Orchestrator compromise) but now exists as a permanent architectural feature. Every permanent bypass eventually becomes a primary path. This is how security architectures degrade.

**The question the spec doesn't answer:** In practice, how often will the Orchestrator actually be compromised vs. how often will the bypass be a source of mis-routed signals? If the answer is "rarely" and "more often," the bypass is net negative.

---

## Hole 3: The "Mechanical Router" Is a Fiction

The spec claims the Orchestrator is "a mechanical router, not an intelligent actor" that "acts on all [WP signals] mechanically."

But the degraded mode table says:

| `KW_SIGNAL_DEGRADED` on all flag types | Orchestrator **may** pause pipeline |

"May" is a judgment call. A mechanical router doesn't "may." It does or it doesn't.

Similarly: "Execute restart/re-init commands when instructed by WP signals." How does a mechanical router know _which_ WP signals instruct restart? It has to parse the signal type and match it to an action. That's interpretation, not routing.

The Orchestrator is the component that halts the system, restarts WP, re-initializes KW, pauses the pipeline, and routes to degraded mode. Calling it "mechanical" doesn't make it simple. It makes the complexity invisible.

---

## Hole 4: KW Watching the Orchestrator Is Circular

```
Orchestrator routes messages to KW
KW observes the Orchestrator
KW writes to open-issues.md
WP reads open-issues.md
WP relays to Orchestrator
```

**If the Orchestrator stops routing messages to KW, KW can't observe that the Orchestrator stopped routing.** The observation depends on the thing being observed functioning correctly.

The spec acknowledges this indirectly by adding the bypass — but the bypass only helps for signals WP generates, not for signals KW would have generated if it had received the data.

This is the same class of problem as a network monitor that depends on the network to report outages.

---

## Hole 5: Eleven Reference Files Are the Actual Spec

The skill file contains the architecture. The _behavior_ is deferred:

- `references/bootstrap-spec.md` — **P0, unbuilt** — what WP's cold-start snapshot actually measures
- `references/degraded-modes.md` — **P0, unbuilt** — what actually happens when things fail
- `references/enforcement.md` — **P0, unbuilt** — how file boundaries are actually enforced
- `references/orchestrator-bypass.md` — **P0, unbuilt** — how the bypass actually works

Four P0 files don't exist. The skill cannot be deployed. What's written is a design document for a design document.

This isn't necessarily wrong — phased development is fine — but it means v0.5.2 hasn't been tested against the question "can an agent actually execute this?" because the executable parts haven't been written.

---

## Hole 6: The Heartbeat Timing Doesn't Fit LLM Agent Execution

Heartbeat: every 30 seconds. Dead-man's switch: 60 seconds.

LLM agent turns commonly take 10–45 seconds. If WP is processing a complex multi-invariant check (reading open-issues.md, computing flag rates, checking calibration, comparing against thresholds, writing to kw-meta-audit.md), a single "turn" could easily exceed 60 seconds.

**The dead-man's switch would trigger during normal operation.** This causes: false `WP_UNRESPONSIVE` → Orchestrator attempts restart → WP was fine → WP comes back → it happens again. A restart loop triggered by the system working correctly.

---

## Hole 7: Hash Chains Require Tooling the Spec Doesn't Declare

The integrity system assumes WP can compute SHA-256 checksums. This requires a tool call to a crypto utility. The tool-scoping section lists `write_file` and `read_file`. It does not list a `compute_hash` tool.

If WP computes checksums by asking the LLM to produce them, they'll be wrong. LLMs cannot reliably compute SHA-256. If there's no dedicated tool, the entire integrity system — hash chains, calibration checksums, content hashes in signals — is theater.

---

## Hole 8: Silence Detection Has No Cold Start

Invariant 6 computes minimum expected flag rates "from KW's historical output over a rolling window."

On first deployment: no history. The rolling window is empty. Silence detection is inactive for the entire initial period (how long? unspecified). During that window, KW could be completely non-functional and WP wouldn't flag it.

The spec should define a bootstrap floor — a minimum acceptable flag rate from KW during the first N hours that doesn't depend on history.

---

## Hole 9: Confidence Calibration Is Dead Weight

The calibration system is the most complex subsystem in the spec: seed values, empirical recalibration after 100 flags, per-flag-type FPR tracking, base-rate-adjusted thresholds, `kw-calibration.json` with checksums and audit trails.

**What does it actually do?** It adjusts how much WP trusts its own flags. But WP's flags go to a human who makes the final judgment anyway. The human doesn't need WP to say "confidence: 0.72" vs. "confidence: 0.88." The human needs WP to say "KW's flagging pattern changed and here's the evidence."

The calibration system is solving a machine-to-machine trust problem that doesn't exist in this architecture. WP's consumer is a human (Layer 6), not another automated system. Humans don't consume confidence scores — they consume evidence.

Removing calibration eliminates: the confidence table, kw-calibration.json, the checksum system for that file, the WP_CALIBRATION_TAMPERED flag, the WP_CALIBRATION_RESET flag, the recalibration cycle, and one reference file. That's roughly 20% of the spec's complexity.

---

## The Deeper Pattern

Each hole above is fixable. But fixing them adds more spec. The pattern across v0.3 → v0.4 → v0.5 is clear:

| Version | Pages | Rules | Invariants | Degraded modes | Unbuilt ref files |
| ------- | ----- | ----- | ---------- | -------------- | ----------------- |
| 0.3.0   | ~7    | 7     | 5          | 0              | 3                 |
| 0.4.0   | ~10   | 7     | 5          | 6              | 11                |
| 0.5.0   | ~14   | 8     | 6          | 10             | 12                |
| 0.5.2   | 16    | 8     | 6          | 10             | 12                |

Every version is more correct and less implementable. The spec is converging on a formal proof that WP should exist, not on an artifact an agent can execute.

---

## Recommendation: Cut, Don't Add

The next version shouldn't fix these holes. It should ask: **what is the minimum WP that a single LLM agent can hold in working memory, execute reliably, and that a human can audit in five minutes?**

My candidate for the irreducible core:

**3 invariants** (not 6):

1. **Drift** — KW's flagging pattern changed without declaration
2. **Silence** — KW stopped flagging when it shouldn't have
3. **Rule violation** — KW acted outside its rules

**3 rules** (not 8):

1. Only observe KW — never touch the pipeline
2. Only escalation path to Orchestrator — KW cannot escalate
3. All signals visible to user — no hidden state

**1 file** (not 5+):

- `kw-meta-audit.md` — append-only log, plain text, human-readable

**0 reference files at deploy** — everything an agent needs is in the skill file or it doesn't ship.

No confidence scores. No hash chains. No calibration files. No heartbeat. No bypass channel. No checksums. No degraded mode table.

The heartbeat becomes: "WP appends to its log. If the log stops growing, something is wrong. The user can see this."

The bypass becomes: "WP always notifies the user. The user can see everything. If the Orchestrator is compromised, the user sees WP's log directly."

The integrity mechanism becomes: "The log is append-only and human-readable. The human is the integrity check."

This loses coverage of edge cases. It gains: an agent that can actually execute the spec, a human who can actually read the log, and a system simple enough that its failure modes are obvious rather than architectural.

**The user is Layer 6. Use them.**
