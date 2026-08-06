# DOC-36: Launch Decision Framework — Phase 1 vs Phase 2 Production

| Attribute | Value |
|-----------|-------|
| **Document ID** | DOC-36 |
| **Title** | Production Launch Decision Framework |
| **Version** | 1.0 |
| **Status** | **Draft — For Stakeholder Decision** |
| **Date** | 2026-08-03 |
| **Author** | Technical Lead / Product Owner |
| **References** | [DOC-01](../../phase-1/requirements/01-PROJECT-VISION-AND-SCOPE-CHARTER.md), [DOC-21](../requirements/21-PHASE-2-VISION-AND-SCOPE-CHARTER.md), [DOC-15](../../phase-1/delivery/15-DEVELOPMENT-ROADMAP.md) |

---

## 1. Purpose

This document helps leadership decide **when to launch production**:

- **Option A:** Launch immediately after Phase 1 (M6) completion  
- **Option B:** Delay public production until Phase 2 core modules (2A) are ready  
- **Option C:** Hybrid — Phase 1 public launch + Phase 2 in staged rollout  

---

## 2. Current State Summary (August 2026)

| Area | Phase 1 readiness | Notes |
|------|-------------------|-------|
| Backend | ~90% | V1–V23 migrations; core APIs live |
| Web | ~90% | All portals; prescriptions/payments are placeholders |
| Mobile | ~75% | Through S11; S12–S15 parity in progress |
| Production infra | ~40% | Local Docker ✅; AWS prod checklist not complete |
| Compliance testing | ~20% | Pen test, load test, UAT not done |
| Documentation | 100% specs | Phase 1 approved; Phase 2 draft pack (this release) |

**Verdict:** Phase 1 is **feature-rich for beta** but **not launch-certified** until M6 checklist passes.

---

## 3. Option Comparison

### Option A — Launch after Phase 1 (Recommended default)

**What users get:**
- Register, build health profile, find doctors/hospitals, book appointments
- Health dashboard, vitals, documents, timeline, reviews
- Doctor/hospital/admin portals with verification and scheduling

**What users do NOT get:**
- Pay inside the app (pay at clinic manually)
- E-prescriptions, pharmacy orders, lab orders via platform
- Video consultations
- Insurance claims

| Pros | Cons |
|------|------|
| Fastest time to market (~4–8 weeks to M6) | No transaction revenue |
| Validates product-market fit on core loop | Competitive gap vs apps with payments/telehealth |
| Lower regulatory surface (no PCI, no e-Rx yet) | Sales story is "platform" not "full care OS" |
| Smaller launch blast radius | Some hospital partners may expect billing integration |

**Best for:** Building user base, doctor/hospital network, proving scheduling + profiles at scale.

**Estimated timeline:** Complete M6 checklist → **4–8 weeks** from today.

---

### Option B — Launch after Phase 2A (E-Rx + Pharmacy + Lab + Payments)

**What users additionally get:**
- Pay for consultations and orders in-app
- Digital prescriptions routed to pharmacy
- Lab test orders and results in patient timeline
- Revenue-ready for commissions/subscriptions

| Pros | Cons |
|------|------|
| Complete care + commerce story | **+12 weeks minimum** after Phase 1 sign-off |
| Monetization from day one of public launch | PCI-DSS, e-Rx, telehealth legal review required |
| Stronger hospital/pharmacy/lab partnerships | Higher build + ops cost before any revenue |
| Fewer "coming soon" placeholders | More failure modes at launch (payments, fulfillment) |

**Best for:** B2B deals requiring integrated billing, pharmacy chains, diagnostic lab partners.

**Estimated timeline:** Phase 1 M6 + Phase 2A → **~16–20 weeks** from today.

---

### Option C — Hybrid (Recommended for most SaaS healthcare products)

1. **Phase 1 public launch** (or invite-only beta) once M6 passes  
2. **Phase 2A private beta** with selected pharmacy/lab partners  
3. **Phase 2 public** when payment + fulfillment KPIs met  

