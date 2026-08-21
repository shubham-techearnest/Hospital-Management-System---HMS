# P1-F2-03 — Functional Requirements

| Feature | P1-F2 |
| Status | APPROVED |

---

## Functional

| ID | Requirement |
|----|-------------|
| CLIN-VIT-01 | System shall store clinical vitals in `clinical.vital_signs` keyed by `encounter_id` |
| CLIN-VIT-02 | System shall require at least one vital value on create |
| CLIN-VIT-03 | System shall validate ranges (systolic 40–300, diastolic 20–200, HR 20–300, SpO2 50–100, temp 30–45°C, glucose 20–600) |
| CLIN-VIT-04 | System shall reject systolic ≤ diastolic when both provided |
| CLIN-VIT-05 | System shall return BP classification NORMAL / WARNING / CRITICAL when BP present |
| CLIN-VIT-06 | System shall list vitals for an encounter newest-first |
| CLIN-VIT-07 | System shall append only (no update/delete API in MVP) |
| CLIN-VIT-08 | System shall not modify `patient.vital_sign_records` |

---

## Non-functional

| ID | Requirement |
|----|-------------|
| NFR-P1-F2-01 | Record/list p95 &lt; 2s |
| NFR-P1-F2-02 | PHI access audited with encounter_id |
| NFR-P1-F2-03 | Prefer reduced-motion friendly UI (no required animation) |
