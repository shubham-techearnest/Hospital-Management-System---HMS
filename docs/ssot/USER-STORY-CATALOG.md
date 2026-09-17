# User Story Catalog (Canonical Seed)

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-US-001 |
| **Version** | 1.0 |
| **Status** | DRAFT |
| **Note** | Seed catalog — maps major epics; not every historical story file |

| Story ID | Epic | Feature | Requirement | Persona | User Story | Status |
|----------|------|---------|-------------|---------|------------|--------|
| US-IAM-001 | Identity | Auth | REQ-IAM-001 | All | As a user I can log in and receive tokens | COMPLETED |
| US-IAM-002 | Identity | RBAC | REQ-IAM-002 | Admin | As admin I assign roles that gate APIs | COMPLETED |
| US-OPD-001 | OPD | Queue | REQ-OPD-001 | Reception | As reception I register/walk-in and manage queue | COMPLETED |
| US-OPD-002 | OPD | Consult | REQ-OPD-001 | Doctor | As doctor I run encounter with notes/Rx | COMPLETED |
| US-IPD-001 | IPD | Admit | REQ-IPD-001 | Hospital staff | As staff I admit patient to a bed | COMPLETED |
| US-ED-001 | Emergency | Triage | REQ-ED-001 | ED staff | As ED staff I triage and disposition visits | COMPLETED |
| US-BIL-001 | Revenue | Invoice | REQ-BIL-001 | Reception | As reception I checkout and take payment | COMPLETED |
| US-CHG-001 | Revenue | Charges | REQ-CHG-001 | Finance | As finance I review charge exceptions | PARTIALLY_IMPLEMENTED |
| US-AUT-001 | Automation | My Work | REQ-AUT-001 | Nurse/Ops | As ops user I complete tasks from My Work | COMPLETED |
| US-CC-001 | Ops intel | Command Center | REQ-CC-001 | Hospital admin | As admin I view ops snapshot + predictive | COMPLETED |
| US-MOB-001 | Mobile | Patient | REQ-MOB-001 | Patient | As patient I manage OPD/payments on mobile | COMPLETED |
| US-MOB-002 | Mobile | Hospital ops | REQ-MOB-001 | Nurse | As nurse I run full ward ops on mobile | NOT_STARTED |

Acceptance criteria for many historical stories were deleted with legacy feature packs. Reconstruct from code + this catalog; do not invent.
