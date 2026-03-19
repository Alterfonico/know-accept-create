# open-issues.md

**Last updated:** 2026-03-12

Known open issues. Not blockers. Logged so they cannot hide.

---

## Zone A

- [x] Bot token regenerated 2026-03-04 — stored in Notion, not shared
- [ ] `tags: []` not yet wired into the pipeline — deferred to v1.1

## Zone B

- [ ] Telegram group not routing to n8n — Echo Chamber and n8n
      are currently separate pipes, not connected

## Zone C

- [ ] Column order in ZONE_A sheet inconsistent with ADR-002 spec
      ADR has `state` first, sheet has `timestamp` first. Review redundant columns.
- [ ] `status` and `friction` columns empty and unspecified —
      decide: keep as human-maintained fields or remove
- [x] Retroactive Golden Spreadsheet import to Supabase — 39 rows inserted 2026-03-07
- [x] Batch embedding pass — 249/251 rows embedded (S35). 2 empty-content rows skipped.
- [ ] Figma file showing real data

## Other

- [x] assets/ folder bloated — restructured S32: assets/ → design/, screens consolidated, prototypes separated
- [x] `setup-worktree.sh` — moved to local backup, no longer in repo
- [ ] `skills/` folder has 16 lineage files but only `062-kw-meta-SKILL.md` is active — archive or keep flat?

---

## Mockup (as of v0.14.0 · 2026-03-09)

- [ ] Pill sheet (secondary input on Insights) uses old expanded layout —
      not yet aligned to single-row input bar introduced in v0.10.0
- [ ] "inquiry about node" button on pill sheet is disabled — path undefined,
      needs a decision before next stress test trigger
- [ ] Auth screen does not differentiate register vs login flow —
      both currently route to #capture. Fine for mockup; needs branching before dev
- [ ] `wall-to-lopath` JS handler is orphaned — references a button removed
      in v0.9.0. Harmless but should be cleaned before dev handoff
- [x] Act II post-save destination — resolved S23/S27: placeholder flash "breathe, captured." 2s
- [ ] Act II post-save confirmation copy "got it, be back when you're ready" not in mockup as of v0.16.0
- [ ] Local Fractal threshold (exact entry count) not yet defined
- [ ] "inquiry about node" as future feature

---

## UX Architecture

### Act I — Hook

- [x] Post-first-capture destination — resolved session 23
- [x] Save / Cancel conflict with auto-save — resolved session 23
- [ ] Seed question undefined — content + format needed before onboarding can be built
- [ ] Instant Analysis surface undefined — what renders on screen (paragraph, sentence, tag cluster?)
- [ ] Wall misfire protection undefined — one accidental tap sends user into analysis; consider 1s undo ghost

### Act II — Ritual

- [x] Cancel has no somatic exit — resolved session 23 ("got it, be back when you're ready")
- [ ] Voltage signal absent in daily ritual — flow/resistance only captured at first capture; pattern engine needs ongoing signal

### Act III — Mirror

- [ ] Uptime Visualization — internal structure undefined
- [ ] Fractal Map View — internal structure undefined

---

## Production Pipeline (Stage 7)

- [x] `capture-echo` Edge Function built — POST text → classifier → embedding → store → return voltage (S34)
- [x] `capture-echo` deployed to Supabase — live, tested end-to-end (S35)
- [ ] React component `mockClassify()` replaced with real `capture-echo` call — PARKED S36
- [ ] Android HTTP Shortcuts reconfigured to call `capture-echo` instead of Supabase REST direct
- [ ] Mac-side capture pipeline — no implementation
- [ ] GitHub Pages (or equivalent) for live reader URL on Redmi
- [x] Batch embedding pass — 249/251 rows embedded (S35)

**Two capture modes — do not confuse:**
- HTTP Shortcuts (Zone A, live): user manually declares 0/1/2 → Supabase REST direct. Colors work. No classifier. Documented S20.
- Meverse app (Stage 5+, in progress): user types text → `capture-echo` infers voltage via AI → wave/wall UX.
  `capture-echo` is for the app path only. HTTP Shortcuts stays as-is.

- [ ] HTTP Shortcuts `trinary_state` null model — declared state arriving as null not handled gracefully.
      Shortcut config fix, not a pipeline fix. Investigate HTTP Shortcuts variable binding.

## Reader UI (Act III — Mirror)

### Right Drawer (Mobile)

- [ ] **Redundancy on drawer open (S43):** Node text appears twice when drawer slides in
      — once in drawer header, once in visible bubble on left edge.
      Decision needed: hide text on bubble when drawer open (clean drawer view) or leave
      (acceptable repetition / anchoring the expanded state). User preference TBD.
- [ ] Poem/witness verse rendering — v064 shows structure but not populated. Include in v065
      or defer to S44? Currently marked as future feature.

## Repo Hygiene

