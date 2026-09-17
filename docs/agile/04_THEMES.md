# 04 — Themes (Phase D Draft)

| Attribute | Value |
|-----------|-------|
| **Document ID** | AGILE-THM-001 |
| **Status** | DRAFT — Phase D (code-structure skeleton) |
| **Last Updated** | 2026-09-17 |
| **Evidence basis** | Backend packages, 12 IAM roles, web portals, Flyway V1–V104 |
| **Rule** | Themes reflect **implemented product shape**, not ideal HIS vision |

**Related:** [05_EPICS.md](./05_EPICS.md) · [06_FEATURE_GROUPS.md](./06_FEATURE_GROUPS.md) · [07_FEATURE_CATALOG.md](./07_FEATURE_CATALOG.md)

---

## Themes (THM-001…)

### THM-001 — Platform Identity, Tenancy & Trust

| Field | Value |
|-------|-------|
| **Goal** | Authenticate users, enforce RBAC across 12 roles, and isolate hospital tenants on a shared platform. |
| **Evidence** | `iam` package; V1/V2/V77; `AuthController`, MFA; role portals via `RoleRoute` |
| **Epics** | EPIC-IAM-001 · EPIC-IAM-002 · EPIC-PLT-001 |

---

### THM-002 — Consumer Health & Care Discovery

| Field | Value |
|-------|-------|
| **Goal** | Let patients discover providers, manage personal health context, and request ambulatory care. |
| **Evidence** | `patient`, `search`, `location`, `scheduling`, `review`; `/patient/*`; public profiles |
| **Epics** | EPIC-PUB-001 · EPIC-PAT-001 · EPIC-SEA-001 · EPIC-SCH-001 · EPIC-DOC-001 |

---

### THM-003 — Hospital Clinical Operating System

| Field | Value |
|-------|-------|
| **Goal** | Run day-to-day clinical hospital workflows from front desk through OPD, IPD/ICU, diagnostics, theatre, and pharmacy. |
| **Evidence** | `hospital`, `opd`, `clinical`, `ipd`, `icu`, `laboratory`, `radiology`, `ot`, `pharmacy`, `emergency`/`adt`, nursing portals; V30–V91 |
| **Epics** | EPIC-HOS-001 · EPIC-RCV-001 · EPIC-OPD-001 · EPIC-CLN-001 · EPIC-IPD-001 · EPIC-ICU-001 · EPIC-NUR-001 · EPIC-ED-001 · EPIC-LAB-001 · EPIC-RAD-001 · EPIC-OT-001 · EPIC-PHA-001 |

---

### THM-004 — Revenue Cycle & Payer Operations

| Field | Value |
|-------|-------|
| **Goal** | Capture charges, invoice care episodes, collect payments, and process insurance/TPA paths. |
| **Evidence** | `billing`, `insurance`; V41, V73, V92–V93, V98; hospital billing + reception checkout |
| **Epics** | EPIC-BIL-001 · EPIC-BIL-002 · EPIC-INS-001 |

---

### THM-005 — Hospital Resources, Supply & Facility

| Field | Value |
|-------|-------|
| **Goal** | Manage consumables, procurement, clinical assets, facility work, and blood bank stock. |
| **Evidence** | `inventory`, `procurement`, `asset`, `facility`, `blood`; V88, V94–V99; hospital + asset portals |
| **Epics** | EPIC-INV-001 · EPIC-PRC-001 · EPIC-AST-001 · EPIC-FAC-001 · EPIC-BLD-001 |

---

### THM-006 — Workforce, Automation & Operational Intelligence

| Field | Value |
|-------|-------|
| **Goal** | Coordinate staff ops, event-driven work, approvals, hospital command visibility, and heuristic predictive signals. |
| **Evidence** | `staffops`, `automation`, `tasks`, `commandcenter`, `predictive`, `workflow`; V90, V100–V102; My Work surfaces |
| **Epics** | EPIC-STO-001 · EPIC-AUT-001 · EPIC-CC-001 · EPIC-PRED-001 |

---

### THM-007 — Platform Administration & SaaS Commercialization

| Field | Value |
|-------|-------|
| **Goal** | Operate the Health360 platform: users, hospitals, verifications, plans, partners, and subscription entitlements. |
| **Evidence** | `subscription`, `org`, admin controllers; V26–V28, V62, V70, V104; `/admin/*` |
| **Epics** | EPIC-ADM-001 · EPIC-SUB-001 · EPIC-ORG-001 |

---

### THM-008 — Omnichannel Delivery & Insights

| Field | Value |
|-------|-------|
| **Goal** | Deliver role portals on web/mobile and surface dashboards, analytics, and printable clinical documents. |
| **Evidence** | `frontend/health360-web` portals; `mobile/health360-mobile`; `dashboard`, `analytics`, `documents`; V17, V61, V68, V89 |
| **Epics** | EPIC-MOB-001 · EPIC-PLT-002 · EPIC-CLN-002 |

---

## Theme rollup

| ID | Name | Epic count |
|----|------|------------|
| THM-001 | Platform Identity, Tenancy & Trust | 3 |
| THM-002 | Consumer Health & Care Discovery | 5 |
| THM-003 | Hospital Clinical Operating System | 12 |
| THM-004 | Revenue Cycle & Payer Operations | 3 |
| THM-005 | Hospital Resources, Supply & Facility | 5 |
| THM-006 | Workforce, Automation & Operational Intelligence | 4 |
| THM-007 | Platform Administration & SaaS Commercialization | 3 |
| THM-008 | Omnichannel Delivery & Insights | 3 |
| | **Total** | **38** |

---

## Explicitly out of scope for this skeleton

Not evidenced as product packages/portals (do not invent epics): ambulance, home nursing, physiotherapy product, AI clinical CDS. Marketplace beyond `org` partners remains under EPIC-ORG-001 only.
