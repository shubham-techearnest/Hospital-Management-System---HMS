# DOC-52: Phase 1.5 — Business Requirements

| Attribute | Value |
|-----------|-------|
| **Document ID** | DOC-52 |
| **Version** | 1.0 |
| **Status** | Approved |
| **References** | [DOC-51](./51-PHASE-1.5-VISION-AND-SCOPE-CHARTER.md) |

---

## BR-1 Subscription ownership

| ID | Requirement |
|----|-------------|
| BR-1.1 | Every hospital SHALL have exactly one **active** subscription record at a time. |
| BR-1.2 | Subscriptions SHALL NOT be attached to doctors or patients. |
| BR-1.3 | Plan changes SHALL close the current subscription row and create a new active row (or update via defined lifecycle — currently cancel + new). |
| BR-1.4 | All subscription lifecycle events SHALL be recorded in append-only history. |

## BR-2 Plan catalog

| ID | Requirement |
|----|-------------|
| BR-2.1 | System SHALL ship seeded plans: FREE, STARTER, PROFESSIONAL, ENTERPRISE. |
| BR-2.2 | Each plan SHALL define numeric limits (doctors, patients, departments, branches, appointments/month). |
| BR-2.3 | Each plan SHALL define boolean feature flags (analytics, telemedicine, billing, API access, etc.). |
| BR-2.4 | Platform admin SHALL view and update plan metadata (name, description, price, status). |
| BR-2.5 | `MAX_STAFF` SHALL NOT be seeded until staff module exists. |

## BR-3 Provisioning policy

| ID | Requirement |
|----|-------------|
| BR-3.1 | Public self-registration SHALL be limited to **patients**. |
| BR-3.2 | Platform admin SHALL create hospitals including hospital admin user credentials. |
| BR-3.3 | Platform admin SHALL invite doctors to a hospital. |
| BR-3.4 | Invited doctors SHALL receive email credentials and complete profile after first login. |
| BR-3.5 | Hospital admin SHALL NOT create hospitals or invite/associate doctors (403). |
| BR-3.6 | Hospital admin MAY update hospital profile, branches, departments, facilities after provisioning. |

## BR-4 Limit enforcement

| ID | Requirement |
|----|-------------|
| BR-4.1 | Adding a doctor SHALL fail when active doctor count ≥ plan `MAX_DOCTORS`. |
| BR-4.2 | Limit violations SHALL return HTTP 409 with user-friendly message. |
| BR-4.3 | Future: branch, department, appointment limits enforced at respective create endpoints. |

## BR-5 Hospital-centric doctors

| ID | Requirement |
|----|-------------|
| BR-5.1 | Every doctor SHALL belong to at least one hospital via `hospital_associations`. |
| BR-5.2 | A solo clinic SHALL be a hospital of type CLINIC with one doctor on an appropriate plan. |
| BR-5.3 | There SHALL be no separate "Free Doctor" subscription product. |

## BR-6 Audit & compliance

| ID | Requirement |
|----|-------------|
| BR-6.1 | Subscription history SHALL never be deleted. |
| BR-6.2 | Hospital creation, plan changes, and doctor invites SHALL write audit log entries. |
| BR-6.3 | Platform admin SHALL view subscription history per hospital. |

## BR-7 Reporting (MVP)

| ID | Requirement |
|----|-------------|
| BR-7.1 | Hospital admin SHALL view current plan, usage metrics, and enabled features. |
| BR-7.2 | Platform admin SHALL list hospitals with plan summary and doctor count. |
