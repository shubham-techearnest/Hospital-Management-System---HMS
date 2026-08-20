# Product Glossary

| Document ID | PROD-GLOSS-001 |
| Status | DRAFT |

| Term | Definition |
|------|------------|
| UHID | Unique Health ID — tenant-scoped patient identifier (DEC-001) |
| MRN | Medical Record Number — may equal UHID or hospital-local registration number |
| PatientVisit | **Concept only** — implemented as `clinical.encounters` |
| Encounter | Clinical episode hub linking OPD/IPD/diagnostics/billing |
| Queue token | `opd.queue_entries.token_display` |
| Reception registration | Hospital desk creation/link of patient profile |
| Duplicate candidate | Existing profile matching registration input above threshold |
| Stub user | IAM user without login for desk-only patients (DEC-004 option A) |
| Clinical vitals | Vitals tied to encounter (`clinical.vital_signs`) |
| Consumer vitals | Wellness vitals in patient app (`patient.vital_sign_records`) |
| E-prescription | Signed medication order on encounter; not pharmacy stock |
| MAR | Medication Administration Record (nursing) |
| LAMA / DAMA | Leave/Discharge Against Medical Advice |
| MLC | Medico-Legal Case |
| TPA | Third Party Administrator (insurance) |
| Flyway V42+ | Forward-only migrations after billing V41 |
