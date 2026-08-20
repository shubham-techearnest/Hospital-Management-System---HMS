# Audit Matrix (Master)

| Document ID | SEC-AUDIT-001 |
| Status | DRAFT |

---

## Audit event catalogue

| Event | Trigger | Fields | Retention |
|-------|---------|--------|-----------|
| REGISTRATION_CREATED | P1-F1 register | patient_id, uhid, hospital_id, actor | 7y |
| UHID_ASSIGNED | UHID generated | patient_id, uhid, sequence | 7y |
| DUPLICATE_CANDIDATES_SHOWN | Search/register match | candidates[], score | 7y |
| DUPLICATE_OVERRIDE | Continue new despite match | reason, supervisor_id | 7y |
| PATIENT_IDENTITY_UPDATED | Demographics change | old/new JSON diff | 7y |
| ENCOUNTER_CREATED | OPD/IPD/emergency | encounter_id, type | 7y |
| CLINICAL_NOTE_SIGNED | P2-F3 | note_id, version, signer | 7y |
| PRESCRIPTION_SIGNED | P2-F4 | rx_id, encounter_id | 7y |
| VITALS_RECORDED | P1-F2 | encounter_id, values | 7y |
| QUEUE_SKIP / RECALL | P2-F2 | queue_entry_id, reason | 3y |
| INVOICE_ISSUED | Billing | invoice_id, amount | 7y |
| PAYMENT_RECORDED | Payment | payment_id, idempotency_key | 7y |
| BED_MOVEMENT | P4-F4 | from_bed, to_bed | 7y |
| ADMISSION_APPROVED | IPD | admission_id | 7y |
| DISCHARGE_COMPLETED | IPD | admission_id | 7y |

---

## Implementation

- Extend existing audit infrastructure (partial as-built)
- Correlation ID per HTTP request
- Clinical/financial: append-only; no UPDATE on audit rows

---

## Compliance

- Who, what, when, where (hospital/branch), old value, new value, reason
- PHI access logging for patient search (P1-F1)

See P1-F1-10 for P1-F1 detail.
