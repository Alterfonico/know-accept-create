# open-issues.md

**Last updated:** 2026-03-03

Known open issues. Not blockers. Logged so they cannot hide.

---

## Zone A

- [ ] Bot token exposed in screenshot — regenerate via @BotFather
- [ ] `tags: []` not yet wired into the pipeline — deferred to v1.1

---

## Zone B

- [ ] Telegram group not routing to n8n — Echo Chamber and n8n
      are currently separate pipes, not connected

---

## Zone C

- [ ] Column order in ZONE_A sheet inconsistent with ADR-002 spec
      ADR has `state` first, sheet has `timestamp` first
- [ ] `status` and `friction` columns empty and unspecified —
      decide: keep as human-maintained fields or remove

---

## Protocol

Issues are resolved in stage order.
No issue gets fixed out of sequence unless it's a security risk.
Bot token is a security risk — priority one.
Everything else follows the roadmap.
