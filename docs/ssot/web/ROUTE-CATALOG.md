# Web Route Catalog — CURRENT

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-WEB-ROUTES-001 |
| **Version** | 1.0 |
| **Status** | DRAFT |
| **Source** | `frontend/health360-web/src/app/router.tsx` |

## Public / auth

`/`, `/brand`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`, `/complete-patient-account`, `/doctors/:id`, `/hospitals/:id`, `/settings/*`

## Patient `/patient/*`

dashboard, profile, vitals, health-score, metrics, search, request-opd, hospitals, doctors, reports, lab-values, timeline, prescriptions, opd, payments, encounters, ipd

## Doctor `/doctor/*`

dashboard, my-work, profile, verification, hospitals, schedule, opd, ipd, encounters

## Hospital `/hospital/*`

dashboard (command center), profile, branches, departments, emergency, doctors, staff, opd, catalogs, billing/invoices, billing/charge-exceptions, billing/checkout, ipd, ipd-services, icu, assets, my-work, ed, inventory, procurement, facility, insurance, blood-bank, staff-ops, lab/radiology/ot/pharmacy dashboards, subscription, facilities, gallery

## Other role mounts

| Mount | Role |
|-------|------|
| `/admin/*` | PLATFORM_ADMIN |
| `/lab/*` | LAB_TECHNICIAN |
| `/radiology/*` | RADIOLOGY_TECHNICIAN |
| `/ot/*` | OT_COORDINATOR |
| `/pharmacy/*` | PHARMACIST |
| `/assets` | ASSET_MANAGER |
| `/reception/*` | RECEPTIONIST |
| `/nursing/*` | NURSE |
| `/icu-nurse/*` | ICU_NURSE |
| `/documents/...` | Clinical print |

Exact child routes: see `router.tsx` (authoritative).
