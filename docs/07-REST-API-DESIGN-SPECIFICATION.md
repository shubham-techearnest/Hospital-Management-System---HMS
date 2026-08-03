# DOC-07: Health360 AI — REST API Design Specification

| Attribute | Value |
|-----------|-------|
| **Document ID** | DOC-07 |
| **Title** | REST API Design Specification |
| **Version** | 1.0 |
| **Status** | **Approved** |
| **Date** | 2026-07-29 |
| **Author** | Java Spring Boot Architect / Technical Lead |
| **References** | [DOC-03] FRS, [DOC-05] Domain Model, [DOC-06] Database Design |
| **Next Document** | [DOC-08] Health Formula Engine Specification |

---

## 1. Executive Summary

This document specifies all **REST API endpoints** for Health360 AI Phase 1. Every endpoint defines HTTP method, path, authentication, authorization, request schema, response schema, validation rules, and error codes — forming the contract between React web, React Native mobile, and the Spring Boot backend.

**Totals:** 112 endpoints across 10 API modules | OpenAPI 3.0 generated via Swagger [NFR-MAINT-006]

---

## 2. API Conventions

### 2.1 Base URL

| Environment | Base URL |
|-------------|----------|
| Production | `https://api.health360.ai/api/v1` |
| Staging | `https://api-staging.health360.ai/api/v1` |
| Local | `http://localhost:8080/api/v1` |

### 2.2 Versioning

- URL path versioning: `/api/v1/`
- Breaking changes require `/api/v2/` [NFR-INT-010]
- Non-breaking additions (new optional fields) allowed in v1

### 2.3 HTTP Methods

| Method | Usage |
|--------|-------|
| GET | Read resource(s) |
| POST | Create resource or action |
| PUT | Full replace/update |
| PATCH | Partial update |
| DELETE | Soft delete |

### 2.4 Authentication

| Type | Header | Usage |
|------|--------|-------|
| Bearer JWT | `Authorization: Bearer {accessToken}` | All protected endpoints |
| Public | None | Registration, login, public profiles, search |

**Token Lifecycle:** [FR-IAM-003, FR-IAM-004]
- Access token: 15 minutes
- Refresh token: 7 days (HttpOnly cookie or request body)

### 2.5 Standard Headers

| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Protected routes | Bearer JWT |
| Content-Type | POST/PUT/PATCH | `application/json` |
| Accept | All | `application/json` |
| X-Tenant-Id | Optional | Tenant context; default from JWT |
| X-Correlation-Id | Optional | Request tracing [NFR-MAINT-008] |
| X-Timezone | Optional | Client timezone (default Asia/Kolkata) |

### 2.6 Pagination

Query parameters for all list endpoints:

| Param | Type | Default | Max |
|-------|------|---------|-----|
| page | integer | 0 | — |
| size | integer | 20 | 100 |
| sort | string | varies | field,direction (e.g., `createdAt,desc`) |

**Paginated Response Wrapper:**

```json
{
  "content": [],
  "page": 0,
  "size": 20,
  "totalElements": 150,
  "totalPages": 8,
  "first": true,
  "last": false
}
```

### 2.7 Standard Success Response

Single resource:

```json
{
  "success": true,
  "data": { },
  "timestamp": "2026-07-29T07:22:00Z"
}
```

Action/no-body success:

```json
{
  "success": true,
  "message": "Operation completed",
  "timestamp": "2026-07-29T07:22:00Z"
}
```

