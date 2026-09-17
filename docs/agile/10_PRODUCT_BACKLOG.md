# 10 — Product Backlog (Master)

| Attribute | Value |
|-----------|-------|
| **Document ID** | AGILE-BL-001 |
| **Status** | DRAFT — Phase E/G/H |
| **Last Updated** | 2026-09-17 |
| **Machine-readable** | [product-backlog.csv](./product-backlog.csv) · [product-backlog.json](./product-backlog.json) |
| **Baseline label** | `Baseline / Pre-Agile Existing Implementation` |
| **Points** | Fibonacci for future/gap/bug-fix work only |

---

## Priority rationale (brief)

| Priority | Meaning | Applied when |
|----------|---------|--------------|
| **P0** | Critical path / trust | Auth login, patient register, core OPD/IPD clinical path already baseline; keep healthy |
| **P1** | Blocks ops or security hardening | BUG-AUTH-001, BUG-BIL-001, BUG-API-001, charge attach completion |
| **P2** | Important incomplete / risk | BUG-AUTH-002, GAP-ONB-001, TECH-NTF-001, SEC-PAY-001, command center FE fix |
| **P3** | Vision / expansion | Ambulance, homecare, physio, AI CDS (vision-evidenced only) |

Capacity/velocity **UNKNOWN** — Proposed Sprint is advisory only.

---

## Master backlog table

