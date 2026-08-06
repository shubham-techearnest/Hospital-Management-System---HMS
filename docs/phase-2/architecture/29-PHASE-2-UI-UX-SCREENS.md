# DOC-29: Health360 AI — Phase 2 UI/UX Screen Specification

| Attribute | Value |
|-----------|-------|
| **Document ID** | DOC-29 |
| **Title** | Phase 2 UI/UX Screen Specification |
| **Version** | 1.0 |
| **Status** | **Draft** |
| **Date** | 2026-08-03 |
| **References** | [DOC-10](../../phase-1/architecture/10-UI-UX-SCREEN-SPECIFICATION.md) |

---

## 1. Screen ID Convention

Phase 2 screens use prefix **SCR2-** by portal.

---

## 2. Patient Portal (New Screens)

| ID | Screen | Route (web) |
|----|--------|-------------|
| SCR2-PAT-001 | My Prescriptions | `/patient/prescriptions` |
| SCR2-PAT-002 | Prescription Detail + PDF | `/patient/prescriptions/:id` |
| SCR2-PAT-003 | Pharmacy Order Checkout | `/patient/pharmacy/orders/new` |
| SCR2-PAT-004 | Pharmacy Order Tracking | `/patient/pharmacy/orders/:id` |
| SCR2-PAT-005 | Lab Orders & Results | `/patient/lab-orders` |
| SCR2-PAT-006 | Payment History | `/patient/payments` |
| SCR2-PAT-007 | Video Consult Room | `/patient/appointments/:id/video` |
| SCR2-PAT-008 | Insurance Policies | `/patient/insurance` |
| SCR2-PAT-009 | AI Care Assistant | `/patient/assistant` |

**Replaces placeholders:** `/patient/prescriptions`, `/patient/payments` currently PlaceholderPage.

---

## 3. Doctor Portal (New Screens)

| ID | Screen | Route |
|----|--------|-------|
| SCR2-DOC-001 | Write Prescription | `/doctor/appointments/:id/prescribe` |
| SCR2-DOC-002 | Order Lab Tests | `/doctor/appointments/:id/lab-order` |
| SCR2-DOC-003 | Visit Summary / Notes | `/doctor/appointments/:id/notes` |
| SCR2-DOC-004 | Video Consult Room | `/doctor/appointments/:id/video` |

---

## 4. Pharmacy Portal (New)

| ID | Screen | Route |
|----|--------|-------|
| SCR2-PHR-001 | Pharmacy Dashboard | `/pharmacy/dashboard` |
| SCR2-PHR-002 | Catalog Management | `/pharmacy/catalog` |
| SCR2-PHR-003 | Order Queue | `/pharmacy/orders` |

---

## 5. Laboratory Portal (Enhanced)

Lab dashboard currently roadmap-style — Phase 2 activates:

| ID | Screen | Route |
|----|--------|-------|
| SCR2-LAB-001 | Lab Dashboard | `/lab/dashboard` |
| SCR2-LAB-002 | Test Catalog | `/lab/tests` |
| SCR2-LAB-003 | Order Queue & Results Upload | `/lab/orders` |

---

## 6. Design Tokens

Reuse Phase 1 Visit Health palette [DOC-10]. Payment flows use success green `#2e7d32`; clinical actions use primary purple `#714fff`.

---

*End of DOC-29 — Phase 2 UI/UX Screens v1.0*
