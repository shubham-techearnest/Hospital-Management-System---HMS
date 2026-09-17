# Schema Catalog — CURRENT

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-SCH-001 |
| **Version** | 1.0 |
| **Status** | DRAFT |

| Schema | Purpose (CURRENT) | Introduced (approx) |
|--------|-------------------|---------------------|
| shared | Tenants, subscriptions, plans, sequences | V1 / V26 |
| iam | Users, roles, permissions, tokens, notifications | V1–V2 |
| patient | Patient profiles, related health inputs | V3 |
| doctor | Doctor profiles, verification | V6 |
| hospital | Hospitals, branches, staff, catalogs | V8 / V39 |
| scheduling | Appointments, slots | V11 |
| analytics | Health metrics | V17–V18 |
| location | Geo / travel | V20 |
| clinical | Encounters, diagnoses, Rx, documents links | V30+ |
| opd | Desks, queue | V31 |
| ipd | Wards, beds, admissions | V33+ |
| icu | ICU stays | V34 |
| laboratory | Lab orders/results | V35 |
| radiology | Imaging orders | V36 |
| ot | Procedures | V37 |
| pharmacy | Medication orders / requests / inventory bits | V38 / V58 / V74 |
| billing | Invoices, payments, charges | V41 / V92 |
| org | Partner orgs | V62 |
| asset | Assets / maintenance | V88 / V96 |
| automation | Events, outbox, approvals, predictive | V90 / V102 |
| tasks | Work items | V90 |
| workflow | Workflow definitions/instances | V90 |
| emergency | ED visits | V91 |
| inventory | Stock | V94 |
| procurement | PR/PO/GRN | V95 |
| facility | Facility work orders | V97 |
| insurance | Pre-auth / claims | V98 |
| blood | Blood units / requests | V99 |
| staffops | Roster / leave | V100 |

Table-level detail: prefer Flyway + entities over duplicating DDL here.
