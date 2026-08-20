# Schema Map — Target State

| Document ID | DB-SCHEMA-001 |
| Status | DRAFT |

## Applied (V1–V41)

| Schema | Key tables |
|--------|------------|
| iam | users, roles, permissions |
| shared | tenants |
| hospital | hospitals, branches, departments, staff (V39) |
| patient | patient_profiles, vital_sign_records, … |
| scheduling | appointments |
| clinical | encounters, diagnoses, notes, orders |
| opd | desks, queue_entries |
| ipd | wards, rooms, beds, admissions |
| icu | units, beds, stays |
| laboratory | orders, samples, results |
| radiology | studies, reports |
| pharmacy | prescriptions (fulfillment), dispensings |
| ot | procedures |
| billing | invoices, line_items, payments (V41) |

## Planned additions (V42+)

| Schema | Table | Feature |
|--------|-------|---------|
| patient | hospital_registrations | P1-F1 |
| patient | uhid_sequences | P1-F1 |
| clinical | vital_signs | P1-F2 |
| clinical | prescriptions, prescription_items | P2-F4 |
| ipd | bed_movements | P4-F4 |
| pharmacy | medicine_batches, stock_transactions | P3 |

Full ER: extend [hms/HMS-DOMAIN-MODEL.md](../hms/HMS-DOMAIN-MODEL.md).
