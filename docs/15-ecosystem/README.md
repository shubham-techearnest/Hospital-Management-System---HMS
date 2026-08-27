# Complete Digital Healthcare Ecosystem — Documentation Index

| Attribute | Value |
|-----------|-------|
| **Document ID** | ECO-INDEX-001 |
| **Status** | **APPROVED — ECO-P3–P4 RELEASED; ECO-P5 IN QA** |
| **Created** | 2026-08-25 |
| **Approved** | 2026-08-25 (proceed) |
| **Mode** | Inspect → Gap analysis → Plan → Stories → Approve → **Step-by-step build** |

---

## Start here

| Audience | Read first |
|----------|------------|
| Product / BA | [ECOSYSTEM-MASTER-STORY.md](./ECOSYSTEM-MASTER-STORY.md) |
| Architects / Tech leads | [ECOSYSTEM-GAP-ANALYSIS.md](./ECOSYSTEM-GAP-ANALYSIS.md) |
| Delivery / PM | [ECOSYSTEM-IMPLEMENTATION-PLAN.md](./ECOSYSTEM-IMPLEMENTATION-PLAN.md) |
| BA / QA | [ECOSYSTEM-USER-STORIES.md](./ECOSYSTEM-USER-STORIES.md) |
| Status vocabulary | [ECOSYSTEM-STATUS-MAP.md](./ECOSYSTEM-STATUS-MAP.md) |
| Next human action | [../NEXT-ACTION.md](../NEXT-ACTION.md) |

---

## Package contents

| Doc | Purpose |
|-----|---------|
| [ECOSYSTEM-MASTER-STORY.md](./ECOSYSTEM-MASTER-STORY.md) | Product vision, Rahul’s journey, architecture principles, Definition of Done |
| [ECOSYSTEM-GAP-ANALYSIS.md](./ECOSYSTEM-GAP-ANALYSIS.md) | Every capability marked EXISTS / PARTIAL / MISSING / NEEDS REFACTOR |
| [ECOSYSTEM-IMPLEMENTATION-PLAN.md](./ECOSYSTEM-IMPLEMENTATION-PLAN.md) | Phased delivery order, feature IDs, dependencies |
| [ECOSYSTEM-USER-STORIES.md](./ECOSYSTEM-USER-STORIES.md) | Role-based stories |
| [ECOSYSTEM-STATUS-MAP.md](./ECOSYSTEM-STATUS-MAP.md) | Vision status names ↔ Health360 enums |
| [ECOSYSTEM-DASHBOARD-AUDIT.md](./ECOSYSTEM-DASHBOARD-AUDIT.md) | Reuse / enhance / new decisions |

---

## Non-negotiable rules

1. **Patient hub** — extend `patient.patient_profiles`; User 1→1 Patient.
2. **Encounter hub** — `clinical.encounters` is the visit hub.
3. **Appointment ≠ Queue** — keep both.
4. **E-Rx ≠ Pharmacy MAR**.
5. **Flyway** — never edit V1–V60; next is **V61+**.
6. **Do not rebuild working OPD** — extend P2-F1…F10.

---

## Approval gate

| Checkpoint | Owner | Status |
|------------|-------|--------|
| Review master story + gap analysis | Product + Architect | **APPROVED** |
| Approve phase order (ECO-P0 → ECO-P7) | Senior management | **APPROVED** |
| Approve first implementation slice (ECO-P0) | Product | **APPROVED** |
| ECO-P0 delivery | Engineering | **IN QA** |
| ECO-P1 delivery | Engineering | **IN QA** |
| ECO-P2 delivery | Engineering | **IN QA** |
| ECO-P3 delivery | Engineering | **RELEASED** |
| ECO-P4 delivery | Engineering | **RELEASED** |
| ECO-P5 delivery | Engineering | **IN QA** |
| Next slice | ECO-P6 | **READY** |
