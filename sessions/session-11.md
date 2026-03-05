# Session 11 — 2026-03-04

## Project infrastructure set, memory anchored

**State on arrival:** Three sessions of context with no persistent memory — fixing that now.

**What happened:**
Identified that the Claude.ai Project for open-brain had a name but no instructions and no uploaded files — meaning every session started cold. Researched current best practices for Project setup and drafted the instructions from scratch.

The instructions cover: the vision (systematic but unconscious suffering, meta-case study + magical ledger), the stack (Supabase, pgvector, Edge Functions, Slack, OpenRouter, MCP), session format (four sections, nothing else), collaborator tone (precise, direct, no hand-holding), language rule (English only, quotes excepted), the safety reminder (no deployment without full comprehension or supervision), and the memory anchor (session logs are the source of truth).

Reviewed the draft together. Added five missing elements: stack context, language rule, tone definition, the safety reminder, and the memory anchor. Confirmed nothing needed to be removed — the vision and session format were kept exactly as written.

Instructions saved to the Project.

**Produced:**

- Full Project instructions drafted and saved in Claude.ai
- Identified 5 gaps in original instructions and resolved all of them
- Established session log naming convention: `session-NN.md`

**Open question:**
Which files should be uploaded to the Project first — edge function code, session logs, or both?