| Backlog ID | Type | Theme | Epic | Feature | Title | Actor | Status | Priority | Points | Dependencies | Target Release | Proposed Sprint | Evidence |
|------------|------|-------|------|---------|-------|-------|--------|----------|--------|--------------|----------------|-----------------|----------|
| US-IAM-AUTH-001 | STORY | THM-001 | EPIC-IAM-001 | FEAT-IAM-AUTH-001 | Sign in with JWT session | All roles | IMPLEMENTED | P0 | — | — | REL-BASELINE | Baseline | Phase C #2 |
| US-IAM-AUTH-002 | STORY | THM-001 | EPIC-IAM-001 | FEAT-IAM-AUTH-003 | Complete MFA TOTP challenge | MFA user | IMPLEMENTED | P0 | — | US-IAM-AUTH-001 | REL-BASELINE | Baseline | Phase C #11 |
| US-IAM-ACCT-001 | STORY | THM-001 | EPIC-IAM-001 | FEAT-IAM-ACCT-001 | Patient self-register with UHID | PATIENT | IMPLEMENTED | P0 | — | — | REL-BASELINE | Baseline | Phase C #1 |
| US-IAM-RBAC-001 | STORY | THM-001 | EPIC-IAM-002 | FEAT-IAM-RBAC-001 | Twelve-role RBAC model | Platform | IMPLEMENTED | P0 | — | — | REL-BASELINE | Baseline | Overlay |
| US-IAM-RBAC-002 | STORY | THM-001 | EPIC-IAM-002 | FEAT-IAM-RBAC-003 | Post-login role portal routing | All roles | PARTIAL | P0 | — | US-IAM-AUTH-001 | REL-BASELINE | Baseline | Phase C + bugs |
| US-PUB-LAND-001 | STORY | THM-002 | EPIC-PUB-001 | FEAT-PUB-LAND-001 | Browse public landing pages | Public | IMPLEMENTED | P2 | — | — | REL-BASELINE | Baseline | Overlay MED |
| US-PUB-ONB-001 | STORY | THM-002 | EPIC-PUB-001 | FEAT-PUB-ONB-001 | Submit doctor access request | Public | IMPLEMENTED | P1 | — | — | REL-BASELINE | Baseline | Phase C #15 |
| US-PUB-ONB-002 | STORY | THM-002 | EPIC-PUB-001 | FEAT-PUB-ONB-002 | Submit hospital demo request | Public | IMPLEMENTED | P1 | — | — | REL-BASELINE | Baseline | Phase C #15 |
| US-ADM-VFY-001 | STORY | THM-007 | EPIC-ADM-001 | FEAT-ADM-VFY-001 | Review doctor verification | PLATFORM_ADMIN | IMPLEMENTED | P1 | — | US-DOC-PROF-002 | REL-BASELINE | Baseline | Phase C #9 |
| US-ADM-HOS-002 | STORY | THM-007 | EPIC-ADM-001 | FEAT-ADM-HOS-002 | Process onboarding queue | PLATFORM_ADMIN | PARTIAL | P1 | — | US-PUB-ONB-001/002 | REL-BASELINE | Baseline | Phase C #15 |
| US-HOS-STAFF-001 | STORY | THM-003 | EPIC-HOS-001 | FEAT-HOS-STAFF-001 | Invite hospital staff | HOSPITAL_ADMIN | IMPLEMENTED | P1 | — | — | REL-BASELINE | Baseline | Phase C #10 |
| US-DOC-PROF-002 | STORY | THM-002 | EPIC-DOC-001 | FEAT-DOC-PROF-002 | Submit doctor verification | DOCTOR | IMPLEMENTED | P1 | — | — | REL-BASELINE | Baseline | Phase C #9 |
| US-PAT-CARE-001 | STORY | THM-002 | EPIC-PAT-001 | FEAT-PAT-CARE-001 | Request OPD visit | PATIENT | IMPLEMENTED | P0 | — | US-IAM-ACCT-001 | REL-BASELINE | Baseline | Phase C #3 |
| US-OPD-REQ-001 | STORY | THM-003 | EPIC-OPD-001 | FEAT-OPD-REQ-001 | Capture patient OPD request | PATIENT | IMPLEMENTED | P0 | — | US-PAT-CARE-001 | REL-BASELINE | Baseline | Phase C #3 |
| US-RCV-REG-001 | STORY | THM-003 | EPIC-RCV-001 | FEAT-RCV-REG-001 | Search/register hospital patient | RECEPTIONIST | IMPLEMENTED | P0 | — | — | REL-BASELINE | Baseline | Phase C #4 |
| US-RCV-DESK-001 | STORY | THM-003 | EPIC-RCV-001 | FEAT-RCV-DESK-001 | Run reception OPD desk | RECEPTIONIST | IMPLEMENTED | P0 | — | US-RCV-REG-001 | REL-BASELINE | Baseline | Phase C #4 |
| US-RCV-DESK-002 | STORY | THM-003 | EPIC-RCV-001 | FEAT-RCV-DESK-002 | Complete reception checkout | RECEPTIONIST | IMPLEMENTED | P0 | — | US-DOC-WORK-001 | REL-BASELINE | Baseline | Phase C #8 |
| US-DOC-WORK-001 | STORY | THM-002 | EPIC-DOC-001 | FEAT-DOC-WORK-001 | Document OPD encounter | DOCTOR | IMPLEMENTED | P0 | — | US-OPD-REQ-001 | REL-BASELINE | Baseline | Phase C #5 |
| US-CLN-NOTE-001 | STORY | THM-003 | EPIC-CLN-001 | FEAT-CLN-NOTE-001 | Capture clinical notes | DOCTOR | IMPLEMENTED | P0 | — | US-DOC-WORK-001 | REL-BASELINE | Baseline | Phase C #5 |
| US-CLN-NOTE-002 | STORY | THM-003 | EPIC-CLN-001 | FEAT-CLN-NOTE-002 | Record encounter vitals | DOCTOR | IMPLEMENTED | P0 | — | US-DOC-WORK-001 | REL-BASELINE | Baseline | Phase C #5 |
| US-CLN-RX-001 | STORY | THM-003 | EPIC-CLN-001 | FEAT-CLN-RX-001 | Write prescriptions | DOCTOR | IMPLEMENTED | P0 | — | US-DOC-WORK-001 | REL-BASELINE | Baseline | Phase C #5 |
| US-CLN-ORD-001 | STORY | THM-003 | EPIC-CLN-001 | FEAT-CLN-ORD-001 | Place lab/imaging/med orders | DOCTOR | IMPLEMENTED | P0 | — | US-DOC-WORK-001 | REL-BASELINE | Baseline | Phase C #6 |
| US-LAB-WRK-001 | STORY | THM-003 | EPIC-LAB-001 | FEAT-LAB-WRK-001 | Fulfill lab orders | LAB | IMPLEMENTED | P1 | — | US-CLN-ORD-001 | REL-BASELINE | Baseline | Phase C #6 |
| US-DOC-WORK-002 | STORY | THM-002 | EPIC-DOC-001 | FEAT-DOC-WORK-002 | Recommend IPD admission | DOCTOR | IMPLEMENTED | P0 | — | — | REL-BASELINE | Baseline | Phase C #7 |
| US-IPD-ADM-001 | STORY | THM-003 | EPIC-IPD-001 | FEAT-IPD-ADM-001 | Admit patient and assign bed | HOSPITAL_ADMIN | IMPLEMENTED | P0 | — | US-DOC-WORK-002 | REL-BASELINE | Baseline | Phase C #7 |
| US-NUR-MAR-001 | STORY | THM-003 | EPIC-NUR-001 | FEAT-NUR-MAR-001 | Administer medications (MAR) | NURSE | IMPLEMENTED | P1 | — | US-IPD-ADM-001 | REL-BASELINE | Baseline | Phase C #13 |
| US-BIL-INV-001 | STORY | THM-004 | EPIC-BIL-001 | FEAT-BIL-INV-001 | View hospital invoices | HOSPITAL_ADMIN | IMPLEMENTED | P1 | — | — | REL-BASELINE | Baseline | Phase C #8 |
| US-BIL-PAY-001 | STORY | THM-004 | EPIC-BIL-002 | FEAT-BIL-PAY-001 | Collect encounter checkout payment | RECEPTIONIST | IMPLEMENTED | P0 | — | US-RCV-DESK-002 | REL-BASELINE | Baseline | Phase C #8 |
| US-BIL-PAY-002 | STORY | THM-004 | EPIC-BIL-002 | FEAT-BIL-PAY-002 | Pay via Razorpay intent | PATIENT | IMPLEMENTED | P1 | — | US-BIL-PAY-001 | REL-BASELINE | Baseline | Phase C #8 |
| US-BIL-CHG-001 | STORY | THM-004 | EPIC-BIL-001 | FEAT-BIL-CHG-001 | Capture charges (engine) | HOSPITAL_ADMIN | PARTIAL | P1 | — | — | REL-BASELINE | Baseline | Phase C #12 |
| US-BIL-CHG-002 | STORY | THM-004 | EPIC-BIL-001 | FEAT-BIL-CHG-002 | Link charges to invoice | HOSPITAL_ADMIN | PARTIAL | P1 | — | US-BIL-CHG-001 | REL-BASELINE | Baseline | Phase C #12 |
| US-BIL-XCP-001 | STORY | THM-004 | EPIC-BIL-001 | FEAT-BIL-XCP-001 | Handle charge exceptions | HOSPITAL_ADMIN | IMPLEMENTED | P2 | — | US-BIL-CHG-001 | REL-BASELINE | Baseline | Overlay |
| US-CC-OPS-001 | STORY | THM-006 | EPIC-CC-001 | FEAT-CC-OPS-001 | View hospital command center | HOSPITAL_ADMIN | PARTIAL | P2 | — | BUG-API-001 | REL-BASELINE | Baseline | Phase C #14 |
| US-PLT-AUDIT-002 | STORY | THM-001 | EPIC-PLT-001 | FEAT-PLT-AUDIT-002 | Probe platform health | Ops | IMPLEMENTED | P2 | — | — | REL-BASELINE | Baseline | Overlay |
| US-AUTH-FIX-001 | STORY | THM-001 | EPIC-IAM-002 | FEAT-IAM-RBAC-003 | Enforce PATIENT RoleRoute | PATIENT | PLANNED | P1 | 3 | BUG-AUTH-001 | REL-STABILIZATION | Sprint 01 | BUG-AUTH-001 |
| US-AUTH-FIX-002 | STORY | THM-001 | EPIC-IAM-002 | FEAT-IAM-RBAC-003 | Fix RoleRoute null-user bypass | All roles | PLANNED | P2 | 3 | BUG-AUTH-002 | REL-STABILIZATION | Sprint 01 | BUG-AUTH-002 |
| US-BIL-CHG-003 | STORY | THM-004 | EPIC-BIL-001 | FEAT-BIL-CHG-002 | Wire charge attach + POST invoice lines | HOSPITAL_ADMIN | PLANNED | P1 | 8 | BUG-BIL-001 | REL-CORE-WF | Sprint 02 | BUG-BIL-001 |
| US-ONB-PROV-001 | STORY | THM-007 | EPIC-ADM-001 | FEAT-ADM-HOS-002 | Auto-provision after onboarding approve | PLATFORM_ADMIN | PLANNED | P2 | 8 | GAP-ONB-001 | REL-CORE-WF | Sprint 03 | GAP-ONB-001 |
| BUG-API-001 | BUG | THM-006 | EPIC-CC-001 | FEAT-CC-OPS-001 | Double /api/v1 prefix on FE API modules | HOSPITAL_ADMIN | OPEN | P1 | 5 | — | REL-STABILIZATION | Sprint 01 | Phase C defects |
| BUG-BIL-001 | BUG | THM-004 | EPIC-BIL-001 | FEAT-BIL-CHG-002 | Charge attach not wired; POST ≠ invoice lines | HOSPITAL_ADMIN | OPEN | P1 | 8 | US-BIL-CHG-001 | REL-CORE-WF | Sprint 02 | Phase C #12 |
| BUG-AUTH-001 | BUG | THM-001 | EPIC-IAM-002 | FEAT-IAM-RBAC-003 | Patient portal missing RoleRoute | PATIENT | OPEN | P1 | 3 | — | REL-STABILIZATION | Sprint 01 | router.tsx |
| BUG-AUTH-002 | BUG | THM-001 | EPIC-IAM-002 | FEAT-IAM-RBAC-003 | RoleRoute skips check when user null | All roles | OPEN | P2 | 3 | — | REL-STABILIZATION | Sprint 01 | RoleRoute.tsx |
| GAP-ONB-001 | GAP | THM-007 | EPIC-ADM-001 | FEAT-ADM-HOS-002 | Onboarding APPROVED does not auto-provision | PLATFORM_ADMIN | OPEN | P2 | 8 | US-ADM-HOS-002 | REL-CORE-WF | Sprint 03 | OnboardingRequestService |
| TECH-NTF-001 | TECH | THM-001 | EPIC-IAM-001 | — | SMS defaults to log stub | Platform | OPEN | P2 | 5 | — | REL-HARDENING | Sprint 03 | DefaultSmsNotificationGateway |
| SEC-PAY-001 | SEC | THM-004 | EPIC-BIL-002 | FEAT-BIL-PAY-002 | Razorpay sandbox accepts blank webhook secret | PATIENT | OPEN | P2 | 5 | US-BIL-PAY-002 | REL-HARDENING | Sprint 02 | RazorpayPaymentGatewayClient |
| GAP-VIS-AMB-001 | GAP | THM-003 | — | — | Ambulance operations | Ops | PLANNED | P3 | 13 | Vision only | REL-FUTURE | — | PRODUCT-VISION FUTURE |
| GAP-VIS-HOME-001 | GAP | THM-002 | — | — | Home nursing / homecare | PATIENT | PLANNED | P3 | 13 | Vision only | REL-FUTURE | — | PRODUCT-VISION FUTURE |
| GAP-VIS-PHY-001 | GAP | THM-003 | — | — | Physiotherapy product module | Clinical | PLANNED | P3 | 13 | Vision only | REL-FUTURE | — | PRODUCT-VISION FUTURE |
| GAP-VIS-AI-001 | GAP | THM-006 | — | — | AI clinical decision support | Clinical | PLANNED | P3 | 13 | Vision only | REL-FUTURE | — | PRODUCT-VISION FUTURE |

---

## Counts (this pass)

| Type | Count |
|------|------:|
| Baseline stories (IMPLEMENTED/PARTIAL) | 34 |
| Future stories | 4 |
| Bugs | 4 |
| Gaps (product + vision) | 5 |
| Tech | 1 |
| Security | 1 |
| **Backlog rows** | **49** |

---

## Next work (recommended intake)

1. Sprint 01: BUG-AUTH-001/002, BUG-API-001 (+ related story fixes).
2. Sprint 02: BUG-BIL-001 / US-BIL-CHG-003, SEC-PAY-001 hardening start.
3. Sprint 03: GAP-ONB-001 / US-ONB-PROV-001, TECH-NTF-001 provider decision spike.
4. Parallel: continue Phase B/C to convert UNKNOWN features → stories.
