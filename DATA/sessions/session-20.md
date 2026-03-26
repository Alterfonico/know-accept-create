# Session 20 — 2026-03-08

## Android capture wired to Supabase direct

**State on arrival:** Schema live, moving to Android capture.

**What happened:**
Opened with three options for Android capture — simplest (HTTP Shortcuts), proper (Tasker), and lock screen. Chose HTTP Shortcuts to validate the pipeline end-to-end before adding complexity.

Configured the shortcut: POST to Supabase REST API directly, skipping n8n. Rationale: current payload is text and declared state only — no transcription, no inference. n8n comes back in when those are needed.

First attempt returned 400 from Cloudflare — traced to wrong key type (publishable key instead of anon JWT). Replaced key. Second attempt failed due to RLS policy allowing service_role only. Added anon INSERT policy. Third attempt failed due to duplicate Authorization headers — the app's built-in Bearer Authentication section conflicting with the manually set header. Resolved by disabling the built-in section and keeping the manual header only. Fourth attempt returned empty response — correct 201 behavior from `Prefer: return=minimal`. Confirmed three rows landed in Supabase with correct schema. Wired `{text_input}` variable for dynamic content capture per tap.

**Produced:**
- RLS policy `Allow anon insert` applied to `thoughts` table
- Android shortcut live: HTTP Shortcuts → Supabase REST → `thoughts` table
- `{text_input}` variable confirmed working for dynamic content per capture
- Pipeline validated: mobile → Supabase direct, no intermediary

**Open question:**
When should n8n re-enter the pipeline — at first audio capture attempt, or when trinary inference is needed?

---

_Opened: 2026-03-08 — Closed: 2026-03-08_
