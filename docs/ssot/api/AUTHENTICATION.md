# Authentication & Authorization — CURRENT

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-AUTH-001 |
| **Version** | 1.0 |
| **Status** | DRAFT |

## Authentication

| Mechanism | Detail |
|-----------|--------|
| Access token | JWT RS256 |
| Claims | userId, tenantId, email, roles, permissions, jti |
| Refresh | Rotating refresh tokens (IAM services) |
| Password | BCrypt(12) |
| MFA | TOTP support migrated (V77); client completeness UNKNOWN |

## Authorization

| Mechanism | Detail |
|-----------|--------|
| Roles | e.g. PATIENT, DOCTOR, HOSPITAL_ADMIN, PLATFORM_ADMIN, RECEPTIONIST, NURSE, ICU_NURSE, LAB_TECHNICIAN, RADIOLOGY_TECHNICIAN, OT_COORDINATOR, PHARMACIST, ASSET_MANAGER |
| Permissions | `resource:action` codes seeded in Flyway |
| Enforcement | `@PreAuthorize` + hospital scope services |
| Feature flags | Plan features gate modules |

## Public endpoints (high level)

Health, auth entrypoints, public doctor/hospital profiles & reviews, Razorpay webhook, actuator health/info, swagger — per `SecurityConfig` allowlist.
