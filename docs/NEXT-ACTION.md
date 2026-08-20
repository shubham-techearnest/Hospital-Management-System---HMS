# Health360 HMS — NEXT ACTION

| Attribute | Value |
|-----------|-------|
| **Document ID** | HMS-NEXT-001 |
| **Status** | **ACTIVE** |
| **Last Updated** | 2026-08-20 |

---

## CURRENT STATUS

**P1-F1 IMPLEMENTATION COMPLETE — IN QA**

- Roadmap & P1-F1: **APPROVED** (2026-08-20)
- V42 migration: **IMPLEMENTED**
- Backend patient registry APIs: **IMPLEMENTED**
- Web reception (search/register/receipt): **IMPLEMENTED**
- Integration test: **ADDED** (requires Docker)

---

## IMMEDIATE NEXT ACTION

1. Run integration tests with Docker: `HospitalPatientRegistryIntegrationTest`
2. Execute UAT scripts ([P1-F1-14-uat-plan.md](./09-features/P1-foundation/P1-F1/P1-F1-14-uat-plan.md))
3. Sign off P1-F1 on [feature board](./13-project-management/feature-status-board.md) → IN UAT → RELEASED
4. Kick off **Sprint 2**: P1-F2 encounter-scoped clinical vitals (V43)

---

## Operating mode

| Mode | Status |
|------|--------|
| D — Approval | ✅ Complete |
| E — Implementation (P1-F1) | ✅ Complete |
| F — QA | ⏳ **NOW** |
| G — UAT | Next |
| H — Release (R1 partial) | After UAT |

---

## Approval record

| Item | Status | Date |
|------|--------|------|
| Roadmap & P1-F1 | **APPROVED** | 2026-08-20 |
| DEC-001 UHID scope | Tenant-global | 2026-08-20 |
| DEC-002 Duplicate threshold | Mobile exact / name+DOB | 2026-08-20 |
| DEC-004 Walk-in user | Stub IAM user | 2026-08-20 |
