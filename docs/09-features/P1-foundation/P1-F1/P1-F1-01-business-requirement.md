# P1-F1-01 — Business Requirement

| Feature | P1-F1 |
| Status | DRAFT |

---

## Business problem

Hospitals cannot operate safely without a **unique patient identifier (UHID/MRN)** and **reception desk registration** that prevents duplicate records. Today Health360 has `patient.patient_profiles` for app users but lacks hospital-centric registration, universal search, duplicate detection, and printable registration receipts.

---

## Real-life scenario

A patient arrives at reception. Staff ask if they have visited before. If yes, they search by UHID or mobile. If no, staff register demographics and the hospital issues a UHID printed on a receipt. If the system detects a likely duplicate, staff must confirm before creating a second record.

---

## Business goal

Enable **safe, auditable patient identity** at the hospital front desk as the foundation for encounters, billing, and clinical workflows.

---

## Scope

- UHID generation (format TBD per DEC-001)
- Hospital desk registration (web reception portal)
- Universal patient search (UHID, mobile, name+DOB)
- Duplicate candidate detection and resolution
- Registration receipt (view/print)
- RBAC for RECEPTIONIST
- Audit of registration and duplicate overrides
- Flyway V42

## Out of scope

- Mobile reception app (deferred)
- Emergency temp registration (P1-F4 / DEC-006)
- Patient self-registration changes (preserve existing APIs)
- Merge duplicate records post-hoc (future)

---

## Actors

Receptionist, Hospital Admin, Patient (passive)

---

## Success metrics

- Zero duplicate registrations for exact mobile match (post go-live)
- Registration & search < 2s p95
- 100% registrations have UHID

---

## Dependencies

- Staff role RECEPTIONIST (V39 — exists)
- HospitalScopeService (exists)
- DEC-001, DEC-002, DEC-004 resolved

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | | | |
| Architect | | | |