| Pros | Cons |
|------|------|
| Revenue of early users + learning from live traffic | Two launch communications to manage |
| De-risks Phase 2 with real Phase 1 usage data | Team runs parallel: ops + Phase 2 build |
| Stakeholders see progress quickly | Feature flags and tenant gating required |

**Best for:** TechEarnest-style rollout — prove foundation, then expand commerce.

---

## 4. Decision Matrix

Score each criterion 1–5 (5 = strongly favors that option).

| Criterion | Weight | Option A (Phase 1) | Option B (Phase 2A) | Option C (Hybrid) |
|-----------|--------|--------------------|---------------------|-------------------|
| Speed to market | 25% | **5** | 2 | 4 |
| Revenue readiness | 20% | 1 | **5** | 4 |
| Regulatory risk | 15% | **5** | 2 | 4 |
| Partner requirements (hospitals) | 15% | 3 | **5** | 4 |
| Engineering focus | 10% | **5** | 3 | 3 |
| Competitive positioning | 15% | 3 | **5** | 4 |

**Weighted guidance:** If partners **require payments** → Option B or C. If goal is **user growth + validation** → Option A or C.

---

## 5. Recommended Path (Technical Lead)

### Primary recommendation: **Option C — Hybrid**

| Milestone | Target | Gate |
|-----------|--------|------|
| **M6 — Phase 1 launch** | Week +6–8 | [DOC-15 §10](../../phase-1/delivery/15-DEVELOPMENT-ROADMAP.md) all P0 gates green |
| **Limited beta** | Week +8 | Invite-only; 100 patients, 20 doctors, 3 hospitals |
| **Phase 2A dev start** | Parallel with M6 prep | DOC-21 approved; payment vendor selected |
| **Phase 2A beta** | Week +18 | E-Rx + payments with 1 pharmacy + 1 lab partner |
| **Phase 2 public** | Week +22 | SO2-001–003 KPIs met |

### If budget/time is constrained: **Option A**

Launch Phase 1 as **free foundation platform**; monetize in Phase 2 without blocking Phase 1 users.

### If enterprise contract requires billing: **Option B**

Do not public-launch until Phase 2A minimum viable commerce is live.

---

## 6. Checklists by Option

### Option A — Go live after Phase 1

- [ ] M6 functional gate (58 P0 stories accepted)
- [ ] Pen test passed (auth, RBAC, patient PHI)
- [ ] Load test: booking concurrency, search p95
- [ ] AWS production environment + monitoring
- [ ] Privacy policy, terms, medical disclaimers published
- [ ] Remove or clearly label placeholder routes (prescriptions, payments)
- [ ] Support/runbook for patient + doctor onboarding

### Option B — Go live after Phase 2A

- [ ] All Option A items (Phase 1 still required as foundation)
- [ ] Payment gateway production keys + PCI SAQ completed
- [ ] E-prescription legal sign-off (India DMR Act / state rules)
- [ ] Pharmacy + lab partner onboarding (≥1 each)
- [ ] Reconciliation + refund runbooks
- [ ] Extended pen test (payment + clinical writes)

---

## 7. Stakeholder Sign-Off

| Decision | Selected option | Date | Approver |
|----------|-----------------|------|----------|
| Production launch timing | ☐ A ☐ B ☐ C | ________ | Product Owner |
| Phase 2 charter approval | ☐ Approve DOC-21 ☐ Defer | ________ | Product Owner |
| Budget for Phase 2A | ☐ Approved ☐ TBD | ________ | Executive sponsor |

---

## 8. Related Documents

| Document | Purpose |
|----------|---------|
| [DOC-21](../requirements/21-PHASE-2-VISION-AND-SCOPE-CHARTER.md) | What Phase 2 includes |
| [DOC-34](../delivery/34-PHASE-2-DEVELOPMENT-ROADMAP.md) | When Phase 2 ships |
| [DOC-15 §10](../../phase-1/delivery/15-DEVELOPMENT-ROADMAP.md) | Phase 1 launch gates |
| [00-PROJECT-MEMORY §7.1](../../00-PROJECT-MEMORY.md) | Live implementation status |

---

*End of DOC-36 — Launch Decision Framework v1.0*
