# 03 — Actors & Roles

| Attribute | Value |
|-----------|-------|
| **Document ID** | AGILE-ACTOR-001 |
| **Status** | DRAFT — CODE-VERIFIED roles; workflows refined in Phase B/C |
| **Last Updated** | 2026-09-17 |

**Source of truth for role names:** Flyway IAM seeds + web `AppRole` + `RoleRoute` mounts.  
**Do not invent roles** not present in repository evidence.

---

## Actor & role matrix

### ACT-001 — Public Visitor

| Field | Value |
|-------|-------|
| **Role** | *(unauthenticated)* |
| **Purpose** | Discover product; register as patient; request doctor/hospital onboarding; view public profiles |
| **Accessible modules** | Landing, `/for-hospitals`, public doctor/hospital profiles, auth pages |
| **Major actions** | Browse marketing; submit hospital demo / doctor access request; open login/register |
| **Permissions** | Public API paths only |
| **Restrictions** | No portal data access |
| **Primary workflows** | WF pending: Public discovery → Register / Book demo |
| **Evidence** | `router.tsx` public routes; `SecurityConfig` permitAll; `PublicOnboardingRequestController` |
| **Confidence** | HIGH |

---

### ACT-002 — Patient (User)

| Field | Value |
|-------|-------|
| **Role** | `PATIENT` |
| **Purpose** | Consumer health account: profile, discovery, OPD request, records, payments, IPD view |
| **Accessible modules** | `/patient/*` portal (ProtectedRoute — **not** RoleRoute) |
| **Major actions** | Register/verify; manage profile/consent; search doctors/hospitals; request OPD; view encounters/vitals/docs; pay |
| **Permissions** | JWT permissions e.g. `patient:profile:*` and related (exact matrix: DB seeds — full dump UNKNOWN in this pass) |
| **Restrictions** | Self-registration only for PATIENT; hospital create not allowed |
| **Primary workflows** | Self-register → verify → discover → OPD → clinical artifacts |
| **Evidence** | `RegisterPage` hardcodes PATIENT; `PatientPortalLayout`; patient controllers |
| **Confidence** | HIGH (role); MEDIUM (full permission list) |
| **Known gap** | Patient routes lack `RoleRoute role="PATIENT"` — other roles with a token may enter URL if not redirected |

---

### ACT-003 — Doctor

| Field | Value |
|-------|-------|
| **Role** | `DOCTOR` |
| **Purpose** | Clinical practice: profile/verification, schedule, OPD encounters, IPD, hospital associations |
| **Accessible modules** | `/doctor/*` |
| **Major actions** | Complete profile; submit verification; manage schedule; run OPD encounter; IPD admission work |
| **Permissions** | Doctor profile + clinical authorities (DB-seeded) |
| **Restrictions** | Access via request/demo provisioning — not public self-register as DOCTOR |
| **Evidence** | `RoleRoute role="DOCTOR"`; doctor feature + controllers; `RequestAccessPage` / onboarding |
| **Confidence** | HIGH |

---

### ACT-004 — Hospital Administrator

| Field | Value |
|-------|-------|
| **Role** | `HOSPITAL_ADMIN` |
| **Purpose** | Operate hospital tenant: org, staff, clinical ops dashboards, billing, inventory, ED, etc. |
| **Accessible modules** | `/hospital/*` (largest nav surface) |
| **Major actions** | Profile/branches/departments; staff invite; OPD/IPD/ICU; catalogs; billing; assets; ops modules |
| **Permissions** | Broad hospital-scoped authorities |
| **Restrictions** | Tenant-scoped; hospital creation is platform-admin path (per product policy + admin APIs) |
| **Evidence** | `HospitalPortalLayout`; hospital + many ops controllers |
| **Confidence** | HIGH |

---

### ACT-005 — Platform Administrator

| Field | Value |
|-------|-------|
| **Role** | `PLATFORM_ADMIN` |
| **Purpose** | Operate the Health360 platform: users, hospitals, verifications, plans, partners, audit, reviews, onboarding queue |
| **Accessible modules** | `/admin/*` |
| **Major actions** | Verify doctors; manage users/hospitals/subscriptions; moderate reviews; process onboarding requests |
| **Evidence** | `AdminPortalLayout`; admin controllers; V9 seed admins |
| **Confidence** | HIGH |

---

### ACT-006 — Receptionist

| Field | Value |
|-------|-------|
| **Role** | `RECEPTIONIST` |
| **Purpose** | Front desk: patient registry, OPD queue/display, checkout |
| **Accessible modules** | `/reception/*`, `/reception/display` |
| **Major actions** | Search/register patients; OPD desk; checkout/billing handoff; display board |
| **Evidence** | Reception portal; `HospitalPatientRegistryController`; OPD APIs; billing checkout pages |
| **Confidence** | HIGH |

