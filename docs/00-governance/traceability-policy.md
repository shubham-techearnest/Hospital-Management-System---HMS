# Traceability Policy

| Document ID | GOV-TRACE-001 |
| Status | DRAFT |

---

## Chain

```text
Business Requirement → Functional Requirement → User Story →
API → DB Migration → Web Route → Mobile Screen → Test Case → UAT → Release
```

---

## Rules

1. No orphan requirements
2. No implementation without approved requirement
3. Every merged PR references requirement ID(s) in description
4. Traceability matrix updated at feature closure

---

## Matrix location

[02-requirements/traceability-matrix.md](../02-requirements/traceability-matrix.md)

Feature-level rows added in `09-features/*/README.md` or feature trace section.
