---
name: rhythm-enter
description: Read voltage trend (last 12h) and decide if conditions are right to enter a session
---

# /enter — Session Entry Signal

Queries the `thoughts` table for voltage trend over the last 12 hours.

**Usage:**
```
/enter
```

**Returns:**
- Entry signal: YES or NO
- Voltage breakdown: % HI / LO / FLAT
- Trend: what pattern emerged
- Recommendation: enter now, wait, or take a break

---

## How It Works

Reads the last 12 hours of captured thoughts from Supabase `thoughts` table.

**Voltage scale (trinary_state):**
- `1` = HI (alive, charged, present)
- `2` = LO (depleted, stuck, heavy)
- `0` = FLAT (neutral, showed up)

**Entry criteria:**

| Pattern | Signal | Recommendation |
|---------|--------|-----------------|
| HI ≥ 50% | ✓ YES | Enter now. You're in rhythm. |
| HI 30-49% + FLAT ≥ 20% | ✓ YES | Enter. Building momentum. |
| HI < 30% + LO ≥ 50% | ✗ NO | Don't enter. Take a break. |
| LO ≥ 60% | ✗ NO | Break. You're depleted. |
| FLAT ≥ 70% | ✗ NO | Wait. No clear signal yet. Capture more. |
| All HI or All LO (no mix) | ? UNSTABLE | Enter cautiously. Rhythm is brittle. |

---

## SQL Query (Reference)

```sql
SELECT
  trinary_state,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) as pct
FROM thoughts
WHERE created_at > NOW() - INTERVAL '12 hours'
GROUP BY trinary_state
ORDER BY trinary_state;
```

**Maps to:**
- `trinary_state = 1` → HI %
- `trinary_state = 2` → LO %
- `trinary_state = 0` → FLAT %
- `trinary_state = NULL` → (ignored; indicates classifier failure)

---

## Implementation Notes

1. **Config required:** Needs Supabase URL + publishable key (or service role key if running server-side)
2. **Cadence:** Intended for manual invocation before opening a session (not a scheduled task)
3. **Window:** 12h captures enough data to see rhythm without stale noise
4. **Fallback:** If fewer than 3 thoughts in window, return "insufficient data, capture more"

---

## Philosophy

This skill is the opposite of KW/WP. Instead of monitoring a broken pipeline, it reads the actual user state signal.

- **No scheduled task:** You invoke it before starting
- **No false alarms:** Just voltage distribution, no complexity
- **Direct signal:** "Based on your last 12h, is now a good time?"

The user decides when to enter. The system reports rhythm. That's it.

---

## Future: Sibling Skills

- `/break` — Am I burned out? (LO trend + time-since-last-break)
- `/reseal` — Is this unit complete? (commit + closing checklist)
- `/reentry` — Has incubation worked? (LO → HI transition + time elapsed)

All use the same `thoughts` table rhythm signal. Same simplicity.
