# ADR-005 — Cloud Observer Cron Setup

**Status:** Implementation ready (S41)
**Date:** 2026-03-13

## Overview

KW and WP are deployed as Supabase Edge Functions. To activate them, configure a cloud cron service to trigger them on schedule.

## Cron Trigger URLs

```
KW Observer:  POST https://nlfryozynimffhwkhhls.supabase.co/functions/v1/kw-observer
WP Observer:  POST https://nlfryozynimffhwkhhls.supabase.co/functions/v1/wp-observer
```

## Headers

Both require the anon key from `kw-supabase-config.json`:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZnJ5b3p5bmltZmZod2toaGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NTExMDAsImV4cCI6MjA4ODEyNzEwMH0.VWLopIlZi7ad6MNA84LEo7ztiWBylzJ6g5Y1jHav1zw
Content-Type: application/json
```

(Or use the `apikey` header instead of `Authorization` if your cron service prefers it.)

## Schedule

| Agent | Frequency | Exact Time |
|---|---|---|
| KW | Every 4 hours | 00:00Z, 04:00Z, 08:00Z, 12:00Z, 16:00Z, 20:00Z |
| WP | Every 12 hours | 02:00Z, 14:00Z |

(WP offset by 2h to ensure KW data is available.)

## Setup via EasyCron (Free)

1. Visit https://www.easycron.com
2. Create account (or log in)
3. Add two cron jobs:

### Job 1: KW Observer

- **URL:** `https://nlfryozynimffhwkhhls.supabase.co/functions/v1/kw-observer`
- **Method:** POST
- **Schedule:** Every 4 hours
- **Headers:**
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZnJ5b3p5bmltZmZod2toaGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NTExMDAsImV4cCI6MjA4ODEyNzEwMH0.VWLopIlZi7ad6MNA84LEo7ztiWBylzJ6g5Y1jHav1zw
  Content-Type: application/json
  ```
- **Body:** `{}` (empty JSON)

### Job 2: WP Observer

- **URL:** `https://nlfryozynimffhwkhhls.supabase.co/functions/v1/wp-observer`
- **Method:** POST
- **Schedule:** Every 12 hours (offset: first run at 02:00Z, then every 12h)
- **Headers:** Same as above
- **Body:** `{}` (empty JSON)

## Alternative Cron Services

If EasyCron is unavailable, use:
- **Cron-job.org** (free, similar UI)
- **Vercel Cron** (if deploying to Vercel)
- **GitHub Actions** (if you prefer to keep everything in-repo; schedule workflow to `curl` the functions)

## Verification

After setup:

1. Check **Supabase → SQL Editor** → Run:
   ```sql
   SELECT COUNT(*), MAX(created_at) FROM kw_observations;
   SELECT COUNT(*), MAX(created_at) FROM wp_audit;
   ```

2. Once KW has run (4h), you should see rows in `kw_observations`.
3. Once WP has run (12h), you should see rows in `wp_audit`.

## Troubleshooting

- **Functions return 401:** Wrong or expired auth token. Update with fresh anon key from Supabase dashboard.
- **Functions return 500:** Check Supabase function logs: **Functions → Logs** (top-right corner).
- **No rows appearing:** Cron job may not be firing. Check cron service logs; verify URL is reachable.

## Data Export (Optional)

To export observations back to `open-issues.md` and `kw-meta-audit.md` for git audit trail:

```bash
# Query Supabase, format as markdown, append to open-issues.md
# TODO: Add export script or GitHub Action
```

Currently observations live in Supabase tables. Export is manual or via future automation.

## Next Steps

- Configure cron service (EasyCron recommended, free tier sufficient)
- Monitor first few runs (check Supabase logs + table counts)
- Once stable: (optional) add export automation to sync back to git files
