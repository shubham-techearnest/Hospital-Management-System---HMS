# Product Roadmap — Health360 HMS Program

| Document ID | PROD-ROADMAP-001 |
| Status | DRAFT |
| Last Updated | 2026-08-20 |

---

## Executive summary

| Phase | Name | Sprints | Release | Business outcome |
|-------|------|---------|---------|------------------|
| 0 | Architecture stabilization | Sprint 0 | — | Governed baseline, no feature code |
| 1 | Patient foundation | 1–2 | **R1** | UHID, registration, duplicate safety, clinical vitals |
| 2 | OPD completion | 3–7 | **R2** | Full OPD desk-to-billing flow |
| 3 | Diagnostics & pharmacy | 8–10 | **R3** | Inventory-safe dispensing |
| 4 | IPD completion | 11–16 | **R4** | Admission-to-discharge |
| 5 | Financial & enterprise | 17–20 | **R5** | Payments, insurance, reports |
| 6 | Enterprise readiness | 21–23 | **R6** | Security, performance, UAT hardening |

*Sprint numbers are logical; calendar dates require capacity input.*

---

## Phase 0 — Architecture stabilization (Sprint 0)

**Objectives:** Documentation, ADRs, status alignment design, staff portal scope fix plan.

**Exit criteria:** Master plan approved; P1-F1 approved; decisions DEC-001/002 resolved.

**No major feature implementation.**

---

## Phase 1 — Patient foundation (Sprints 1–2)

| Feature | ID | Migration |
|---------|-----|-----------|
| UHID + hospital registration + duplicate detection | P1-F1 | V42 |
| Encounter-scoped clinical vitals | P1-F2 | V43 |
| Patient clinical timeline API | P1-F3 | — |

**Exit criteria:** Reception can search/register with UHID; duplicates flagged; vitals on encounter.

---

## Phase 2 — OPD completion (Sprints 3–7)

| Feature | ID |
|---------|-----|
| Appointment arrival + status alignment | P2-F1 |
| Queue skip/recall | P2-F2 |
| Structured consultation | P2-F3 |
| E-prescription + safety | P2-F4 |
| OPD billing UI | P2-F5 |

**Exit criteria:** Workflow 1 (Normal OPD) demonstrable end-to-end on web.

---

## Phase 3 — Diagnostics & pharmacy (Sprints 8–10)

Lab/radiology hardening, pharmacy inventory, dispensing, partial dispense, returns.

**Exit criteria:** Stock transactional; expired batch blocked.

---

## Phase 4 — IPD completion (Sprints 11–16)

Admission request/approval, bed movement, nursing, doctor rounds, MAR mobile, discharge clearance.

**Exit criteria:** Workflow 2 (OPD→IPD) demonstrable.

---

## Phase 5 — Financial & enterprise (Sprints 17–20)

Razorpay, insurance/TPA, operational reports, notification expansion.

---

## Phase 6 — Enterprise readiness (Sprints 21–23)

Security audit, performance, observability, production readiness, UAT sign-off.

---

## Dependency chain

```text
Phase 0 → Phase 1 (UHID) → Phase 2 (OPD) → Phase 3 (Pharm/Lab)
                              ↓
                         Phase 4 (IPD) → Phase 5 (Pay/Ins) → Phase 6
```

See [../13-project-management/dependency-map.md](../13-project-management/dependency-map.md).
