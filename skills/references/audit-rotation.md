# Audit Rotation
# references/audit-rotation.md
# Priority: P2 — System runs with reasonable defaults without this

---

## What Is This?

Log files grow forever if you let them.
A file with 100,000 entries is too big to load, too slow to search,
and too heavy for an LLM context window.

This file defines when logs get archived, how the hash chain works,
and what happens when the archive itself gets too big to read.

---

## Files That Rotate

| File | Rotation trigger | Archive name |
|---|---|---|
| `open-issues.md` | 500 entries | `open-issues-{timestamp}.md` |
| `kw-meta-audit.md` | 10,000 entries | `kw-meta-audit-{timestamp}.md` |
| `orchestrator-decisions.md` | No rotation (append-only forever) | — |

`orchestrator-decisions.md` is never rotated because it is the user's
primary audit surface. Losing any part of it reduces accountability.
If it grows large, the user reviews and archives manually.

---

## Rotation Process

When `kw-meta-audit.md` hits 10,000 entries:

```
1. WP computes SHA-256 hash of the full active file
2. WP writes final entry to active file:
   {
     "type": "WP_ROTATION",
     "archive_name": "kw-meta-audit-2026-03-07T14:22:00Z.md",
     "file_hash": "sha256:abc123...",
     "entry_count": 10000,
     "timestamp": "ISO-8601"
   }
3. WP renames active file to archive name
4. WP creates new kw-meta-audit.md with genesis entry:
   {
     "type": "WP_GENESIS",
     "prior_archive": "kw-meta-audit-2026-03-07T14:22:00Z.md",
     "prior_archive_hash": "sha256:abc123...",
     "timestamp": "ISO-8601"
   }
```

The new file's first entry links back to the old file's hash.
That's the chain. Each file is proof that the prior file existed unchanged.

---

## Hash Chain — Simple Version

Think of it like a wax seal on a letter.

```
Archive 1 ends with:   hash = "abc123"
Archive 2 starts with: "prior hash = abc123"  ← seal

Archive 2 ends with:   hash = "def456"
Archive 3 starts with: "prior hash = def456"  ← seal

Active file starts with: "prior hash = def456" ← seal
```

If anyone modifies Archive 2, its hash changes.
Archive 3's opening entry no longer matches.
WP detects the broken seal → `WP_AUDIT_INTEGRITY_FAILURE`.

---

## Verification Schedule

WP doesn't verify the full chain on every write — that would be slow.
Instead it uses a sampling schedule:

```
Every 100th append:   verify last archive's seal (opening entry matches)
Every 1,000th append: verify full chain (all archive seals)
Every WP restart:     verify full chain
Every rotation:       verify full chain before archiving
On user request:      verify full chain immediately
```

This catches tampering quickly (within 100 entries) without
constant overhead.

---

## What If an Archive Is Too Big for Context?

LLMs have context window limits. A 10,000-entry archive may be too large to load.

**For verification:** WP only needs the first and last entries of each archive
(genesis entry + rotation entry). It never needs to load the full file.
Verification reads these two entries only.

**For investigation:** If a human needs to search a large archive,
they work with it outside Claude (text editor, grep, etc).
WP does not attempt to summarize or compact archives.

**Compaction (optional, user-triggered only):**
If the user decides an archive is too large, they may manually compact it
to a summary. If they do, they must:
1. Preserve the original archive (rename, don't delete)
2. Create a compacted version with a `WP_COMPACTION` marker
3. Update the chain reference in the next file to point to the compacted version

WP will flag any chain reference pointing to a compacted file as
`WP_CHAIN_COMPACTED` (info) — not an integrity failure, just a note
that the full detail is in the original.

---

## Known Limits

**Rotation is not atomic.**
Between step 2 (writing final entry) and step 4 (creating new file),
there is a brief moment where the active file is missing.
If WP crashes in this window, both files may be incomplete.

Recovery: on restart, WP checks for the presence of both the new
active file and the most recent archive. If the active file is missing
but the archive exists, WP creates a fresh active file with a recovery marker.

**Hash chain proves integrity, not authenticity.**
The chain proves files weren't modified after writing.
It does not prove WP wrote correct information in the first place.
A malfunctioning WP that writes wrong data will have a valid hash chain
of wrong data. The chain is tamper-evidence, not truth-guarantee.
