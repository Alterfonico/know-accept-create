# Handoff — Echo Chamber · Reactions Feature
**Date:** 2026-03-11
**Target agent:** Claude Code (terminal / Supabase CLI)
**Estimated session:** 25–30 min

---

## Context

Meverse is a body-first capture system. The user logs thoughts + trinary states
(0=POKE, 1=LIFE, 2=UPSET) from Android via HTTP Shortcuts → Supabase REST.

The `thoughts` table lives in Supabase project `nlfryozynimffhwkhhls` (Europe region).

A friend (Bruna) needs to read a shareable HTML file in her browser and react
to individual echoes with one of three symbols — no login, no keys.

---

## Trinary reference

| Integer | Internal name | Friend-facing meaning        |
|---------|---------------|------------------------------|
| 0       | POKE          | important · needs attention  |
| 1       | LIFE          | love · like · thumbs up      |
| 2       | UPSET         | upset · mad about it         |

---

## What needs building

### 1. Supabase migration — `reactions` table

```sql
create table reactions (
  id          uuid primary key default gen_random_uuid(),
  thought_id  uuid not null references thoughts(id) on delete cascade,
  symbol      smallint not null check (symbol in (0, 1, 2)),
  created_at  timestamptz default now()
);

-- anon can insert
alter table reactions enable row level security;
create policy "anon insert" on reactions
  for insert to anon with check (true);

-- anon can read (so the owner can see counts)
create policy "anon read" on reactions
  for select to anon using (true);
```

### 2. RLS audit on `thoughts` before shipping

Run this and confirm anon cannot INSERT:

```sql
select grantee, privilege_type
from information_schema.role_table_grants
where table_name = 'thoughts';
```

If anon INSERT exists, remove it:

```sql
drop policy if exists "<policy name>" on thoughts;
```

### 3. Shareable HTML file — `echo-chamber-share.html`

Derived from `meverse-reader_v033.html`. Changes:

- `const LIMIT = 30` at top — configurable, controls how many echoes load
- Remove filter bar (too much surface for a guest)
- Remove input bar
- On each bubble: show three tap targets — `◎ important` · `♡ love` · `✕ upset`
- Tap → POST to `reactions` table via Supabase anon REST
- Reaction persists visually for the session (no page reload needed)
- No login, no visible keys in the UI (anon key is still in the file —
  acceptable because RLS is locked down)
- Title: "Echo Chamber · shared view"

### 4. Reader update (optional, same session)

In `meverse-reader_v033.html`, after reactions table exists:
- Show reaction counts per bubble (e.g. `◎ 2  ♡ 1`) pulled from Supabase

---

## Files to reference

- `design/mockups/meverse-reader_v033.html` — current reader (base for share file)
- `architecture/ADR-002-zone-a-input-gate.md` — trinary spec
- `open-issues.md` — known gaps

---

## Do not deploy without

1. Confirming anon cannot INSERT to `thoughts`
2. Testing a reaction POST lands correctly in the `reactions` table
3. Owner reviewing the share file before sending to Bruna

---

## Out of scope for this session

- Auth / named reactions (who reacted)
- Inference layer (Edge Function + OpenRouter) — separate roadmap item
- Mac capture pipeline
