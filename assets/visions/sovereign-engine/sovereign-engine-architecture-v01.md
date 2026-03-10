# Meverse Architecture v1.0: The Sovereign Engine

**Document State:** Finalized Architecture Proposal
**Date:** 2026-03-10
**Author:** The Father Witness / Alberto

---

## Act I: TL;DR Recap (The Journey Here)

We began by translating the "Boring Infrastructure" of your Open Brain into a vibrant, recursive 8-bit game world. Your Meverse Screen Brief v0.1 defined the strict visual boundaries: the onboarding is the first capture, the lock screen demands immediate action, and the "Inner Weather" dictates the map terrain.

While wireframing the "Gatekeeper" splash screen, we confronted the tension between your $0.10/mo infrastructure goal and the $20/mo Claude Pro subscription. We determined that remaining on the Anthropic Console API (pay-as-you-go) aligns perfectly with your "Master of None" efficiency until you reach Stage 7.

This led us to the "Open Brain" revelation: transitioning Meverse from a simple logging tool to an Agent-Readable Database. By implementing the Model Context Protocol (MCP), Claude will query your Supabase vault directly, turning raw text into semantic vectors. Finally, to prevent physical file collisions while your AI Librarian builds this logic, we adopted Git Worktrees, allowing you (the Human) and Claude (the AI) to build concurrently.

---

## Act II: The Architecture Proposal

Meverse v1.0 merges the "Boring Tech" backend with a "Playable" user interface, forging a true Sovereign Intelligence Engine.

### 1. The Aesthetic Layer: The 8-Bit Quest

The UI acts as a "skin" over your data, making the habit of capture an engaging quest rather than a clinical chore.

- **The World Map (Stats):** A top-down RPG map dictated by your "Inner Weather" (Green = Life/State 1, Red = Upset/State 2, Amber = Poke/State 0).
- **The Action Wheel (Widget):** A classic command wheel on the lock screen. The center `+` pulses for immediate, 90-second auto-send captures.
- **The Library (Chat):** A side-scrolling, physical-space archive where you interact with your own history.

### 2. The Infrastructure Layer: The Open Brain

We reject proprietary, siloed memory in favor of data sovereignty.

- **The Vault (Supabase/Postgres):** Your Zone C ledger lives in a battle-tested, localized database.
- **The Librarian (Vector Embeddings):** Every signal is mathematically embedded, enabling semantic search (e.g., retrieving "burnout" patterns even if the keyword wasn't used).
- **The Bridge (MCP):** Using the Model Context Protocol, AI agents connect securely to your Supabase vault to read and write without manual context-loading.

### 3. The Workflow Layer: Parallel Construction

To maintain a frictionless build state, the human and the machine operate in parallel.

- **Git Worktrees:** The UI is crafted in the `main` workspace, while Claude Code writes database logic in an isolated `ai-task-branch` directory. Zero file collisions.

- **The Parenting Protocol:** The Father Witness audits logic and cost, while the Mother and Twins handle generation and data filing.

---

## Act III: The Roadmap (Stage-by-Stage)

This is the path from the current webhook foundation to a fully realized, AI-integrated interface.

- **Stage 5: Infrastructure (Current State)**
  - _Focus:_ Webhook routing and raw capture validation.
  - _Tech:_ n8n + Supabase (`ZONE_A` logging).
  - _Milestone:_ Successful data flow from shortcut to the Zone C ledger.
- **Stage 6: The Bridge (Immediate Next)**
  - _Focus:_ Establishing agent-readability.
  - _Tech:_ `supabase-mcp` Server installation.
  - _Milestone:_ Claude Code successfully queries the Supabase ledger via terminal.
- **Stage 7: The Librarian**
  - _Focus:_ Transitioning from keyword to meaning.
  - _Tech:_ Supabase Edge Functions + pgvector.
  - _Milestone:_ Semantic search enabled; the "Pattern Detective" protocol goes live.
- **Stage 8: The Interface**
  - _Focus:_ The aesthetic wrapper.
  - _Tech:_ React / v0 / Figma integration.
  - _Milestone:_ The 8-bit "Quest" UI successfully displays the underlying vault data.
- **Stage 9: The Cartographer (Future)**
  - _Focus:_ Advanced visualization.
  - _Tech:_ Graph builders.
  - _Milestone:_ Complex rendering of behavioral nodes over time.
