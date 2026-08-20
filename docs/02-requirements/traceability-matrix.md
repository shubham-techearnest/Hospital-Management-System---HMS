# Traceability Matrix (Master)

| Document ID | REQ-TRACE-001 |
| Status | DRAFT |

Sample rows — expand per feature at implementation.

| BR / REQ | User Story | API | DB | Web | Mobile | Test | UAT | Release |
|----------|------------|-----|-----|-----|--------|------|-----|---------|
| PAT-REQ-001 | US-PAT-002 | POST /hospital/patients/register | V42 uhid | /reception/patients/new | — | BillingIntegrationTest pattern | UAT-PAT-01 | R1 |
| PAT-REQ-002 | US-PAT-001 | GET /hospital/patients/search | V42 index | /reception/patients/search | — | PatientRegistryIT | UAT-PAT-02 | R1 |
| PAT-REQ-003 | US-PAT-003 | POST register → 409 candidates | — | duplicate dialog | — | DuplicateDetectionIT | UAT-PAT-03 | R1 |
| OPD-REQ-001 | US-OPD-001 | POST /appointments/{id}/arrive | V44 status? | reception | — | TBD | UAT-OPD-01 | R2 |
| BILL-REQ-001 | — | GET/POST /billing/invoices | V41 | /billing (new) | — | BillingIntegrationTest | UAT-BILL-01 | R2 |

**Rule:** No implementation without a row; no row without requirement ID.
