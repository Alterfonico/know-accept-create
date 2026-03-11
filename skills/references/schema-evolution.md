# Schema Evolution
# references/schema-evolution.md
# Priority: P2 — System runs with reasonable defaults without this

---

## What Is This?

The signal format (the shape of each JSON entry) will change over time.
New fields get added. Old fields get renamed. Bugs get fixed.

The problem: `kw-meta-audit.md` is append-only and never rewritten.
It will contain entries from v0.5.0, v0.6.0, v1.0.0, all mixed together.
WP needs to read all of them correctly.

This file defines how WP handles signals from different versions.

---

## Every Signal Has a Version

```json
{
  "source": "witness_prime",
  "type": "KW_VALIDATOR_DRIFT",
  "schema_version": "0.5.0",
  ...
}
```

`schema_version` is required in every signal.
A signal without it is treated as version `"0.1.0"` (earliest known format).

---

## Three Types of Changes

### Type 1 — Additive (Safe)
New fields added. Old fields unchanged.

```
v0.5.0: { "type", "severity", "confidence" }
v0.6.0: { "type", "severity", "confidence", "pipeline_context" }  ← new field
```

WP reading a v0.6.0 entry with v0.5.0 logic: ignores `pipeline_context`. Fine.
WP reading a v0.5.0 entry with v0.6.0 logic: `pipeline_context` is absent. Fine.

No migration needed. Both versions coexist safely.

### Type 2 — Renaming (Needs Mapping)
A field is renamed. Old name no longer appears.

```
v0.5.0: { "kw_flag_ref": "open-issues.md#entry-47" }
v0.6.0: { "flag_reference": "open-issues.md#entry-47" }  ← renamed
```

WP maintains a version map:

```json
{
  "0.5.0": { "kw_flag_ref": "flag_reference" },
  "0.6.0": {}
}
```

When reading a v0.5.0 entry, WP translates `kw_flag_ref` → `flag_reference`
before processing. The stored entry is never modified.

### Type 3 — Breaking (Requires New Archive)
A field is removed, or its meaning changes fundamentally.

Breaking changes require a new archive file. The old archive is sealed
before the breaking change takes effect. The new archive starts fresh
with the new schema. The chain continues, but the version boundary
is clearly marked in the rotation entry:

```json
{
  "type": "WP_ROTATION",
  "reason": "breaking_schema_change",
  "prior_schema_version": "0.5.0",
  "new_schema_version": "1.0.0",
  ...
}
```

---

## Version Compatibility Table

WP maintains this table internally. Update with each release.

| Reading version | Can read | Cannot read |
|---|---|---|
| 0.5.0 | 0.1.0 – 0.5.0 | 0.6.0+ |
| 0.6.0 | 0.1.0 – 0.6.0 | 1.0.0+ (if breaking) |

A WP version always reads its own version and all prior versions.
It never reads future versions — unknown fields are logged as
`WP_UNKNOWN_FIELD` (info) and ignored, not treated as errors.

---

## Adding a New Flag Type

When a new flag type is added to the system:

1. Add it to `references/signal-types.md` with full definition
2. Add it to the escalation matrix in `references/escalation-matrix.md`
3. Bump `schema_version` in `SKILL.md` (minor version: 0.5.0 → 0.5.1)
4. Add default signal quality seeds for the new type in `kw-calibration.json`
5. Add a canary type if the new flag type is detectable via injection

No migration needed for additive changes.

---

## Known Limits

**Version mapping is maintained manually.**
There is no automatic detection of schema differences.
If a developer adds a field without updating the version map,
old-version readers will silently ignore the new field.
This is acceptable for additive changes, problematic for renames.

**Breaking changes are rare but disruptive.**
A breaking change requires a coordinated archive rotation.
In practice, design for additive changes wherever possible.
Treat breaking changes as a last resort.
