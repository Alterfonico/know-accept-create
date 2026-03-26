## Handoff: Session 27 → 29

**Where we are:**
v0.14.0 sealed. Light mode shipped. Stress test overdue — trigger was met at v0.7.0,
surface has changed significantly since.

**What to do first:**
Open the ux-stress-test skill. Run it against v0.14.0. No React until decisions are locked.

**Five unknowns to stress test:**

1. lo-path modal — does it hold under all three entry paths? (save for now / wall / wave not-now)
2. Silence after send — is it enough, or does the loop feel broken without a post-save signal?
3. Register vs login — single auth screen serving both paths adequately?
4. "inquiry about node" on pill sheet Insights — define it or kill it
5. Act I full flow — splash → register → first capture → lo-path modal → home, no gaps

**Known open items (from open-issues.md):**

- Pill sheet layout not aligned to new single-row input bar
- Auth doesn't branch register vs login (fine for mockup, needs decision before dev)
- `wall-to-lopath` JS handler orphaned — harmless, clean before dev handoff
- Local Fractal threshold (exact entry count) undefined

**Files in repo:**

- `mockup/meverse-mockup_v0_14_0.html` — current canonical version
- `architecture/ux-architecture-ascii_v070.md` — full three-act map
- `skills/ux-stress-test/SKILL.md` — stress test protocol
- `open-issues.md` — current issue log

**Next stress test trigger (still active):**
v0.7.0 is built ✓ — trigger met. Run the test.

**Open question from session 27:**
Act II post-save destination — silence, or does something still need to happen?
