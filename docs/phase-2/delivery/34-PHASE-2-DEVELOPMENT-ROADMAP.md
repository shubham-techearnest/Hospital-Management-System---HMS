# DOC-34: Health360 AI — Phase 2 Development Roadmap

| Attribute | Value |
|-----------|-------|
| **Document ID** | DOC-34 |
| **Title** | Phase 2 Development Roadmap |
| **Version** | 1.0 |
| **Status** | **Draft** |
| **Date** | 2026-08-03 |
| **References** | [DOC-21](../requirements/21-PHASE-2-VISION-AND-SCOPE-CHARTER.md), [DOC-33](../requirements/33-PHASE-2-USER-STORIES.md) |

---

## 1. Prerequisites

- [ ] Phase 1 M6 launch checklist complete **OR** signed beta waiver [DOC-36](./36-LAUNCH-DECISION-FRAMEWORK.md)
- [ ] DOC-21 through DOC-33 approved by Product Owner
- [ ] Payment gateway merchant account approved
- [ ] Legal review: e-Rx + telehealth for target states

---

## 2. Milestones

| Milestone | Target | Outcome |
|-----------|--------|---------|
| **P2-M0** | Week 0 | Phase 2 kickoff; Razorpay sandbox; package scaffold |
| **P2-M1** | Week 6 | E-prescription live on staging |
| **P2-M2** | Week 12 | Pharmacy + lab + payments (Phase 2A) |
| **P2-M3** | Week 18 | Telemedicine + clinical notes |
| **P2-M4** | Week 24 | Insurance + FHIR export (P1) |
| **P2-M5** | Week 28 | Phase 2 production launch |

---

## 3. Sprint Plan (Indicative)

| Sprint | Focus | Points | Deliverable |
|--------|-------|--------|-------------|
| **P2-S0** | Kickoff + Phase 1.5 | — | MFA, password reset, tenant isolation |
| **P2-S1** | E-prescription backend + doctor UI | 25 | V24, prescribe flow |
| **P2-S2** | E-prescription patient + PDF | 22 | Patient Rx list, QR verify |
| **P2-S3** | Pharmacy module | 27 | Catalog, registration |
| **P2-S4** | Pharmacy orders | 24 | Patient order flow |
| **P2-S5** | Laboratory module | 26 | Orders + results |
| **P2-S6** | Payments integration | 28 | Razorpay, webhooks, invoices |
| **P2-S7** | Payment UX + mobile parity | 24 | **Phase 2A beta gate** |
| **P2-S8** | Telemedicine SDK | 26 | TELE booking + video room |
| **P2-S9** | Clinical visit notes | 20 | EMR lite |
| **P2-S10** | Insurance + FHIR | 18 | Policies, export API |
| **P2-S11** | AI assistant (P2) | 15 | FAQ chatbot |
| **P2-S12** | Hardening + pen test | 25 | **Phase 2 launch** |

---

## 4. Sub-Phase Mapping

| Sub-phase | Sprints | Modules |
|-----------|---------|---------|
| **2A — Commerce** | P2-S1–S7 | Rx, Pharmacy, Lab, Payments |
| **2B — Remote care** | P2-S8–S9 | Telemedicine, clinical notes |
| **2C — Enterprise** | P2-S10–S11 | Insurance, FHIR, AI |
| **2D — Launch** | P2-S12 | QA, perf, security |

---

## 5. Team Capacity

Same four-deliverable policy as Phase 1: Backend + Web + Mobile + Docs every sprint.

---

## 6. Production Launch Gates (Phase 2)

- [ ] All P0 Phase 2 stories accepted
- [ ] PCI SAQ completed
- [ ] Payment reconciliation verified in staging
- [ ] E-Rx legal sign-off documented
- [ ] Telehealth consent flow reviewed
- [ ] Pen test: zero critical/high on payment + clinical modules

---

*End of DOC-34 — Phase 2 Development Roadmap v1.0*
