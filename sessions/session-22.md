# Session 22 — 2026-03-08

## The Corkboard Problem — designing a parking protocol for parallel threads

**State on arrival:** System is working but sessions leak. Mind runs multiple threads simultaneously and the tool to catch them is the one being built. Using a leaky bucket to build the bucket.

**What happened:**
Identified the core paradox: Meverse is a corkboard for life, but sessions have no corkboard. When parallel threads surface mid-session, they either get chased (drift) or jotted down and forgotten (loss). Neither is acceptable.

Designed a lightweight parking protocol that doesn't require Meverse to exist yet:

```
SESSION OPEN
  └── ONE primary thread declared upfront

DURING SESSION
  └── New thread surfaces → PARKED: [thought]
      Dropped in chat. Not chased.

SESSION CLOSE
  └── Parked threads listed in Produced
  └── One gets promoted to next session's primary
  └── Rest stay as candidates
```

The parking mechanic is the missing piece. It acknowledges without hijacking. Pin it, don't pick it up.

**Produced:**

- Parking protocol v1 defined
- Session format updated: primary thread declared at open, parked threads surfaced at close
- Insight logged: Meverse is the permanent corkboard; the parking protocol is the temporary one

**Open question:**
When a parked thread is more urgent than the declared primary — what's the override rule?
