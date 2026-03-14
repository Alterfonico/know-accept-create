# Session 43 — 2026-03-14 10:33Z
## Right drawer — node details panel, pre-loaded echo

**State on arrival:** S42 sealed with reader v062 (canonical, expanded bubbles). Right drawer stub CSS exists. Ready to build the interaction layer.

**What happened:**

Opened by clarifying naming conventions and the drawer pattern. The user provided a mockup showing the intended behavior:

1. **Naming sync** — established unified terminology going forward:
   - **Node** = log = message = 🪵 (the captured entry)
   - **Echo** = ai_read (the AI reflection on the node)
   - **Home** = main feed (where nodes list)
   - **Node Details Panel** = the right drawer

2. **Drawer pattern confirmed** — pre-loaded approach:
   - Tapping "ask about this >" slides drawer from right edge
   - Main feed shifts left (push pattern, not overlay)
   - Drawer shows: node text + metadata (voltage/confidence/time/source) + echo (italicized, gray)
   - Echo is pre-generated and stored in `ai_read` column (no live inference on tap)
   - No separate response panel — the echo itself IS the response

3. **UX clarity** — user provided mockup showing the exact layout: compressed bubble on left, full node details + echo in drawer on right.

**Production decision:** Pre-loaded echo means lighter inference load. One `ai_read` per node, generated upstream (during capture or batch operation). No API call on tap.

**UX refinement (session continuation, 16:19Z):** User provided additional clarity on the drawer interaction—the "tangled" pattern:
- Drawer is not a separate fixed panel; instead, it pulls from the right edge of the selected node
- Bubble stays visible on left (voltage color stripe shows continuity)
- Drawer's left edge and bubble's right edge are adjacent, no gap
- Same color family ensures they read as one pulled-open unit, not two separate elements
- Mobile view: slim bubbles → tap to semi-expand (show echo + "ask about this >") → tap purple link to open drawer

**Redundancy issue flagged:** When drawer opens, node text appears twice — in drawer header and in the visible bubble on left. Decision deferred to S44: hide node text on bubble when drawer is open, or accept as acceptable repetition?

**Produced:**
- Session notes (this file)
- Naming conventions documented and locked in
- Drawer behavior spec confirmed with mockup + "tangled" UX refinement added
- ASCII visualization of mobile layout created
- Redundancy issue logged to open-issues.md
- v065.html in progress (mobile drawer, tangled pattern)

**Open questions:**
1. Redundancy resolution: hide node text on bubble when drawer open, or leave?
2. Should poem/witness verse be rendered in drawer in v065, or stub for S44?
3. Where/when is `ai_read` generated? (During capture? Batch job? Edge Function?)
4. How do we seed existing nodes that have null `ai_read`? (Backfill strategy)

_Opened: 2026-03-14 10:33Z — Updated: 2026-03-14 16:19Z — Closed: [pending]_

**ADDENDUM (16:25Z):**

Created v065.html on s43-right-drawer branch with the tangled drawer pattern fully implemented:
- Mobile-optimized (100% width drawer, full-screen slide-in)
- Bubble stays visible on left when drawer opens (push pattern, main-view shifts left)
- Drawer's left border dynamically matches voltage color for "tangled" visual continuity
- Node details shown: title, 4-col metadata grid, echo, read-only input
- Mock data included for demo/testing
- Open issue logged: redundancy when drawer opens (node text visible in both bubble + drawer header)

---

## Handoff → Session 44

**Primary thread:** Build the node details drawer interaction in reader.

**Implementation scope for S43:**
1. Wire "ask about this >" button to open drawer (toggle class + slide animation)
2. Render drawer panel with node details + echo
3. Close button or swipe-to-close on drawer
4. Test with actual node data from Supabase (at least 1 node with `ai_read` seeded)

**Mockup reference:** User-provided image shows the exact layout (node text top, metadata, echo below).

**Tech approach:** Plain HTML/CSS/JS. No framework needed. Drawer = fixed position right panel, main view = push pattern (translateX).

**Pending items (unchanged):**
1. Cron activation (EasyCron)
2. capture-echo investigation (missing embeddings)
3. `ai_read` generation pipeline (where does it live?)
4. Backfill strategy for null `ai_read` nodes
5. open-issues.md uncommitted modifications
6. design/visions/zone-b-main/ audit

