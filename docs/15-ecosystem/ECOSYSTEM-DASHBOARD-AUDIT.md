# Ecosystem Dashboard Audit Matrix (ECO-F0.3)

| Attribute | Value |
|-----------|-------|
| **Document ID** | ECO-DASH-001 |
| **Status** | **APPROVED for reuse plan — 2026-08-25** |
| **Updated** | 2026-08-25 |

**Instructions:** For each row, confirm against running app + `router.tsx`. Mark **Action**: REUSE | ENHANCE | NEW | DEFER.

---

## Patient dashboard & care hub

| Capability (vision §46) | Current route / area | Gap | Action |
|-------------------------|----------------------|-----|--------|
| UHID | Dashboard subtitle + Profile chip | Was missing in API | **ENHANCE done (ECO-P1.1)** |
| Profile | `/patient/profile` | EXISTS | REUSE |
| Upcoming appointments | `/patient/appointments` + dashboard | EXISTS; friendly labels | REUSE |
| Current queue | `/patient/opd` | EXISTS; friendly labels | REUSE |
| Consultations / visits | `/patient/encounters` | EXISTS | REUSE |
| Prescriptions | `/patient/prescriptions` | EXISTS | REUSE |
| Laboratory orders | `/patient/lab-values` book hospital lab | **IN QA (ECO-P3)** | ENHANCE done |
| Laboratory reports | Labs released reports + visit package | **IN QA (ECO-P3)** | ENHANCE done |
| Medicines / pharmacy status | — | MISSING | NEW (ECO-P4) |
| Wellness plans | encounter wellness panel + patient visit package | **IN QA (ECO-P2)** | ENHANCE done |
| Health metrics | `/patient/dashboard`, health-score | PARTIAL | ENHANCE (ECO-P6) |
| Documents | `/patient/reports` | PARTIAL | ENHANCE (ECO-P6) |
| Notifications | settings + OPD inbox | PARTIAL | ENHANCE (ECO-P5) |
| Medical timeline | `/patient/timeline` | PARTIAL journey | ENHANCE (ECO-P6) |
| Book OPD | `/patient/book` | EXISTS | REUSE |

---

## Doctor dashboard

| Capability (§47) | Current | Gap | Action |
|------------------|---------|-----|--------|
| Today’s OPD | `/doctor/opd` | EXISTS | REUSE |
| Queue context | token + queueStatus chips | PARTIAL → labels applied | ENHANCE (ongoing) |
| Waiting patients | doctor encounters | EXISTS | REUSE |
| Patient history summary | encounter summary via appointment **or** encounterId | Walk-in/ARRIVED fixed | ENHANCE done (ECO-P2) |
| Consultation workspace | `/doctor/encounters/:id` | EXISTS | REUSE |
| Prescriptions / lab orders | encounter panels | EXISTS | REUSE |
| Follow-ups | wellness follow-up date + `clinical.followups` | Reminders later | ENHANCE (ECO-P2 done; notify ECO-P5) |
| Schedule | `/doctor/schedule` | EXISTS | REUSE |

---

## Receptionist dashboard

| Capability (§48) | Current | Gap | Action |
|------------------|---------|-----|--------|
| Queue / tokens | `/reception/dashboard` | EXISTS; Queue+Consult columns | REUSE |
| Patient search / register | reception patients | EXISTS | REUSE |
| Book / arrive | tabs on dashboard | EXISTS | REUSE |
| Checkout | `/reception/checkout/:id` | EXISTS + gate | REUSE |
| Unified today’s appointment list | partial via tabs | PARTIAL | ENHANCE (ECO-P1) |
| Self check-in support | desk only | MISSING | NEW (ECO-P5) |

---

## Hospital admin

| Capability (§49) | Current | Gap | Action |
|------------------|---------|-----|--------|
| OPD floor | `/hospital/opd` | Same as reception | REUSE |
| Org / staff / roster | hospital pages | EXISTS / PARTIAL HR | REUSE / ECO-P7 |
| Billing | invoices / checkout | PARTIAL | REUSE |
| Embedded lab/rad/pharm/OT | hospital routes | Thin dashboards | ENHANCE per module phase |

---

## Pharmacy / Laboratory portals

| Portal | Current | Action |
|--------|---------|--------|
| `/pharmacy` | Thin clinical MAR dashboard | ENHANCE hospital path; NEW retail share ECO-P4 |
| `/lab` | Worklist + process + catalog | **ENHANCE done (ECO-P3)**; independent org ECO-P7 |

---

## Approval

| Role | Sign-off | Date |
|------|----------|------|
| Product | Approved via proceed | 2026-08-25 |
| Architect | Status map + reuse plan accepted | 2026-08-25 |
| Engineering | ECO-P0 implemented | 2026-08-25 |