### 2.8 Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is already registered",
        "code": "DUPLICATE_EMAIL"
      }
    ],
    "correlationId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-07-29T07:22:00Z"
  }
}
```

---

## 3. Error Code Catalog

| HTTP | Error Code | Description |
|------|-----------|-------------|
| 400 | VALIDATION_ERROR | Request validation failed |
| 400 | INVALID_STATUS_TRANSITION | Invalid appointment/status change |
| 400 | CANCELLATION_NOT_ALLOWED | Outside cancellation window |
| 400 | INSUFFICIENT_PROFILE_DATA | Profile incomplete for operation |
| 401 | UNAUTHORIZED | Missing or invalid token |
| 401 | TOKEN_EXPIRED | Access token expired |
| 401 | INVALID_CREDENTIALS | Wrong email/password |
| 403 | FORBIDDEN | Insufficient permissions |
| 403 | EMAIL_NOT_VERIFIED | Account pending verification |
| 403 | ACCOUNT_LOCKED | Too many failed login attempts |
| 403 | ACCOUNT_DEACTIVATED | Account deactivated |
| 404 | RESOURCE_NOT_FOUND | Entity not found |
| 409 | DUPLICATE_EMAIL | Email already registered |
| 409 | DUPLICATE_REGISTRATION | Medical/hospital reg number exists |
| 409 | SLOT_UNAVAILABLE | Time slot no longer available |
| 409 | DUPLICATE_APPOINTMENT | Same doctor same day exists |
| 409 | DUPLICATE_REVIEW | Review already submitted |
| 413 | FILE_TOO_LARGE | Upload exceeds size limit |
| 422 | VERIFICATION_INCOMPLETE | Doctor profile incomplete for submission |
| 423 | ACCOUNT_LOCKED | Locked due to failed attempts |
| 429 | RATE_LIMIT_EXCEEDED | Too many requests |
| 500 | INTERNAL_ERROR | Unexpected server error |
| 503 | SERVICE_UNAVAILABLE | Dependency unavailable |

---

## 4. Common Schema Definitions

### 4.1 AddressDto

```json
{
  "line1": "string (required, max 200)",
  "line2": "string (optional, max 200)",
  "city": "string (required, max 100)",
  "state": "string (required, max 100)",
  "pincode": "string (required, 6 digits)",
  "country": "string (default IN, ISO 3166-1 alpha-2)"
}
```

### 4.2 GeoCoordinateDto

```json
{
  "latitude": "decimal (-90 to 90)",
  "longitude": "decimal (-180 to 180)"
}
```

### 4.3 MoneyDto

```json
{
  "amount": "decimal (>= 0, scale 2)",
  "currency": "string (default INR)"
}
```

### 4.4 UserSummaryDto

```json
{
  "id": "uuid",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "phone": "string",
  "avatarUrl": "string | null",
  "roles": ["PATIENT"]
}
```

---

## 5. Module: Identity & Access Management

Base path: `/auth`, `/users`, `/admin`

---

### API-IAM-001: Register User

| Attribute | Value |
|-----------|-------|
| **Method / Path** | `POST /auth/register` |
| **Auth** | Public |
| **Permission** | None |
| **Traces To** | FR-IAM-001 |

**Request Body:**

```json
{
  "email": "priya@example.com",
  "password": "SecureP@ss1",
  "confirmPassword": "SecureP@ss1",
  "firstName": "Priya",
  "lastName": "Sharma",
  "phone": "9876543210",
  "role": "PATIENT",
  "acceptTerms": true
}
```

**Validation:** email (unique, format), password [BR-AUTH-004], confirmPassword match, phone (10-digit India), role (PATIENT|DOCTOR), acceptTerms=true

**Response 201:**

```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "priya@example.com",
    "status": "PENDING_VERIFICATION",
    "message": "Verification email sent"
  }
}
```

**Errors:** 409 DUPLICATE_EMAIL, 400 VALIDATION_ERROR, 429 RATE_LIMIT_EXCEEDED

---

### API-IAM-002: Verify Email

| Method / Path | `GET /auth/verify-email?token={token}` |
| Auth | Public |

**Response 200:** Redirect or JSON success. **Errors:** 400 TOKEN_EXPIRED, 400 VALIDATION_ERROR

---

### API-IAM-003: Resend Verification Email

| Method / Path | `POST /auth/resend-verification` |
| Auth | Public |

**Request:** `{ "email": "string" }`  
**Response 200:** Success message. **Errors:** 404 RESOURCE_NOT_FOUND, 429 RATE_LIMIT_EXCEEDED

---

### API-IAM-004: Login

| Method / Path | `POST /auth/login` |
| Auth | Public |
| Traces To | FR-IAM-003 |

**Request:**

```json
{
  "email": "priya@example.com",
  "password": "SecureP@ss1",
  "deviceInfo": "Chrome/Windows (optional)"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "uuid...",
    "expiresIn": 900,
    "tokenType": "Bearer",
    "user": { "id": "uuid", "email": "...", "firstName": "...", "lastName": "...", "roles": ["PATIENT"], "permissions": ["patient:profile:read"] }
  }
}
```

**Errors:** 401 INVALID_CREDENTIALS, 403 EMAIL_NOT_VERIFIED, 423 ACCOUNT_LOCKED

---

### API-IAM-005: Refresh Token

| Method / Path | `POST /auth/refresh` |
| Auth | Refresh token required |
| Traces To | FR-IAM-004 |

**Request:** `{ "refreshToken": "string" }`  
**Response 200:** New accessToken + refreshToken pair. **Errors:** 401 TOKEN_EXPIRED, 401 UNAUTHORIZED (reused token)

---

### API-IAM-006: Logout

| Method / Path | `POST /auth/logout` |
| Auth | Bearer JWT |
| Traces To | FR-IAM-005 |

**Response 204:** No content

---

### API-IAM-007: Change Password

| Method / Path | `PUT /auth/password` |
| Auth | Bearer JWT |
| Traces To | FR-IAM-006 |

**Request:** `{ "currentPassword": "...", "newPassword": "...", "confirmPassword": "..." }`  
**Response 200:** Success. **Errors:** 400 VALIDATION_ERROR, 400 INVALID_CREDENTIALS

---

### API-IAM-008: Get Current User Profile

| Method / Path | `GET /users/me` |
| Auth | Bearer JWT |
| Permission | Authenticated |

**Response 200:** UserSummaryDto + timezone, locale, status, emailVerified

---

### API-IAM-009: Update Current User Profile

| Method / Path | `PATCH /users/me` |
| Auth | Bearer JWT |
| Traces To | FR-IAM-008 |

**Request:** `{ "firstName", "lastName", "phone", "avatarUrl", "timezone", "locale" }` (partial)  
**Response 200:** Updated user profile

---

### API-IAM-010: Get Notification Preferences

| Method / Path | `GET /users/me/notification-preferences` |
| Auth | Bearer JWT |
| Traces To | FR-IAM-009 |

**Response 200:** Array of `{ notificationType, emailEnabled, smsEnabled, inAppEnabled }`

---

### API-IAM-011: Update Notification Preferences

| Method / Path | `PUT /users/me/notification-preferences` |
| Auth | Bearer JWT |

**Request:** Array of preference objects  
**Response 200:** Updated preferences

---

### API-IAM-012: Get In-App Notifications

| Method / Path | `GET /users/me/notifications` |
| Auth | Bearer JWT |
| Query | `isRead`, `page`, `size` |

**Response 200:** Paginated notification list

---

### API-IAM-013: Mark Notification Read

| Method / Path | `PATCH /users/me/notifications/{id}/read` |
| Auth | Bearer JWT |

**Response 200:** Updated notification

---

### API-IAM-014: Deactivate Own Account

| Method / Path | `DELETE /users/me` |
| Auth | Bearer JWT |
| Traces To | FR-IAM-012 |

**Response 200:** Account deactivated. **Errors:** 403 FORBIDDEN (active appointments may block — business rule TBD)

---

## 6. Module: Admin (IAM)

Base path: `/admin`

---

### API-ADM-001: List Users

| Method / Path | `GET /admin/users` |
| Auth | Bearer JWT |
| Permission | `admin:user:read` |
| Traces To | FR-IAM-011 |

**Query:** `email`, `name`, `role`, `status`, `page`, `size`, `sort`  
**Response 200:** Paginated user list

---

### API-ADM-002: Get User by ID

| Method / Path | `GET /admin/users/{userId}` |
| Permission | `admin:user:read` |

---

### API-ADM-003: Update User Status

| Method / Path | `PATCH /admin/users/{userId}/status` |
| Permission | `admin:user:write` |

**Request:** `{ "status": "ACTIVE|DEACTIVATED|LOCKED" }`

---

### API-ADM-004: Assign Role

| Method / Path | `POST /admin/users/{userId}/roles` |
| Permission | `admin:role:write` |

**Request:** `{ "roleId": "uuid" }`

---

### API-ADM-005: Revoke Role

| Method / Path | `DELETE /admin/users/{userId}/roles/{roleId}` |
| Permission | `admin:role:write` |

---

### API-ADM-006: List Roles

| Method / Path | `GET /admin/roles` |
| Permission | `admin:role:read` |

---

### API-ADM-007: Search Audit Logs

| Method / Path | `GET /admin/audit-logs` |
| Permission | `admin:audit:read` |
| Traces To | FR-IAM-010 |

**Query:** `userId`, `action`, `entityType`, `entityId`, `fromDate`, `toDate`, `page`, `size`  
**Response 200:** Paginated audit log entries

---

### API-ADM-008: Get Audit Log by ID

| Method / Path | `GET /admin/audit-logs/{id}` |
| Permission | `admin:audit:read` |

---

## 7. Module: Patient

Base path: `/patients`

---

### API-PAT-001: Get My Patient Profile

| Method / Path | `GET /patients/me/profile` |
| Auth | Bearer JWT |
| Permission | `patient:profile:read` |
| Traces To | FR-PAT-001 |

**Response 200:** Full PatientProfileResponseDto (all sections + completionScore)

---

### API-PAT-002: Accept Health Data Consent

| Method / Path | `POST /patients/me/profile/consent` |
| Permission | `patient:profile:write` |

**Request:** `{ "accepted": true }`  
**Response 200:** Profile created/updated with consent timestamp

---

### API-PAT-003: Update Basic Information

| Method / Path | `PUT /patients/me/profile/basic-info` |
| Permission | `patient:profile:write` |
| Traces To | FR-PAT-002 |

**Request:**

```json
{
  "dateOfBirth": "1994-05-15",
  "gender": "FEMALE",
  "bloodGroup": "B_POSITIVE",
  "maritalStatus": "SINGLE",
  "nationality": "IN",
  "profilePhotoUrl": "https://..."
}
```

**Validation:** DOB not future [BR-PAT-001], gender enum  
**Response 200:** Updated section + new completionScore

---

### API-PAT-004: Update Contact Information

| Method / Path | `PUT /patients/me/profile/contact-info` |
| Traces To | FR-PAT-003 |

**Request:** primaryPhone, secondaryPhone, permanentAddress (AddressDto), currentAddress, sameAsPermanentAddress

---

### API-PAT-005: Update Physical Measurements

| Method / Path | `PUT /patients/me/profile/physical-measurements` |
| Traces To | FR-PAT-004 |

**Request:** heightCm, weightKg, waistCm, hipCm, neckCm, bodyFatPercent, measuredAt  
**Validation:** height 30–300 [BR-PAT-002], weight 1–500 [BR-PAT-003]  
**Side Effect:** Appends to measurement history; triggers analytics recalculation

---

### API-PAT-006: Get Physical Measurement History

| Method / Path | `GET /patients/me/profile/physical-measurements/history` |
| Query | page, size, sort=measuredAt,desc |

---

### API-PAT-007: Update Lifestyle Profile

| Method / Path | `PUT /patients/me/profile/lifestyle` |
| Traces To | FR-PAT-006 |

**Request:** smokingStatus, smokingFrequency, alcoholConsumption, exerciseFrequency, exerciseType, exerciseDurationMinutes, occupationType, averageSleepHours, dietaryPreference, stressLevel

---

### API-PAT-008: Update Health Goals

| Method / Path | `PUT /patients/me/profile/goals` |
| Traces To | FR-PAT-011 |

---

### API-PAT-009: CRUD Allergies

| Endpoints | |
|-----------|--|
| List | `GET /patients/me/profile/allergies` |
| Create | `POST /patients/me/profile/allergies` |
| Update | `PUT /patients/me/profile/allergies/{id}` |
| Delete | `DELETE /patients/me/profile/allergies/{id}` |

**Traces To:** FR-PAT-005

---

### API-PAT-010: CRUD Medications

Base: `/patients/me/profile/medications` — same CRUD pattern

---

### API-PAT-011: CRUD Surgeries

Base: `/patients/me/profile/surgeries`

---

### API-PAT-012: CRUD Vaccinations

Base: `/patients/me/profile/vaccinations`

---

### API-PAT-013: CRUD Chronic Conditions

Base: `/patients/me/profile/chronic-conditions`

---

### API-PAT-014: CRUD Emergency Contacts

Base: `/patients/me/profile/emergency-contacts`  
**Validation:** Max 5 contacts; one primary [FR-PAT-007]

---

### API-PAT-015: CRUD Family Members

Base: `/patients/me/profile/family-members`

---

### API-PAT-016: Record Vital Signs

| Method / Path | `POST /patients/me/profile/vitals` |
| Traces To | FR-PAT-009 |

**Request:**

```json
{
  "systolicBp": 120,
  "diastolicBp": 80,
  "heartRate": 72,
  "temperature": 36.6,
  "respiratoryRate": 16,
  "spo2": 98,
  "bloodGlucose": 95.0,
  "glucoseReadingType": "FASTING",
  "recordedAt": "2026-07-29T06:00:00Z"
}
```

**Note:** Append-only [BR-PAT-004] — no PUT/DELETE  
**Response 201:** Created vital record + BP classification

---

### API-PAT-017: Get Vital Signs History

| Method / Path | `GET /patients/me/profile/vitals` |
| Query | fromDate, toDate, page, size |

---

### API-PAT-018: Record Lab Values

| Method / Path | `POST /patients/me/profile/lab-values` |
| Traces To | FR-PAT-010 |

**Request:** hba1c, totalCholesterol, hdl, ldl, triglycerides, hemoglobin, vitaminD, tsh, creatinine, recordedAt  
**Note:** Append-only

---

### API-PAT-019: Get Lab Values History

| Method / Path | `GET /patients/me/profile/lab-values` |

---

### API-PAT-020: Upload Health Document

| Method / Path | `POST /patients/me/profile/documents` |
| Content-Type | `multipart/form-data` |
| Traces To | FR-PAT-012 |

**Form Fields:** file (required), category, title, description  
**Validation:** Max 10 MB [BR-PAT-005], PDF/JPEG/PNG/DICOM [BR-PAT-006]  
**Response 201:** `{ id, fileName, category, title, uploadedAt, downloadUrl }`  
**Errors:** 413 FILE_TOO_LARGE, 400 VALIDATION_ERROR

---

### API-PAT-021: List Health Documents

| Method / Path | `GET /patients/me/profile/documents` |
| Query | category, page, size |

---

### API-PAT-022: Get Document Download URL

| Method / Path | `GET /patients/me/profile/documents/{id}/download-url` |
| Response | Pre-signed S3 URL (15 min expiry) [NFR-SEC-026] |

---

### API-PAT-023: Delete Health Document

| Method / Path | `DELETE /patients/me/profile/documents/{id}` |
| Action | Soft delete |

---

### API-PAT-024: Get Health Timeline

| Method / Path | `GET /patients/me/profile/timeline` |
| Traces To | FR-PAT-013 |
| Query | page, size (default 20) |

**Response 200:** Paginated timeline events with eventType, summary, metadata, occurredAt

---

### API-PAT-025: Get Profile Completion Score

| Method / Path | `GET /patients/me/profile/completion` |
| Traces To | FR-PAT-014 |

**Response 200:**

```json
{
  "completionScore": 72,
  "sections": [
    { "name": "BASIC_INFO", "weight": 15, "completed": true },
    { "name": "VITALS", "weight": 10, "completed": false, "missingFields": ["At least one vital recording"] }
  ]
}
```

---

### API-PAT-026: Get Patient Summary (Doctor — Limited)

| Method / Path | `GET /patients/{patientId}/summary` |
| Auth | Bearer JWT |
| Permission | `patient:summary:read` |
| Role | DOCTOR |
| Traces To | FR-PAT-015 |

**Precondition:** Active appointment window [BR-AUTH-007]  
**Response 200:** Limited summary (allergies, medications, conditions, latest vitals/labs)  
**Errors:** 403 FORBIDDEN (no valid appointment relationship)

---

## 8. Module: Doctor

Base path: `/doctors`

---

### API-DOC-001: Get My Doctor Profile

| Method / Path | `GET /doctors/me/profile` |
| Permission | `doctor:profile:read` |
| Traces To | FR-DOC-001 |

---

### API-DOC-002: Update Professional Details

| Method / Path | `PUT /doctors/me/profile/professional-details` |
| Permission | `doctor:profile:write` |
| Traces To | FR-DOC-002 |

**Request:** title, medicalRegistrationNumber, registrationCouncil, registrationYear, registrationExpiry, gender  
**Errors:** 409 DUPLICATE_REGISTRATION

---

### API-DOC-003: CRUD Qualifications

Base: `/doctors/me/profile/qualifications`

---

### API-DOC-004: CRUD Experience Entries

Base: `/doctors/me/profile/experience`

---

### API-DOC-005: Update Specialization

| Method / Path | `PUT /doctors/me/profile/specialization` |
| Traces To | FR-DOC-005 |

**Request:** `{ "primarySpecializationId": "uuid", "subSpecializationIds": ["uuid"] }`

---

### API-DOC-006: CRUD Languages

| Method / Path | `POST/DELETE /doctors/me/profile/languages` |
| Request | `{ "languageCode": "hi" }` |

---

### API-DOC-007: Update Biography

| Method / Path | `PUT /doctors/me/profile/biography` |
| Request | `{ "biography": "string (max 2000)" }` |

---

### API-DOC-008: CRUD Awards & Memberships

Base: `/doctors/me/profile/awards`, `/doctors/me/profile/memberships`

---

### API-DOC-009: List My Hospital Associations

| Method / Path | `GET /doctors/me/hospital-associations` |
| Traces To | FR-DOC-007 |

---

### API-DOC-010: Create Hospital Association

| Method / Path | `POST /doctors/me/hospital-associations` |
| Request | `{ "hospitalId", "branchId", "departmentId" }` |

---

### API-DOC-011: Update Consultation Config

| Method / Path | `PUT /doctors/me/hospital-associations/{associationId}/consultation-configs` |
| Traces To | FR-DOC-008 |

**Request:** Array of `{ consultationType, feeAmount, currency, durationMinutes }`

---

### API-DOC-012: Upload Verification Document

| Method / Path | `POST /doctors/me/profile/verification-documents` |
| Content-Type | multipart/form-data |
| Traces To | FR-DOC-010 |

---

### API-DOC-013: Submit for Verification

| Method / Path | `POST /doctors/me/profile/submit-verification` |
| Traces To | FR-DOC-011 |

**Response 200:** status PENDING_VERIFICATION  
**Errors:** 422 VERIFICATION_INCOMPLETE (lists missing items)

---

### API-DOC-014: Get Public Doctor Profile

| Method / Path | `GET /doctors/{doctorId}/public` |
| Auth | Public |
| Traces To | FR-DOC-013 |

**Response 200:** Public profile (no registration number, no contact)  
**Note:** Only VERIFIED doctors returned in search; direct ID access may 404 if unverified

---

### API-DOC-015: Search Doctors (see Search module)

Redirect: API-SRH-001

---

### API-DOC-016: Get Doctor Reviews

| Method / Path | `GET /doctors/{doctorId}/reviews` |
| Auth | Public |
| Query | page, size, sort=createdAt,desc |

---

### API-DOC-017: Get Doctor Availability

| Method / Path | `GET /doctors/{doctorId}/availability` |
| Auth | Public (booking requires auth) |
| Traces To | FR-SCH-003 |

**Query:** hospitalId (required), fromDate, toDate  
**Response 200:** Calendar with available/booked/blocked slots per day

---

### API-ADM-DOC-001: List Pending Verifications

| Method / Path | `GET /admin/doctors/verifications` |
| Permission | `admin:doctor:verify` |
| Query | status=PENDING_VERIFICATION, page, size |

---

### API-ADM-DOC-002: Approve Doctor Verification

| Method / Path | `POST /admin/doctors/{doctorId}/verify/approve` |
| Permission | `admin:doctor:verify` |
| Traces To | FR-DOC-012 |

---

### API-ADM-DOC-003: Reject Doctor Verification

| Method / Path | `POST /admin/doctors/{doctorId}/verify/reject` |
| Request | `{ "reason": "string (required)" }` |

---

### API-ADM-DOC-004: View Verification Documents

| Method / Path | `GET /admin/doctors/{doctorId}/verification-documents` |
| Permission | `admin:doctor:verify` |

---

## 9. Module: Hospital

Base path: `/hospitals`

---

### API-HOS-001: Get My Hospital Profile

| Method / Path | `GET /hospitals/me/profile` |
| Permission | `hospital:profile:read` |
| Role | HOSPITAL_ADMIN |

---

### API-HOS-002: Create Hospital Profile

| Method / Path | `POST /hospitals/me/profile` |
| Permission | `hospital:profile:write` |
| Traces To | FR-HOS-001 |

**Request:** name, registrationNumber, hospitalType, establishedYear, totalBedCount, accreditation, description  
**Errors:** 409 DUPLICATE_REGISTRATION

---

### API-HOS-003: Update Hospital Profile

| Method / Path | `PUT /hospitals/me/profile` |

---

### API-HOS-004: CRUD Branches

| Endpoints | |
|-----------|--|
| List | `GET /hospitals/me/branches` |
| Create | `POST /hospitals/me/branches` |
| Update | `PUT /hospitals/me/branches/{branchId}` |
| Delete | `DELETE /hospitals/me/branches/{branchId}` |

**Create Request:** name, address (AddressDto), latitude, longitude, phone, email, isPrimary, workingHours[]  
**Traces To:** FR-HOS-002

---

### API-HOS-005: CRUD Departments

Base: `/hospitals/me/departments`

---

### API-HOS-006: CRUD Facilities

Base: `/hospitals/me/facilities`

---

### API-HOS-007: List Associated Doctors

| Method / Path | `GET /hospitals/me/doctors` |
| Traces To | FR-HOS-005 |

---

### API-HOS-008: Associate Doctor with Hospital

| Method / Path | `POST /hospitals/me/doctors` |
| Request | `{ "doctorId", "branchId", "departmentId" }` |

---

### API-HOS-009: Remove Doctor Association

| Method / Path | `DELETE /hospitals/me/doctors/{associationId}` |

---

### API-HOS-010: Update Emergency & ICU Info

| Method / Path | `PUT /hospitals/me/profile/emergency-info` |
| Traces To | FR-HOS-006 |

**Request:** emergencyAvailable24x7, emergencyPhone, ambulanceAvailable, icuAvailable, icuBedCount, icuType

---

### API-HOS-011: Upload Gallery Image

| Method / Path | `POST /hospitals/me/gallery` |
| Content-Type | multipart/form-data |
| Validation | Max 20 images, 5 MB each [BR-HOS-004] |

---

### API-HOS-012: Delete Gallery Image

| Method / Path | `DELETE /hospitals/me/gallery/{imageId}` |

---

### API-HOS-013: Get Public Hospital Profile

| Method / Path | `GET /hospitals/{hospitalId}/public` |
| Auth | Public |
| Traces To | FR-HOS-008 |

**Response 200:** Full public profile with branches, departments, facilities, doctors, gallery, ratings

---

### API-HOS-014: Get Hospital Reviews

| Method / Path | `GET /hospitals/{hospitalId}/reviews` |
| Auth | Public |

---

### API-HOS-015: List Doctors at Hospital (Public)

| Method / Path | `GET /hospitals/{hospitalId}/doctors` |
| Auth | Public |
| Query | departmentId, specialization, page, size |

---

## 10. Module: Scheduling

Base path: `/scheduling`

---

### API-SCH-001: Get My Schedule Templates

| Method / Path | `GET /scheduling/doctors/me/schedules` |
| Permission | `schedule:read` |
| Role | DOCTOR |
| Traces To | FR-SCH-001 |

---

### API-SCH-002: Create Schedule Template

| Method / Path | `POST /scheduling/doctors/me/schedules` |
| Permission | `schedule:write` |

**Request:**

```json
{
  "hospitalId": "uuid",
  "branchId": "uuid",
  "slotDurationMinutes": 15,
  "bufferMinutes": 5,
  "scheduleBlocks": [
    {
      "dayOfWeek": "MONDAY",
      "startTime": "09:00",
      "endTime": "17:00",
      "consultationType": "IN_PERSON",
      "isActive": true
    }
  ]
}
```

**Errors:** 400 VALIDATION_ERROR (overlapping blocks)

---

### API-SCH-003: Update Schedule Template

| Method / Path | `PUT /scheduling/doctors/me/schedules/{scheduleId}` |

---

### API-SCH-004: Block Time Slots

| Method / Path | `POST /scheduling/doctors/me/schedules/{scheduleId}/block` |
| Traces To | FR-SCH-009 |

**Request:** `{ "fromDate": "2026-08-01", "toDate": "2026-08-05", "reason": "Leave" }`

---

### API-SCH-005: Book Appointment

| Method / Path | `POST /scheduling/appointments` |
| Permission | `appointment:book` |
| Role | PATIENT |
| Traces To | FR-SCH-004 |

**Request:**

```json
{
  "doctorId": "uuid",
  "hospitalId": "uuid",
  "branchId": "uuid",
  "slotId": "uuid",
  "consultationType": "IN_PERSON",
  "reasonForVisit": "Chest pain consultation"
}
```

**Response 201:**

```json
{
  "success": true,
  "data": {
    "appointmentId": "uuid",
    "status": "CONFIRMED",
    "doctor": { "id", "name", "specialization" },
    "hospital": { "id", "name", "branchName" },
    "scheduledAt": "2026-08-15T04:30:00Z",
    "consultationType": "IN_PERSON",
    "consultationFee": { "amount": 500.00, "currency": "INR" }
  }
}
```

**Errors:** 409 SLOT_UNAVAILABLE, 409 DUPLICATE_APPOINTMENT, 400 (unverified doctor)

---

### API-SCH-006: Get My Appointments (Patient)

| Method / Path | `GET /scheduling/appointments/me` |
| Permission | `appointment:view:own` |
| Query | status, fromDate, toDate, page, size |

---

### API-SCH-007: Get My Appointments (Doctor)

| Method / Path | `GET /scheduling/doctors/me/appointments` |
| Permission | `appointment:view:own` |
| Query | status, fromDate, toDate, patientId, page, size |

---

### API-SCH-008: Get Appointment by ID

| Method / Path | `GET /scheduling/appointments/{appointmentId}` |
| Permission | Owner (patient/doctor) or admin |

---

### API-SCH-009: Cancel Appointment

| Method / Path | `POST /scheduling/appointments/{appointmentId}/cancel` |
| Traces To | FR-SCH-005 |

**Request:** `{ "reason": "string (optional)" }`  
**Errors:** 400 CANCELLATION_NOT_ALLOWED

---

### API-SCH-010: Reschedule Appointment

| Method / Path | `POST /scheduling/appointments/{appointmentId}/reschedule` |
| Traces To | FR-SCH-006 |

**Request:** `{ "newSlotId": "uuid" }`  
**Response 200:** New appointment details + link to original

---

### API-SCH-011: Mark Appointment Completed

| Method / Path | `POST /scheduling/appointments/{appointmentId}/complete` |
| Role | DOCTOR |
| Traces To | FR-SCH-007 |

---

### API-SCH-012: Mark Appointment No-Show

| Method / Path | `POST /scheduling/appointments/{appointmentId}/no-show` |
| Role | DOCTOR, PLATFORM_ADMIN |

---

## 11. Module: Location

Base path: `/location`

---

### API-LOC-001: Nearby Hospitals

| Method / Path | `GET /location/nearby/hospitals` |
| Auth | Public |
| Traces To | FR-LOC-003 |

**Query:** latitude, longitude, radiusKm (default 5, max 50), department, emergency24x7, minRating, page, size, sort

**Response 200:** Paginated hospitals with distanceKm, nearest branch info

---

### API-LOC-002: Nearby Doctors

| Method / Path | `GET /location/nearby/doctors` |
| Auth | Public |
| Traces To | FR-LOC-004 |

**Query:** latitude, longitude, radiusKm, specialization, availableDate, page, size, sort

---

### API-LOC-003: Calculate Distance & Travel Time

| Method / Path | `GET /location/distance` |
| Auth | Public |
| Traces To | FR-LOC-005 |

**Query:** originLat, originLng, destLat, destLng  
**Response 200:** `{ distanceKm, travelTimeMinutes, travelMode: "DRIVING" }`

---

### API-LOC-004: Geocode Address

| Method / Path | `POST /location/geocode` |
| Auth | Bearer JWT |
| Permission | Authenticated |

**Request:** `{ "address": "AddressDto or free text" }`  
**Response 200:** GeoCoordinateDto + formattedAddress

---

## 12. Module: Search

Base path: `/search`

---

### API-SRH-001: Unified Search

| Method / Path | `GET /search` |
| Auth | Public |
| Traces To | FR-SRH-001 |

**Query:** q (free text), type (DOCTOR|HOSPITAL|ALL), latitude, longitude, page, size, sort, + filter params

---

### API-SRH-002: Search Doctors

| Method / Path | `GET /search/doctors` |
| Auth | Public |
| Traces To | FR-SRH-002 |

**Query Filters:**

| Param | Type | Description |
|-------|------|-------------|
| q | string | Free text |
| specialization | string | Taxonomy code |
| subSpecialization | string | |
| minExperience | integer | Years |
| maxDistance | decimal | km (requires lat/lng) |
| availableDate | date | Has slots on date |
| minRating | decimal | 1–5 |
| maxFee | decimal | |
| gender | enum | |
| language | string | ISO 639-1 |
| hospitalId | uuid | |
| latitude, longitude | decimal | For distance sort |

**Sort:** NEAREST, HIGHEST_RATED, MOST_EXPERIENCED, LOWEST_FEE, RELEVANCE (default)

**Response 200:** Paginated DoctorSearchResultDto with id, name, specialization, experience, rating, fee, distance, availabilityPreview

---

### API-SRH-003: Search Hospitals

| Method / Path | `GET /search/hospitals` |
| Auth | Public |
| Traces To | FR-SRH-003 |

**Query Filters:** q, department, facility, maxDistance, minRating, emergency24x7, icuAvailable, latitude, longitude  
**Sort:** NEAREST, HIGHEST_RATED, RELEVANCE

---

### API-SRH-004: Get Specializations Taxonomy

| Method / Path | `GET /search/specializations` |
| Auth | Public |

**Response 200:** Hierarchical specialization list for filter dropdowns

---

## 13. Module: Health Analytics

Base path: `/analytics`

---

### API-ANL-001: Get Health Dashboard

| Method / Path | `GET /analytics/patients/me/dashboard` |
| Permission | `dashboard:view` |
| Role | PATIENT |
| Traces To | FR-ANL-001 |

**Response 200:**

```json
{
  "completionScore": 72,
  "wellnessScore": { "score": 78, "label": "GOOD" },
  "healthRiskScore": { "score": 32, "label": "MODERATE" },
  "metrics": [
    {
      "metricType": "BMI",
      "value": 23.5,
      "unit": "kg/m²",
      "classification": "NORMAL",
      "interpretation": "Your BMI is within the healthy range.",
      "disclaimer": "This is not a medical diagnosis..."
    }
  ],
  "goalsProgress": [],
  "recentVitalsTrend": [],
  "recentTimeline": []
}
```

---

### API-ANL-002: Get All Calculated Metrics

| Method / Path | `GET /analytics/patients/me/metrics` |
| Traces To | FR-ANL-002 |

**Response 200:** Array of all CalculatedMetricDto (including INSUFFICIENT_DATA entries)

---

### API-ANL-003: Get Single Metric

| Method / Path | `GET /analytics/patients/me/metrics/{metricType}` |
| Example | `/analytics/patients/me/metrics/BMI` |

---

### API-ANL-004: Get Metric History (Trend)

| Method / Path | `GET /analytics/patients/me/metrics/{metricType}/history` |
| Traces To | FR-ANL-007 |
| Query | fromDate, toDate, page, size |

**Note:** Requires ≥ 2 data points for trend [BR-ANL-006]

---

### API-ANL-005: Get Latest Metrics Snapshot

| Method / Path | `GET /analytics/patients/me/snapshots/latest` |

---

### API-ANL-006: List Metrics Snapshots

| Method / Path | `GET /analytics/patients/me/snapshots` |
| Query | page, size |

---

### API-ANL-007: Export Health Report (PDF)

| Method / Path | `GET /analytics/patients/me/report/pdf` |
| Traces To | FR-ANL-008 |
| Response | `application/pdf` binary stream |
| Priority | P2 |

---

### API-ANL-008: Trigger Manual Recalculation

| Method / Path | `POST /analytics/patients/me/recalculate` |
| Permission | `dashboard:view` |
| Note | Normally automatic on profile update; manual trigger for debugging/support |

---

## 14. Module: Reviews

Base path: `/reviews`

---

### API-REV-001: Submit Doctor Review

| Method / Path | `POST /reviews/doctors` |
| Permission | `review:create` |
| Role | PATIENT |
| Traces To | FR-REV-001 |

**Request:**

```json
{
  "appointmentId": "uuid",
  "rating": 5,
  "comment": "Excellent consultation, very thorough."
}
```

**Validation:** Completed appointment, within 30 days [BR-REV-001], one per appointment [BR-REV-003], rating 1–5, comment max 1000 chars  
**Errors:** 409 DUPLICATE_REVIEW, 400 VALIDATION_ERROR

---

### API-REV-002: Submit Hospital Review

| Method / Path | `POST /reviews/hospitals` |
| Same validation as API-REV-001 |

---

### API-REV-003: Delete Own Review

| Method / Path | `DELETE /reviews/{reviewId}` |
| Role | PATIENT (own review) |

---

### API-ADM-REV-001: Moderate Review

| Method / Path | `POST /admin/reviews/{reviewId}/moderate` |
| Permission | `admin:review:moderate` |
| Traces To | FR-REV-002 |

**Request:** `{ "action": "HIDE|REMOVE", "reason": "string" }`

---

## 15. API Endpoint Summary

| Module | Endpoints | Public | Authenticated | Admin |
|--------|-----------|--------|---------------|-------|
| IAM / Auth | 14 | 5 | 9 | 0 |
| Admin | 12 | 0 | 0 | 12 |
| Patient | 26 | 0 | 26 | 0 |
| Doctor | 18 | 3 | 12 | 3 |
| Hospital | 15 | 3 | 12 | 0 |
| Scheduling | 12 | 0 | 12 | 0 |
| Location | 4 | 3 | 1 | 0 |
| Search | 4 | 4 | 0 | 0 |
| Analytics | 8 | 0 | 8 | 0 |
| Reviews | 4 | 0 | 3 | 1 |
| **Total** | **117** | **18** | **83** | **16** |

---

## 16. Authorization Matrix (Summary)

| Resource | Patient | Doctor | Hospital Admin | Platform Admin | Guest |
|----------|---------|--------|----------------|----------------|-------|
| Own profile | RW | RW | RW | R | — |
| Patient health data | RW | R* | — | R | — |
| Doctor profile | R | RW | R | RW | R (public) |
| Hospital profile | R | R | RW | RW | R (public) |
| Book appointment | W | — | — | — | — |
| Manage schedule | — | RW | — | R | — |
| Health dashboard | R | — | — | R | — |
| Search | R | R | R | R | R |
| Submit review | W | — | — | — | — |
| Verify doctor | — | — | — | W | — |
| Audit logs | — | — | — | R | — |

*Doctor read limited to appointment window [FR-PAT-015]

---

## 17. OpenAPI & Swagger

| Item | Specification |
|------|--------------|
| OpenAPI version | 3.0.3 |
| Swagger UI path | `/swagger-ui.html` |
| OpenAPI JSON | `/v3/api-docs` |
| Generation | springdoc-openapi (runtime from annotations) |
| Grouping | Tags per module (Auth, Patient, Doctor, etc.) |
| Security scheme | `bearerAuth` (HTTP Bearer JWT) |

---

## 18. Requirements Traceability

| API ID | FR Reference | DB Table [DOC-06] |
|--------|-------------|-------------------|
| API-IAM-004 | FR-IAM-003 | iam.users, iam.refresh_tokens |
| API-PAT-016 | FR-PAT-009 | patient.vital_sign_records |
| API-SCH-005 | FR-SCH-004 | scheduling.appointments, scheduling.time_slots |
| API-SRH-002 | FR-SRH-002 | doctor.doctor_profiles |
| API-ANL-001 | FR-ANL-001 | analytics.health_metrics_snapshots |
| API-REV-001 | FR-REV-001 | doctor.doctor_reviews |
| API-LOC-001 | FR-LOC-003 | hospital.branches |

---

## 19. Approval

| Role | Name | Signature | Date | Status |
|------|------|-----------|------|--------|
| Product Owner | _________________ | _________________ | ________ | Pending |
| Technical Lead / Architect | _________________ | _________________ | ________ | Pending |
| Engineering Lead | _________________ | _________________ | ________ | Pending |
| QA Lead | _________________ | _________________ | ________ | Pending |

---

*End of DOC-07 — REST API Design Specification v1.0*
