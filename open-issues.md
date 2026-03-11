# open-issues.md

**Last updated:** 2026-03-11

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
- [ ] React component `mockClassify()` replaced with real `capture-echo` call
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

## Repo Hygiene

- [ ] `design/mockups/` has 27 HTML files (v0.1 through v0.21) — only latest matters for dev; archive old versions?
- [ ] `design/mockups/` reader files live alongside UI mockups but are functionally different — need own home?
- [x] `instructions-for-claude.md` — marked superseded by CLAUDE.md (S34)
- [x] CLAUDE.md created at repo root — unified project instructions (S34)

## Protocol

PARKED: audit complexity at least once a week — spec and code both.
When a fix adds a mechanism, ask: does this belong here or does it belong at a simpler layer?
The kw-meta arc (v0.3 → v0.5.3 → v0.6.2) is the reference. Complexity compounds invisibly.

## Protocol

Issues are resolved in stage order.
No issue gets fixed out of sequence unless it's a security risk.
Bot token is a security risk — priority one.
Everything else follows the roadmap.
