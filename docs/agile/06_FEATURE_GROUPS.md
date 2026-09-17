# 06 — Feature Groups (Phase D Draft)

| Attribute | Value |
|-----------|-------|
| **Document ID** | AGILE-FG-001 |
| **Status** | DRAFT — Phase D |
| **Last Updated** | 2026-09-17 |
| **Parent** | [05_EPICS.md](./05_EPICS.md) |

Convention: `FG-{DOMAIN}-{AREA}` (AREA = short mnemonic, 2–4 chars preferred where readable).

---

## Feature group catalog

| FG ID | Name | Epic | Theme |
|-------|------|------|-------|
| FG-IAM-AUTH | Authentication & MFA | EPIC-IAM-001 | THM-001 |
| FG-IAM-ACCT | Account lifecycle | EPIC-IAM-001 | THM-001 |
| FG-IAM-RBAC | Roles & permissions | EPIC-IAM-002 | THM-001 |
| FG-IAM-SCOPE | Hospital / tenant scope | EPIC-IAM-002 | THM-001 |
| FG-PLT-TEN | Multi-tenant foundation | EPIC-PLT-001 | THM-001 |
| FG-PLT-AUDIT | Platform audit & health | EPIC-PLT-001 | THM-001 |
| FG-PUB-LAND | Public marketing & profiles | EPIC-PUB-001 | THM-002 |
| FG-PUB-ONB | Access & demo onboarding | EPIC-PUB-001 | THM-002 |
| FG-PAT-PROF | Patient profile & consent | EPIC-PAT-001 | THM-002 |
| FG-PAT-HLTH | Vitals & health insights | EPIC-PAT-001 | THM-002 |
| FG-PAT-CARE | Patient care self-service | EPIC-PAT-001 | THM-002 |
| FG-SEA-DOC | Doctor search | EPIC-SEA-001 | THM-002 |
| FG-SEA-HOS | Hospital search | EPIC-SEA-001 | THM-002 |
| FG-SEA-LOC | Location services | EPIC-SEA-001 | THM-002 |
| FG-SCH-SLOT | Doctor schedule slots | EPIC-SCH-001 | THM-002 |
| FG-SCH-APPT | Appointment lifecycle | EPIC-SCH-001 | THM-002 |
| FG-DOC-PROF | Doctor profile & verification | EPIC-DOC-001 | THM-002 |
| FG-DOC-WORK | Doctor clinical work surfaces | EPIC-DOC-001 | THM-002 |
| FG-HOS-ORG | Hospital org structure | EPIC-HOS-001 | THM-003 |
| FG-HOS-STAFF | Hospital staff management | EPIC-HOS-001 | THM-003 |
| FG-HOS-CAT | Clinical catalogs | EPIC-HOS-001 | THM-003 |
| FG-RCV-REG | Patient registry (UHID) | EPIC-RCV-001 | THM-003 |
| FG-RCV-DESK | Reception OPD desk | EPIC-RCV-001 | THM-003 |
| FG-OPD-REQ | OPD care requests | EPIC-OPD-001 | THM-003 |
| FG-OPD-QUE | OPD queue operations | EPIC-OPD-001 | THM-003 |
| FG-OPD-ENC | OPD encounters | EPIC-OPD-001 | THM-003 |
| FG-CLN-NOTE | Encounter documentation | EPIC-CLN-001 | THM-003 |
| FG-CLN-ORD | Clinical orders | EPIC-CLN-001 | THM-003 |
| FG-CLN-RX | Prescriptions | EPIC-CLN-001 | THM-003 |
| FG-IPD-ADM | IPD admission requests | EPIC-IPD-001 | THM-003 |
| FG-IPD-BED | Bed & ward management | EPIC-IPD-001 | THM-003 |
| FG-IPD-CARE | IPD meds & diagnostics | EPIC-IPD-001 | THM-003 |
| FG-IPD-DC | Discharge & post-discharge | EPIC-IPD-001 | THM-003 |
| FG-ICU-STAY | ICU stay management | EPIC-ICU-001 | THM-003 |
| FG-ICU-NUR | ICU nurse portal | EPIC-ICU-001 | THM-003 |
| FG-NUR-WRD | Ward nursing board | EPIC-NUR-001 | THM-003 |
| FG-NUR-MAR | Medication administration | EPIC-NUR-001 | THM-003 |
| FG-ED-BRD | Emergency department board | EPIC-ED-001 | THM-003 |
| FG-ED-ADT | ADT movements | EPIC-ED-001 | THM-003 |
| FG-LAB-CAT | Lab catalog | EPIC-LAB-001 | THM-003 |
| FG-LAB-WRK | Lab worklist & orders | EPIC-LAB-001 | THM-003 |
| FG-RAD-CAT | Radiology catalog | EPIC-RAD-001 | THM-003 |
| FG-RAD-WRK | Imaging worklist & orders | EPIC-RAD-001 | THM-003 |
| FG-OT-CAT | OT catalog | EPIC-OT-001 | THM-003 |
| FG-OT-PROC | OT procedures & charts | EPIC-OT-001 | THM-003 |
| FG-PHA-CAT | Pharmacy catalog | EPIC-PHA-001 | THM-003 |
| FG-PHA-WRK | Pharmacy dispense worklist | EPIC-PHA-001 | THM-003 |
| FG-PHA-REQ | Pharmacy requests | EPIC-PHA-001 | THM-003 |
| FG-BIL-INV | Invoices | EPIC-BIL-001 | THM-004 |
| FG-BIL-PAY | Payments | EPIC-BIL-001 | THM-004 |
| FG-BIL-CHG | Charge engine | EPIC-BIL-002 | THM-004 |
| FG-BIL-XCP | Charge exceptions | EPIC-BIL-002 | THM-004 |
| FG-INS-TPA | Insurance / TPA | EPIC-INS-001 | THM-004 |
| FG-INV-STK | Consumable stock | EPIC-INV-001 | THM-005 |
| FG-PRC-PO | Procurement cycle | EPIC-PRC-001 | THM-005 |
| FG-AST-REG | Asset register | EPIC-AST-001 | THM-005 |
| FG-AST-PRT | Asset manager portal | EPIC-AST-001 | THM-005 |
| FG-FAC-WO | Facility work orders | EPIC-FAC-001 | THM-005 |
| FG-BLD-BNK | Blood bank ops | EPIC-BLD-001 | THM-005 |
| FG-STO-ROST | Staff roster & leave | EPIC-STO-001 | THM-006 |
| FG-AUT-EVT | Automation events | EPIC-AUT-001 | THM-006 |
| FG-AUT-TASK | Task / My Work queues | EPIC-AUT-001 | THM-006 |
| FG-AUT-APPR | Approvals | EPIC-AUT-001 | THM-006 |
| FG-CC-OPS | Command center ops | EPIC-CC-001 | THM-006 |
| FG-PRED-INS | Predictive insights | EPIC-PRED-001 | THM-006 |
| FG-ADM-USR | Admin user management | EPIC-ADM-001 | THM-007 |
| FG-ADM-HOS | Admin hospital management | EPIC-ADM-001 | THM-007 |
| FG-ADM-VFY | Doctor verification queue | EPIC-ADM-001 | THM-007 |
| FG-ADM-REV | Review moderation | EPIC-ADM-001 | THM-007 |
| FG-SUB-PLAN | Subscription plans | EPIC-SUB-001 | THM-007 |
| FG-SUB-ENT | Feature entitlements | EPIC-SUB-001 | THM-007 |
| FG-ORG-PTR | Partner organizations | EPIC-ORG-001 | THM-007 |
| FG-MOB-CON | Consumer mobile | EPIC-MOB-001 | THM-008 |
| FG-MOB-STF | Staff mobile shells | EPIC-MOB-001 | THM-008 |
| FG-PLT-DSH | Role dashboards | EPIC-PLT-002 | THM-008 |
| FG-PLT-ANL | Analytics & metrics | EPIC-PLT-002 | THM-008 |
| FG-CLN-DOC | Clinical document print | EPIC-CLN-002 | THM-008 |

**Total feature groups:** 76