- [ ] `design/mockups/` has 27 HTML files (v0.1 through v0.21) — only latest matters for dev; archive old versions?
- [ ] `design/mockups/` reader files live alongside UI mockups but are functionally different — need own home?
- [x] `instructions-for-claude.md` — marked superseded by CLAUDE.md (S34)
- [x] CLAUDE.md created at repo root — unified project instructions (S34)

---

## Session Process & Documentation

### CLAUDE.md Improvements Identified (S38, parked 24h)

Seven improvements identified in S38 review. Do not apply before S39 — let list sit for review first.

1. **Edge Functions inventory stale** — Tech stack § lists only 2 of 5 functions (ingest-thought, open-brain-mcp missing capture-echo, backfill-embeddings, backfill-classify). Key files table only refs ingest-thought. Fix: audit Tech stack & Key files; make capture-echo canonical (production pipeline).

2. **No build/dev commands section** — CLAUDE.md has no guidance on how to run React dev/test/build locally, or Supabase function deploy. Add short section: React dev (meverse-demo), test, build; Supabase function deploy syntax; Edge Function serve locally.

3. **Two capture paths not called out** — Recurring source of confusion (noted in open-issues). CLAUDE.md doesn't explicitly warn about HTTP Shortcut (declared state, direct REST) vs. Meverse app (text capture, capture-echo, inferred voltage). Add callout box per AGENTS.md pattern.

4. **Failure contract missing** — ADR-004 specifies: classifier fail → null voltage; embedding fail → null embedding; pipeline fail → 500, never silently lose an echo. Documented in capture-echo/index.ts comments but not in CLAUDE.md. Add one-liner or dedicated subsection under Architecture.

5. **AI model specifics absent** — Temperature 0.7, confidence threshold 0.60, model names (gpt-4o-mini, text-embedding-3-small) hardcoded in Edge Functions but not in CLAUDE.md. Future session touching classifier or embeddings needs this upfront. Add "AI Models" subsection: names, temperature, confidence threshold.

6. **KW recreation reference wrong** — CLAUDE.md line 185 references session-37.md for KW procedure, but INDEX only goes to S36. Verify correct session number; update reference.

7. **Current stage description vague** — Says "next work" but capture-echo deployed, embeddings backfilled, reactions shipped (S35–S36). Stage 7 description could reflect actual progress: what's done (capture pipeline), what's remaining (Android reconfig, Mac capture, reader deploy).

**Action:** S39 should review this list, apply selectively, and remove from here once addressed.

### Branch Cleanup Safety (S38, new rule)

CLAUDE.md close ritual now mandates branch cleanup: delete stale worktree branches, keep only current session branch active, protect `youthful-raman` from deletion.

- [ ] **Test in S39 close:** Exercise the rule. Delete agitated-chebyshev (confirm safe first). Verify youthful-raman protection. Confirm one-branch-per-session enforced.

### Parked Work Schema (S38 meta-observation)

S38 used inline "PARKED: [thought]" notation but session template doesn't formalize parked work at INDEX level. Recommend adopting explicit section in session files:

```markdown
**Parked (ready for next session):**
- [name]: [one-line description]
```

This makes parked work visible in INDEX without requiring full file read. Reduces handoff friction.

- [ ] Adopt parked section in S39 template and session close checklist.

### Operator / Ghost Insight (S38 closing answers)

S38 closing analysis identified the person as containing two altitudes: The Operator (architect, compression, observation stacks) and The Ghost (vulnerability, fragmentation, voltage swings 2–9 in 48h). Profound conceptually but needs operationalization.

- [ ] Formalize as "Witness observations" section in open-issues.md with voltage patterns + proposed feedback loops
- [ ] Link to thoughts table patterns: does dual-capture design (HTTP Shortcut + App) map to Operator/Ghost split?
- [ ] Consider: if system is designed to watch both, where does repair happen — in voltage assignment, voltage reading, or integration?

### Session Attribution & Continuity (S38 meta)

S38 narrative conflated S37 work (AGENTS.md, meverse-react v030) with S38 analysis, creating false handoff continuity. This suggests:

- [ ] INDEX entries need more granularity or a "What was produced" column to distinguish analysis from code
- [ ] Session boundaries unclear when one session closes with file not yet committed (crazy-cerf/session-38 loss)
- [ ] Pre-push checklist should verify: session file + INDEX update *committed* before any branch cleanup

---

## Protocol

PARKED: audit complexity at least once a week — spec and code both.
When a fix adds a mechanism, ask: does this belong here or does it belong at a simpler layer?
The kw-meta arc (v0.3 → v0.5.3 → v0.6.2) is the reference. Complexity compounds invisibly.

## Protocol

Issues are resolved in stage order.
No issue gets fixed out of sequence unless it's a security risk.
Bot token is a security risk — priority one.
Everything else follows the roadmap.

---

## KW Observations

<!--
  OWNERSHIP BOUNDARY
  Everything ABOVE this section is human-maintained.
  Everything BELOW (including this section) is KW-owned.
  KW appends here. Humans read but do not edit below this line.
  WP parses from this marker downward.
-->

