# Traceability Matrix (Seed)

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-TRC-001 |
| **Version** | 1.0 |
| **Status** | DRAFT |

| Requirement | Story | Era / Sprint label | Web | Backend | DB | Test | Release |
|-------------|-------|--------------------|-----|---------|----|------|---------|
| REQ-IAM-001 | US-IAM-001 | ERA-P1 | auth pages | AuthController | iam V1+ | IAM ITs | 0.1.0-SNAPSHOT |
| REQ-IAM-002 | US-IAM-002 | ERA-P1 | RoleRoute | @PreAuthorize | V2 | HmsRbac IT | same |
| REQ-OPD-001 | US-OPD-001/002 | ERA-HMS-R1 | OPD portals | OpdController | opd V31+ | OPD tests / Playwright | same |
| REQ-IPD-001 | US-IPD-001 | ERA-HMS-R1/V2 | IPD pages | IpdController | ipd | IPD ITs | same |
| REQ-ED-001 | US-ED-001 | ERA-HMS-V2 | ED page | Emergency/Adt | V91 | UNKNOWN | same |
| REQ-BIL-001 | US-BIL-001 | ERA-POST | billing pages | BillingController | V41+ | billing tests | same |
| REQ-CHG-001 | US-CHG-001 | ERA-HMS-V2 | charge exceptions | ChargeController | V92/V103 | smoke docs | same |
| REQ-AUT-001 | US-AUT-001 | ERA-HMS-V2 | My Work | Task/Approval | V90 | PARTIAL | same |
| REQ-CC-001 | US-CC-001 | ERA-HMS-V2 | dashboard | Command/Predictive | V101–102 | smoke | same |
| REQ-MOB-001 | US-MOB-001/002 | continuous | — | same APIs | — | UNKNOWN | mobile 0.1.0 |

## Missing links

- Many REQ/Story pairs lack automated tests (marked UNKNOWN)
- No single Release version beyond artifact `0.1.0-SNAPSHOT`
- Historical DOC-03 FRs not fully remapped — tracked as documentation debt
