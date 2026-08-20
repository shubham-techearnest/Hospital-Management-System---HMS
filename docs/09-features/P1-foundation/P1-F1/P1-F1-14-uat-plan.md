# P1-F1-14 — UAT Plan

| Feature | P1-F1 |
| Status | DRAFT |

---

## Participants

- 2 receptionists (pilot hospital)
- 1 hospital admin
- 1 QA facilitator

---

## Environment

Staging with Flyway V42; RECEPTIONIST test accounts assigned to pilot hospital

---

## Test scripts

| ID | Steps | Pass |
|----|-------|------|
| UAT-P1-F1-01 | Register new patient with unique mobile | UHID on receipt |
| UAT-P1-F1-02 | Search by UHID from 01 | Patient found |
| UAT-P1-F1-03 | Search by mobile partial | Correct match |
| UAT-P1-F1-04 | Attempt duplicate mobile register | Blocked; candidates shown |
| UAT-P1-F1-05 | Open existing from duplicate | No new record |
| UAT-P1-F1-06 | Admin continue-new with reason | New UHID; audit visible |
| UAT-P1-F1-07 | Login as PATIENT; open /reception | Access denied |
| UAT-P1-F1-08 | Register 5 patients sequentially | Unique UHIDs |

---

## Defect severity

- Critical: duplicate UHID, wrong patient linked, scope leak
- Major: receipt missing UHID, search fails
- Minor: UI cosmetic

---

## Evidence

Signed checklist PDF; screenshot of receipt; audit log export sample

---

## Exit criteria

All critical/major passed; PO sign-off on P1-F1 feature board → IN UAT → RELEASED
