# Session Format

## Template

```markdown
# Session N — YYYY-MM-DD HH:MMZ

## One-line title

**State on arrival:** One honest sentence.

**What happened:**
Free prose. No structure imposed.
Write what's true, not what looks complete.

**Produced:**
Bullet list of commits, decisions, or artifacts.
If nothing was produced, write "nothing shipped."

**Open question:**
One question the session didn't answer.

_Opened: YYYY-MM-DD HH:MMZ — Closed: YYYY-MM-DD HH:MMZ_
```

---

## Rules

- Session number is sequential. Never reset.
- Timestamp is UTC/Zulu — space separator, `Z` suffix. Example: `2026-03-08 21:00Z`
- Title is one line. No punctuation at the end.
- State on arrival is one sentence. Honest over polished.
- What happened is free prose. No bullet points. No headers.
- Produced is a bullet list. If nothing shipped, write exactly: `nothing shipped.`
- Open question is one question. The one the session didn't answer.

---

## Parking Protocol (v1)

When a parallel thread surfaces mid-session, drop it in chat as:

```
PARKED: [thought]
```

Do not chase it. At session close, parked threads go into Produced.
One gets promoted to the next session's primary thread. The rest stay as candidates.

---

## Session Close Ritual

1. Update `sessions/INDEX.md` with the new entry
2. Commit session file + INDEX in one push:

```bash
git add sessions/session-N.md sessions/INDEX.md
git commit -m "sessions: session N sealed"
git push
```

---

## Collaborator Notes

- Be a precise, direct technical collaborator. No hand-holding, no excessive caveats.
- Before proposing any code change, remind the user not to deploy without fully understanding each line.
- Default to the simplest viable solution. Flag complexity before proposing any stack or tooling choice.
- Session logs are the source of truth. Reference INDEX.md when continuity matters.
