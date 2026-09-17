# 19 — Definition of Ready (DoR)

| Attribute | Value |
|-----------|-------|
| **Document ID** | AGILE-DOR-001 |
| **Status** | ACTIVE DRAFT |
| **Last Updated** | 2026-09-17 |

A backlog item is **Ready** for a sprint only when all applicable checks pass.

---

## Checklist

| # | Criterion | Notes |
|---|-----------|-------|
| 1 | **Clear actor** | Role from [03_ACTORS_AND_ROLES.md](./03_ACTORS_AND_ROLES.md) or explicit system actor |
| 2 | **User / business value** | “So that …” stated |
| 3 | **Scope bounded** | In/out of scope listed; not a whole module |
| 4 | **Acceptance criteria** | Given/When/Then; CURRENT vs FUTURE labeled |
| 5 | **Status known** | IMPLEMENTED / PARTIAL / PLANNED / BUG / TECH / GAP — not UNKNOWN if claiming sprint delivery |
| 6 | **Dependencies listed** | See [14_DEPENDENCIES.md](./14_DEPENDENCIES.md) |
| 7 | **Evidence or design refs** | For changes: files/APIs/migrations touched or spike outcome |
| 8 | **API / RBAC impact** | Endpoints and `@PreAuthorize` / permissions noted when relevant |
| 9 | **Data / Flyway impact** | Schema change yes/no; migration ownership |
| 10 | **Testable outcome** | QA can derive cases from AC |
| 11 | **Size** | ≤ ~13 Fibonacci points or split |
| 12 | **Priority** | P0–P3 with rationale |
| 13 | **Target release** | Named release from [17_RELEASE_PLAN.md](./17_RELEASE_PLAN.md) |
| 14 | **No fake baseline rewrite** | Existing behavior stories are documentation, not sprint “build from zero” unless fixing gaps |

---

## Not Ready examples

- Feature still `UNKNOWN` with no Phase B/C evidence.
- “Fix billing” without charge attach vs POST policy decision.
- Vision modules (ambulance/AI) without PO charter into REL-FUTURE.

---

## Ready for audit/documentation items

Documentation-only stories (baseline capture) are Ready when evidence links exist; they do **not** require sprint assignment.
