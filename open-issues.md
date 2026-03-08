# open-issues.md

**Last updated:** 2026-03-06

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
- [ ] Batch embedding pass — generate vectors for all null embeddings (Stage 6)
- [ ] Figma file showing real data

## Other

- [ ] assets/ folder bloated — 116% of repo size, consider GitHub LFS or external storage

---

## Protocol

Issues are resolved in stage order.
No issue gets fixed out of sequence unless it's a security risk.
Bot token is a security risk — priority one.
Everything else follows the roadmap.
