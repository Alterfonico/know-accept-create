# Session 47 — 2026-03-15 19:49Z
## Reader deployment — v068 + ES module constraint discovered

**State on arrival:** S45 and S46 had no session files — branches existed, work was committed, but documentation was missing. PR #5 reconstructed both sessions from git history and chat transcripts. Main is clean.

**What happened:**

Session opened with the handoff from the pre-session S47 file: wire `meverse-reader_v065.html` to live Supabase data.

**Cherry-pick of v066:** v066 was not on main (only the session files were merged in PR #5 — the actual design file was on `s46-mobile-drawer-refinement`). Cherry-picked commit `740cdae` to bring v066 into the S47 branch before starting.

**Wrong base (v067):** First attempt used v066 as base and rewrote the JS heavily. User corrected: v065 is the canonical version with the right semi-expanded bubble UX. Lesson: read what file the user is pointing to, not what the handoff says.

**v068 (v065 + Supabase):** Rewrote only the `<script>` block of v065. Changes:
- `type="module"` + Supabase import from `esm.sh`
- `mockThoughts` replaced by `fetchThoughts()` async function
- DB columns: `content`, `created_at`, `trinary_state` (0=TASK, 1=HI/life, 2=LO/upset), `input_type`, `ai_read`
- `id` is UUID string — string comparison in `find()`
- `ai_read` null → echo/ask-link not rendered in bubble

**ES module / file:// constraint discovered:** User opened v068 in Safari and Chrome via file:// — neither semi-expanded bubbles nor side drawer appeared. Root cause: `type="module"` with a CDN import is blocked by CORS when served via `file://`. The Supabase import fails silently, `fetchThoughts()` never runs, no bubbles render, all 3 interaction states are unreachable.

**3-state implications surfaced:**

The depth ladder is: slim (default) → semi-expanded (tap body) → drawer (tap "ask about this").

Implication 1 — **State 2 is gated behind State 1.** The drawer is only reachable by first expanding a bubble. This is intentional: discovery, not navigation. But it means the interaction model is invisible until the user knows to tap a bubble.

Implication 2 — **Entire UX collapses if no data.** If fetch fails (wrong key, network down, file:// block), there are zero bubbles, zero states to trigger. The reader is a pure witness tool — it has no offline mode, no cached state, no fallback content. That's correct philosophically but fragile operationally.

Implication 3 — **file:// is the deployment reality.** The reader lives as a local HTML file. Any CDN dependency requiring ES module syntax breaks it. Fix: use UMD build via plain `<script>` tag — no `type="module"` needed, works from file://.

**Conclusion — v066 through v069 unsuccessful:**

All four versions (v066–v069) failed to deliver working interactions in-browser. The user confirmed v070 already exists on main. S47 produced nothing shippable. The Supabase wiring work should be attempted against v070, not any of the v066–v069 files produced this session.

Root failures:
1. Wrong base file chosen (v066/v067 instead of v065)
2. ES module approach (`type="module"` + esm.sh) blocked by `file://` CORS in both Safari and Chrome — bubbles never rendered
3. UMD fix (v069) not verified working before session ended
4. v070 already existed — the work done here duplicated effort on a stale base

**Produced:**
- `design/mockups/meverse-reader_v067.html` — wrong base, superseded
- `design/mockups/meverse-reader_v068.html` — right base (v065), ES module, broken on file://
- `design/mockups/meverse-reader_v069.html` — UMD approach, unverified
- Session file documenting ES module / file:// constraint and 3-state implications
- nothing shipped that works

**Open question:**

v070 exists. What is its current state — does it have mock data or is it already wired? That determines whether S48 is a wire-up or a debug session.

_Opened: 2026-03-15 19:53Z — Closed: 2026-03-15 20:30Z_
