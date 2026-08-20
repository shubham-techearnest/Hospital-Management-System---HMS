# P1-F1 — UHID + Hospital Patient Registration + Duplicate Detection

| Feature ID | P1-F1 |
| Epic | EPIC-02 Patient Registry |
| Sprint | 1 |
| Release | R1 |
| **Approval Status** | **APPROVED — IMPLEMENTED** |
| Approved | 2026-08-20 |

---

## Implementation summary

| Layer | Status |
|-------|--------|
| V42 migration | Implemented |
| Backend APIs | `/api/v1/hospital/patients/*` |
| Web reception | Search, register, duplicate dialog, receipt |
| Integration test | `HospitalPatientRegistryIntegrationTest` |
| Mobile | Deferred (Sprint 1 scope) |

---

## Approved decisions (2026-08-20)

| Decision | Resolution |
|----------|------------|
| DEC-001 | Tenant-global UHID (`H360-{year}-{seq}`) |
| DEC-002 | Block on exact mobile OR name+DOB match |
| DEC-004 | Stub IAM user (DEACTIVATED, internal email) |
| DEC-003 | ILIKE/JPA name search for MVP |
| DEC-005 | No registration SMS (default off) |

---

## Package index

| Doc | Title | Status |
|-----|-------|--------|
| [P1-F1-01](./P1-F1-01-business-requirement.md) | Business Requirement | APPROVED |
| [P1-F1-02](./P1-F1-02-user-stories.md) | User Stories | APPROVED |
| [P1-F1-03](./P1-F1-03-functional-requirements.md) | Functional Requirements | APPROVED |
| [P1-F1-04](./P1-F1-04-business-workflow.md) | Business Workflow | APPROVED |
| [P1-F1-05](./P1-F1-05-ux-requirements.md) | UX Requirements | APPROVED |
| [P1-F1-06](./P1-F1-06-architecture-design.md) | Architecture Design | APPROVED |
| [P1-F1-07](./P1-F1-07-database-design.md) | Database Design (V42) | IMPLEMENTED |
| [P1-F1-08](./P1-F1-08-api-design.md) | API Design | IMPLEMENTED |
| [P1-F1-09](./P1-F1-09-security-rbac.md) | Security / RBAC | IMPLEMENTED |
| [P1-F1-10](./P1-F1-10-audit-compliance.md) | Audit & Compliance | IMPLEMENTED |
| [P1-F1-11](./P1-F1-11-testing-strategy.md) | Testing Strategy | IMPLEMENTED |
| [P1-F1-12](./P1-F1-12-migration-plan.md) | Migration Plan | IMPLEMENTED |
| [P1-F1-13](./P1-F1-13-release-plan.md) | Release Plan | IN QA |
| [P1-F1-14](./P1-F1-14-uat-plan.md) | UAT Plan | Pending UAT |
