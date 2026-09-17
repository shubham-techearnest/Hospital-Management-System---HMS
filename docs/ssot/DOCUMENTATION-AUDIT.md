# Documentation Audit & Reset Record

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-DOC-AUDIT-001 |
| **Version** | 2.0 |
| **Status** | CURRENT |
| **Last Updated** | 2026-09-17 |

## Reset executed 2026-09-17

Obsolete documentation under `docs/` (outside `docs/ssot/`) was **physically deleted** after reconciliation into SSOT.

### Removed trees / files (examples)

`00-governance`, `01-product`…`16-marketing`, `09-features`, `hms`, `phase-1`, `phase-1.5`, `phase-2`, `post-hms`, `readiness`, `testing`, `mobile`, root md files (`NEXT-ACTION.md`, `HMS-PRODUCT-MASTER-PLAN.md`, `00-PROJECT-MEMORY.md`, …), and `docs/ssot/99-ARCHIVE/`.

### Preserved

- `docs/ssot/**` (canonical)
- Minimal `docs/README.md` pointer to SSOT
- All application source, migrations, tests, CI, docker, scripts

## Prior conflict themes (still tracked)

See [REQUIREMENT-CONFLICT-REGISTER.md](./REQUIREMENT-CONFLICT-REGISTER.md): stale approval gates, Phase-2 naming, mobile parity, charge DRY_RUN, CI branch names, notification templates.
