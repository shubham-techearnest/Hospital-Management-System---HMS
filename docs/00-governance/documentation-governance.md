# Documentation Governance

| Document ID | GOV-DOC-001 |
| Status | DRAFT |
| Last Updated | 2026-08-20 |

---

## Principle

**No major feature: idea → code.**

Every feature follows the 26-step lifecycle defined in [HMS-PRODUCT-MASTER-PLAN.md](../HMS-PRODUCT-MASTER-PLAN.md).

---

## Document numbering (features)

For feature `{PHASE}-{ID}` (e.g. P1-F1):

| Suffix | Document |
|--------|----------|
| 01 | Business Requirement |
| 02 | User Stories |
| 03 | Functional Requirements |
| 04 | Business Workflow |
| 05 | UX Requirements |
| 06 | Architecture Design |
| 07 | Database Design |
| 08 | API Design |
| 09 | Security/RBAC |
| 10 | Audit & Compliance |
| 11 | Testing Strategy |
| 12 | Migration Plan |
| 13 | Release Plan |
| 14 | UAT Plan |

Path: `docs/09-features/{phase}/{FEATURE-ID}/P1-F1-{nn}-*.md`

---

## Status lifecycle

```text
DRAFT → INTERNAL REVIEW → ARCHITECT REVIEW → SENIOR REVIEW → APPROVED
  → IMPLEMENTATION → QA → UAT → RELEASED → CLOSED
```

Only **APPROVED** features enter Sprint implementation.

---

## Change control

If implementation discovers architecture/requirement change:

1. **STOP** implementation
2. Create Change Request (CR-xxx)
3. Impact analysis (DB, API, web, mobile, security)
4. Update docs + ADR if needed
5. Re-approval
6. Resume

See [change-control.md](./change-control.md).

---

## Traceability

Every requirement ID must trace to: User Story → API → DB → Web → Mobile → Test → UAT.

See [../02-requirements/traceability-matrix.md](../02-requirements/traceability-matrix.md).

---

## Legacy docs

| Folder | Role |
|--------|------|
| `docs/hms/` | As-built HMS-0…11 (preserve; do not delete) |
| `docs/phase-1/` | Historical Phase 1 (approved baseline) |
| `docs/post-hms/` | Transitional notes |

New governed docs supersede conflicting **future** plans only; as-built facts in `hms/` remain authoritative for implemented code.
