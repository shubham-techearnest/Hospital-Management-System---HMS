# RBAC Roles & Permissions — CURRENT

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-RBAC-001 |
| **Version** | 1.0 |
| **Status** | CURRENT — CODE VERIFIED |
| **Last Updated** | 2026-09-17 |

## Roles (web portals mapped)

| Role | Web mount | Notes |
|------|-----------|-------|
| `PATIENT` | `/patient` | |
| `DOCTOR` | `/doctor` | |
| `HOSPITAL_ADMIN` | `/hospital` | |
| `PLATFORM_ADMIN` | `/admin` | |
| `RECEPTIONIST` | `/reception` | |
| `NURSE` | `/nursing` | |
| `ICU_NURSE` | `/icu-nurse` | |
| `LAB_TECHNICIAN` | `/lab` | |
| `RADIOLOGY_TECHNICIAN` | `/radiology` | |
| `OT_COORDINATOR` | `/ot` | |
| `PHARMACIST` | `/pharmacy` | |
| `ASSET_MANAGER` | `/assets` | Mobile shell missing |

Permissions are `resource:action` codes in `iam.permissions`, seeded via Flyway, embedded in JWT as Spring authorities. Controllers use `@PreAuthorize`. Hospital scope services further restrict hospital-scoped data.

Full permission matrix: **UNKNOWN as single exported table** — source of truth is DB seeds + controller annotations. Regression: `HmsRbacRegressionIntegrationTest`.