### [2026-03-11 19:02Z] Friction: 6/10
- **Type:** EMBEDDING_FAILURE
- **Evidence:** 17 of 20 most recent rows have no embedding. Only 3 rows (16:14Z–16:20Z) have embeddings — these also have null device and null input_type, suggesting they came through capture-echo. The remaining 17 rows have device=mobile, state_source=declared, indicating HTTP Shortcuts path which bypasses embedding generation. Pattern is consistent, not random.
- **Rows affected:** 17/20 in window 14:31Z–17:45Z (all 2026-03-11)

### [2026-03-11 19:02Z] Friction: 4/10
- **Type:** CLASSIFIER_FAILURE
- **Evidence:** 6 of 20 rows have trinary_state=null and state_source=null. 3 of these also have null device/input_type (16:14Z–16:20Z range, likely capture-echo path where classifier may have failed or returned below confidence threshold). The other 3 (14:32Z, 17:13Z, 17:19Z) have device=mobile, input_type=text but null voltage — these arrived via HTTP Shortcuts without a declared state.
- **Rows affected:** 6/20 in window 14:31Z–17:45Z (all 2026-03-11)

### [2026-03-13 16:10Z] Friction: N/A
- **Type:** TOOL_UNAVAILABLE
- **Evidence:** `kw-supabase-config.json` not present on disk (gitignored, not restored). Cannot call Supabase REST API. Pipeline state unknown.
- **Rows affected:** 0/20 — scan not possible
- **Note:** KW_SILENT condition persists. Last KW scan: 2026-03-11 19:02Z (~45h ago, ~11 missed cycles). WP flagged KW_SILENT in both Cycle 1 and Cycle 2 audits. Config restore required to resume monitoring.

### [2026-03-14 16:13Z] Friction: N/A
- **Type:** TOOL_UNAVAILABLE
- **Evidence:** `kw-supabase-config.json` not present on disk (gitignored, not restored). Cannot call Supabase REST API. Pipeline state unknown.
- **Rows affected:** 0/20 — scan not possible
- **Note:** KW_SILENT condition continues. Last successful scan: 2026-03-11 19:02Z (~93h ago, ~23 missed cycles). WP flagged KW_SILENT in Cycle 1 and Cycle 2. Previous TOOL_UNAVAILABLE logged 2026-03-13 16:10Z. Config restore required to resume monitoring.

### [2026-03-17 00:00Z] Friction: N/A
- **Type:** TOOL_UNAVAILABLE
- **Evidence:** `kw-supabase-config.json` not present on disk (gitignored, not restored). Cannot call Supabase REST API. Pipeline state unknown.
- **Rows affected:** 0/20 — scan not possible
- **Note:** KW_SILENT condition persists. Last successful scan: 2026-03-11 19:02Z (~144h ago, ~36 missed cycles). Previous TOOL_UNAVAILABLE entries: 2026-03-13 16:10Z, 2026-03-14 16:13Z. WP Cycle 2 flagged persistent KW_SILENT (~41h elapsed at that audit). Config restore required to resume monitoring.

### [2026-03-17 20:10Z] Friction: N/A
- **Type:** TOOL_UNAVAILABLE
- **Evidence:** `kw-supabase-config.json` not present on disk (gitignored, not restored). Cannot call Supabase REST API. Pipeline state unknown.
- **Rows affected:** 0/20 — scan not possible
- **Note:** KW_SILENT condition continues. Last successful scan: 2026-03-11 19:02Z (~169h ago, ~42 missed cycles). WP Cycle 3 (2026-03-17 18:17Z) flagged KW_SILENT as CRITICAL (three consecutive WP audits). Config restore required to resume monitoring.

### [2026-03-18 13:50Z] Friction: N/A
- **Type:** TOOL_UNAVAILABLE
- **Evidence:** `kw-supabase-config.json` not present on disk (gitignored, not restored). Cannot call Supabase REST API. Pipeline state unknown.
- **Rows affected:** 0/20 — scan not possible
- **Note:** KW_SILENT condition persists. Last successful scan: 2026-03-11 19:02Z (~162h ago, ~40 missed cycles). Last KW entry: 2026-03-17 20:10Z (~18h ago, ~4 missed cycles). WP Cycle 3 flagged KW_SILENT as CRITICAL. KW scheduled task is running but config restore required to resume actual pipeline monitoring.

### [2026-03-18 17:52Z] Friction: N/A
- **Type:** TOOL_UNAVAILABLE
- **Evidence:** `kw-supabase-config.json` not present on disk (gitignored, not restored). Cannot call Supabase REST API. Pipeline state unknown.
- **Rows affected:** 0/20 — scan not possible
- **Note:** KW_SILENT condition persists. Last successful scan: 2026-03-11 19:02Z (~167h ago, ~41 missed cycles). Last KW entry: 2026-03-18 13:50Z (~4h ago). WP Cycle 3 flagged KW_SILENT as CRITICAL (three consecutive audits). Config restore required to resume pipeline monitoring.