---

### ACT-007 — Nurse

| Field | Value |
|-------|-------|
| **Role** | `NURSE` |
| **Purpose** | Ward nursing: board, admissions, MAR, my-work |
| **Accessible modules** | `/nursing/*` |
| **Major actions** | Ward board; admission detail; medication administration record |
| **Evidence** | Nursing portal pages; IPD nurse permissions in migrations (e.g. V72) |
| **Confidence** | HIGH (portal exists); MEDIUM (depth vs API — Phase C) |
| **SSOT hypothesis** | Nursing marked PARTIAL in FEATURE-INVENTORY — **re-verify** |

---

### ACT-008 — ICU Nurse

| Field | Value |
|-------|-------|
| **Role** | `ICU_NURSE` |
| **Purpose** | ICU stay monitoring board |
| **Accessible modules** | `/icu-nurse/*` |
| **Evidence** | `IcuNursePortalLayout`; ICU APIs |
| **Confidence** | HIGH (portal); MEDIUM (completeness) |

---

### ACT-009 — Lab Technician

| Field | Value |
|-------|-------|
| **Role** | `LAB_TECHNICIAN` |
| **Purpose** | Lab worklist, order detail, catalog |
| **Accessible modules** | `/lab/*` (+ hospital embeds lab dashboard) |
| **Evidence** | Lab portal; `LabController` |
| **Confidence** | HIGH |

---

### ACT-010 — Radiology Technician

| Field | Value |
|-------|-------|
| **Role** | `RADIOLOGY_TECHNICIAN` |
| **Purpose** | Imaging worklist/orders/catalog |
| **Accessible modules** | `/radiology/*` |
| **Evidence** | Radiology portal; `RadiologyController` |
| **Confidence** | HIGH |

---

### ACT-011 — OT Coordinator

| Field | Value |
|-------|-------|
| **Role** | `OT_COORDINATOR` |
| **Purpose** | OT worklist, procedures, catalog |
| **Accessible modules** | `/ot/*` |
| **Evidence** | OT portal; `OtController` |
| **Confidence** | HIGH |

---

### ACT-012 — Pharmacist

| Field | Value |
|-------|-------|
| **Role** | `PHARMACIST` |
| **Purpose** | Pharmacy worklist, medication orders, e-Rx requests, catalog |
| **Accessible modules** | `/pharmacy/*` |
| **Evidence** | Pharmacy portal; `PharmacyController`; V58 pharmacy requests |
| **Confidence** | HIGH |

---

### ACT-013 — Asset Manager

| Field | Value |
|-------|-------|
| **Role** | `ASSET_MANAGER` |
| **Purpose** | Enterprise asset management portal |
| **Accessible modules** | `/assets/*` (+ hospital assets page for admin) |
| **Evidence** | `AssetPortalLayout`; `AssetController`; V88/V96 |
| **Confidence** | HIGH |

---

## Cross-cutting actors (logical, not extra IAM roles)

| Actor | Notes |
|-------|-------|
| **Hospital Staff (generic)** | Any of RECEPTIONIST/NURSE/… invited via hospital staff APIs |
| **Partner organization user** | Partner APIs + admin partner pages exist — **login role mapping UNKNOWN** in this pass (may be HOSPITAL_ADMIN-adjacent or separate) — mark **UNKNOWN** until Phase C |
| **System / Scheduler** | Reminder & predictive jobs — technical actor |

---

## Post-login role priority (web)

From `roleNavigation.ts` (CODE-VERIFIED):

`PLATFORM_ADMIN` → `HOSPITAL_ADMIN` → `DOCTOR` → `ICU_NURSE` → `NURSE` → `RECEPTIONIST` → `LAB_TECHNICIAN` → `RADIOLOGY_TECHNICIAN` → `OT_COORDINATOR` → `PHARMACIST` → `ASSET_MANAGER` → `PATIENT`

---

## Permission model (summary)

| Aspect | Finding |
|--------|---------|
| Model | DB `iam.permissions` + role_permissions; codes in JWT |
| Enforcement | Method security `@PreAuthorize` |
| Full printable matrix | **UNKNOWN** as single frozen table in this Phase A pass (seeded across many migrations) |
| Frontend | Route role guards; finer permission UI gating — **to inventory in Phase B** |

---

## Phase B follow-ups

1. Map each nav item → permission dependency.
2. Confirm Partner user identity model.
3. Document hospital-scope enforcement for staff roles (`HospitalScopeService`).
4. Treat FEATURE-INVENTORY “IMPLEMENTED” rows as **candidates**, not Agile status.
