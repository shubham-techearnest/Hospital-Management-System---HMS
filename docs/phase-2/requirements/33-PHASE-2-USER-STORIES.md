# DOC-33: Health360 AI — Phase 2 User Stories & Acceptance Criteria

| Attribute | Value |
|-----------|-------|
| **Document ID** | DOC-33 |
| **Title** | Phase 2 User Stories & Acceptance Criteria |
| **Version** | 1.0 |
| **Status** | **Draft** |
| **Date** | 2026-08-03 |
| **References** | [DOC-23](./23-PHASE-2-FUNCTIONAL-REQUIREMENTS.md), [DOC-14](../../phase-1/requirements/14-USER-STORIES-AND-ACCEPTANCE-CRITERIA.md) |

---

## 1. Summary

| Priority | Stories | Points (est.) |
|----------|---------|---------------|
| P0 | 42 | ~210 |
| P1 | 18 | ~72 |
| P2 | 6 | ~24 |
| **Total** | **66** | **~306** |

At 25 pts/sprint → **~12–14 sprints** for full Phase 2.

---

## 2. E-Prescription Stories

| ID | Story | Pts | Priority |
|----|-------|-----|----------|
| US2-RX-001 | Doctor creates prescription after completed visit | 8 | P0 |
| US2-RX-002 | Patient views prescription list and PDF | 5 | P0 |
| US2-RX-003 | Prescription QR public verification | 3 | P0 |
| US2-RX-004 | Doctor amends prescription (new version) | 5 | P1 |
| US2-RX-005 | Notification on prescription issued | 3 | P0 |

**AC-US2-RX-001:** Given completed appointment, when doctor submits valid Rx, then status=ISSUED and patient notified within 60s.

---

## 3. Pharmacy Stories

| ID | Story | Pts | Priority |
|----|-------|-----|----------|
| US2-PHR-001 | Pharmacy admin registers and gets verified | 5 | P0 |
| US2-PHR-002 | Pharmacist manages medicine catalog | 5 | P0 |
| US2-PHR-003 | Patient orders medicines from prescription | 8 | P0 |
| US2-PHR-004 | Pharmacist updates order fulfillment status | 5 | P0 |
| US2-PHR-005 | Patient tracks order delivery | 3 | P1 |

---

## 4. Laboratory Stories

| ID | Story | Pts | Priority |
|----|-------|-----|----------|
| US2-LAB-001 | Lab registers and publishes test catalog | 5 | P0 |
| US2-LAB-002 | Doctor orders tests for patient | 5 | P0 |
| US2-LAB-003 | Patient schedules sample collection | 5 | P0 |
| US2-LAB-004 | Lab uploads and releases results | 8 | P0 |
| US2-LAB-005 | Results appear in patient timeline | 5 | P0 |

---

## 5. Payment Stories

| ID | Story | Pts | Priority |
|----|-------|-----|----------|
| US2-PAY-001 | Patient pays consultation fee online | 8 | P0 |
| US2-PAY-002 | Patient pays pharmacy order | 8 | P0 |
| US2-PAY-003 | Patient pays lab order | 5 | P0 |
| US2-PAY-004 | Download GST invoice/receipt | 3 | P0 |
| US2-PAY-005 | Admin processes refund | 5 | P0 |
| US2-PAY-006 | Finance export reconciliation report | 5 | P1 |

---

## 6. Telemedicine Stories

| ID | Story | Pts | Priority |
|----|-------|-----|----------|
| US2-TEL-001 | Book TELE appointment type | 5 | P0 |
| US2-TEL-002 | Accept telehealth consent | 3 | P0 |
| US2-TEL-003 | Join video call from appointment | 8 | P0 |
| US2-TEL-004 | Doctor ends session and completes visit | 3 | P0 |

---

## 7. Insurance & Clinical (P1)

| ID | Story | Pts | Priority |
|----|-------|-----|----------|
| US2-INS-001 | Patient saves insurance policy | 3 | P1 |
| US2-EMR-001 | Doctor writes visit summary | 5 | P1 |
| US2-EMR-002 | Patient reads visit summary | 3 | P1 |

---

## 8. AI Assistant (P2)

| ID | Story | Pts | Priority |
|----|-------|-----|----------|
| US2-AI-001 | Patient asks platform FAQ via chat | 8 | P2 |
| US2-AI-002 | System blocks clinical advice requests | 3 | P0 |

---

*End of DOC-33 — Phase 2 User Stories v1.0*
