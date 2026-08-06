# DOC-03: Health360 AI — Functional Requirements Specification (FRS)

| Attribute | Value |
|-----------|-------|
| **Document ID** | DOC-03 |
| **Title** | Functional Requirements Specification |
| **Version** | 1.0 |
| **Status** | **Approved** |
| **Date** | 2026-07-27 |
| **Author** | Senior Business Analyst / Technical Lead |
| **References** | [DOC-00] Project Memory, [DOC-01] Vision & Scope Charter, [DOC-02] Business Requirements Document |
| **Next Document** | [DOC-04] Non-Functional Requirements (NFR) |

---

## 1. Executive Summary

This Functional Requirements Specification (FRS) decomposes the business requirements defined in [DOC-02] into detailed, testable functional requirements for **Health360 AI Phase 1**. Each requirement specifies system behavior from the user's perspective — what the system shall do, under what conditions, with what inputs and outputs.

This document contains:

- **Functional Requirements (FR-XXX)** — atomic, testable system behaviors
- **Use Case Specifications (UC-XXX)** — detailed actor interactions for core flows
- **Acceptance Criteria (AC-XXX)** — conditions that must be met for requirement sign-off
- **Traceability** — every FR maps to a BRQ in [DOC-02] and a strategic objective in [DOC-01]

Detailed validation rules, error codes, and API contracts are specified in [DOC-09] and [DOC-07] respectively. UI screen details are in [DOC-10].

---

## 2. Document Conventions

### 2.1 Requirement ID Format

| Prefix | Domain |
|--------|--------|
| FR-IAM-XXX | Identity & Access Management |
| FR-PAT-XXX | Patient Domain |
| FR-DOC-XXX | Doctor Domain |
| FR-HOS-XXX | Hospital Domain |
| FR-SCH-XXX | Scheduling Domain |
| FR-LOC-XXX | Location Domain |
| FR-ANL-XXX | Health Analytics Domain |
| FR-SRH-XXX | Search & Discovery |
| FR-REV-XXX | Reviews & Ratings |
| FR-NTF-XXX | Notifications (Cross-cutting) |

### 2.2 Priority Levels

| Priority | Meaning |
|----------|---------|
| P0 | Must Have — Phase 1 launch blocker |
| P1 | Should Have — Phase 1 launch target |
| P2 | Could Have — Phase 1 if capacity allows |

### 2.3 Requirement Template

Each detailed FR follows:

```
ID, Title, Priority, Actors, Description, Preconditions, Inputs,
Processing, Outputs, Postconditions, Business Rules, Acceptance Criteria,
Traces To (BRQ)
```

---

## 3. System Actors

| Actor | Description | Authentication |
|-------|-------------|----------------|
| **Guest** | Unauthenticated visitor | None |
| **Patient** | Registered patient user | JWT required |
| **Doctor** | Registered doctor user | JWT required |
| **Hospital Admin** | Hospital facility administrator | JWT required |
| **Platform Admin** | Health360 operations administrator | JWT required |
| **System** | Automated background processes | Internal |

---

## 4. Module 01: Identity & Access Management

### 4.1 Functional Requirements

---

#### FR-IAM-001: User Registration

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Guest |
| **Traces To** | BRQ-IAM-001, BRQ-IAM-011 |

**Description:** The system shall allow a guest to register a new account by providing email, password, full name, phone number, and role selection (Patient or Doctor).

**Preconditions:**
- Email address is not already registered
- User accepts Terms of Service and Privacy Policy

**Inputs:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | Yes | Valid email format, unique |
| password | string | Yes | [BR-AUTH-004] min 8 chars, complexity rules |
| confirmPassword | string | Yes | Must match password |
| firstName | string | Yes | 1–100 chars |
| lastName | string | Yes | 1–100 chars |
| phone | string | Yes | E.164 or Indian 10-digit format |
| role | enum | Yes | PATIENT or DOCTOR |
| acceptTerms | boolean | Yes | Must be true |
| tenantId | UUID | Auto | Default tenant assigned [ASM-010] |

**Processing:**
1. Validate all input fields
2. Hash password (bcrypt, cost factor ≥ 12)
3. Create User record with status `PENDING_VERIFICATION`
4. Assign default role based on selection
5. Generate email verification token (expires 24 hours)
6. Send verification email
7. Log audit event: `USER_REGISTERED`

**Outputs:**
- HTTP 201: `{ userId, email, status: "PENDING_VERIFICATION", message }`
- Verification email sent

**Postconditions:**
- User record exists but cannot access protected features until email verified [BR-AUTH-001]

**Acceptance Criteria:**
- AC-IAM-001: Registration with valid data creates user and sends verification email
- AC-IAM-002: Duplicate email returns 409 Conflict with clear message
- AC-IAM-003: Weak password returns 400 with specific validation errors
- AC-IAM-004: Unverified user cannot access protected endpoints

---

#### FR-IAM-002: Email Verification

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Guest (via email link) |
| **Traces To** | BR-AUTH-001 |

**Description:** The system shall verify user email when user clicks verification link containing a valid token.

**Inputs:** `token` (string, from email link)

**Processing:**
1. Validate token exists and not expired
2. Update user status to `ACTIVE`
3. Invalidate verification token
4. Log audit event: `EMAIL_VERIFIED`

**Outputs:** Redirect to login page with success message

**Acceptance Criteria:**
- AC-IAM-005: Valid token activates account
- AC-IAM-006: Expired/invalid token returns error with resend option

---

#### FR-IAM-003: User Login

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Patient, Doctor, Hospital Admin, Platform Admin |
| **Traces To** | BRQ-IAM-002, BRQ-IAM-003 |

**Description:** The system shall authenticate users via email/password and issue JWT access token and refresh token.

**Inputs:**

| Field | Type | Required |
|-------|------|----------|
| email | string | Yes |
| password | string | Yes |
| deviceInfo | string | No |

**Processing:**
1. Lookup user by email
2. Check account not locked [BR-AUTH-005]
3. Verify password hash
4. On failure: increment failed attempt counter; lock at 5 attempts
5. On success: reset failed attempt counter
6. Generate access token (JWT, 15 min expiry) [BR-AUTH-002]
7. Generate refresh token (opaque, 7 day expiry), store hash in Redis
8. Log audit event: `USER_LOGIN_SUCCESS` or `USER_LOGIN_FAILED`

**Outputs:**

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "uuid...",
  "expiresIn": 900,
  "tokenType": "Bearer",
  "user": {
    "id": "uuid",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "roles": ["PATIENT"],
    "permissions": ["patient:profile:read", "..."]
  }
}
```

**Acceptance Criteria:**
- AC-IAM-007: Valid credentials return tokens and user profile
- AC-IAM-008: Invalid credentials return 401 without revealing which field failed
- AC-IAM-009: Locked account returns 423 with lockout duration
- AC-IAM-010: Unverified email returns 403 with verification prompt

---

#### FR-IAM-004: Token Refresh

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Authenticated User |
| **Traces To** | BRQ-IAM-003, BR-AUTH-003 |

**Description:** The system shall issue a new access token and rotated refresh token when a valid refresh token is presented.

**Processing:**
1. Validate refresh token exists in Redis and not blacklisted
2. Invalidate old refresh token
3. Issue new access token + new refresh token
4. Log audit event: `TOKEN_REFRESHED`

**Acceptance Criteria:**
- AC-IAM-011: Valid refresh token returns new token pair
- AC-IAM-012: Reused refresh token returns 401 (token rotation enforced)
- AC-IAM-013: Expired refresh token returns 401 requiring re-login

---

#### FR-IAM-005: User Logout

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Authenticated User |
| **Traces To** | BRQ-IAM-008 |

**Description:** The system shall invalidate the current refresh token and optionally blacklist the access token.

**Processing:**
1. Remove refresh token from Redis
2. Blacklist access token JTI in Redis until natural expiry
3. Log audit event: `USER_LOGOUT`

**Acceptance Criteria:**
- AC-IAM-014: After logout, refresh token cannot be used
- AC-IAM-015: After logout, access token returns 401

---

#### FR-IAM-006: Password Change

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Authenticated User |
| **Traces To** | BRQ-IAM-006, BR-AUTH-004 |

**Inputs:** currentPassword, newPassword, confirmPassword

**Processing:**
1. Verify current password
2. Validate new password meets complexity [BR-AUTH-004]
3. Update password hash
4. Invalidate all existing refresh tokens for user
5. Log audit event: `PASSWORD_CHANGED`

**Acceptance Criteria:**
- AC-IAM-016: Successful change invalidates all sessions
- AC-IAM-017: Wrong current password returns 400

---

#### FR-IAM-007: Role-Based Access Control

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | System |
| **Traces To** | BRQ-IAM-004, BRQ-IAM-005, ADR-005 |

**Description:** The system shall enforce RBAC on every protected endpoint. Permissions are checked against the authenticated user's role(s).

**Predefined Roles & Core Permissions:**

| Role | Key Permissions |
|------|----------------|
| PATIENT | patient:profile:*, appointment:book, appointment:cancel, appointment:view:own, search:*, review:create, dashboard:view |
| DOCTOR | doctor:profile:*, schedule:*, appointment:view:own, appointment:update:status, patient:summary:view:limited |
| HOSPITAL_ADMIN | hospital:profile:*, hospital:doctors:*, hospital:departments:*, hospital:branches:* |
| PLATFORM_ADMIN | admin:*, doctor:verify, user:manage, audit:view |

**Acceptance Criteria:**
- AC-IAM-018: Patient cannot access doctor-only endpoints (403)
- AC-IAM-019: Doctor cannot access hospital admin endpoints (403)
- AC-IAM-020: Platform Admin can access all admin endpoints

---

#### FR-IAM-008: Account Profile Settings

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Authenticated User |
| **Traces To** | BRQ-IAM-006 |

**Description:** Users shall update account-level settings: name, phone, avatar, timezone, locale.

**Inputs:** firstName, lastName, phone, avatarUrl, timezone (default `Asia/Kolkata`), locale (default `en-IN`)

**Acceptance Criteria:**
- AC-IAM-021: Profile updates persist and reflect immediately
- AC-IAM-022: Email change requires re-verification (separate flow)

---

#### FR-IAM-009: Notification Preferences

| Attribute | Detail |
|-----------|--------|
| **Priority** | P1 |
| **Actors** | Authenticated User |
| **Traces To** | BRQ-IAM-007 |

**Description:** Users shall configure notification channel preferences per notification type.

**Preference Matrix:**

| Notification Type | Email | SMS | In-App |
|--------------------|-------|-----|--------|
| Appointment Confirmation | configurable | configurable | always on |
| Appointment Reminder (24h) | configurable | configurable | always on |
| Appointment Reminder (1h) | configurable | configurable | always on |
| Appointment Cancellation | configurable | configurable | always on |
| Verification Status | configurable | off | always on |
| Review Prompt | configurable | off | always on |

**Acceptance Criteria:**
- AC-IAM-023: Disabled channel prevents notification on that channel
- AC-IAM-024: In-app notifications cannot be disabled

---

#### FR-IAM-010: Audit Log Recording

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | System |
| **Traces To** | BRQ-IAM-008, BRQ-IAM-009, ADR-010 |

**Description:** The system shall record immutable audit log entries for all security-sensitive and data-mutation events.

**Audit Log Fields:**

| Field | Description |
|-------|-------------|
| id | UUID |
| tenantId | UUID |
| userId | UUID (nullable for system events) |
| action | enum (e.g., USER_LOGIN, PROFILE_UPDATED, APPOINTMENT_BOOKED) |
| entityType | string (e.g., Patient, Appointment) |
| entityId | UUID |
| oldValue | JSON (nullable) |
| newValue | JSON (nullable) |
| ipAddress | string |
| userAgent | string |
| timestamp | datetime (UTC) |

**Acceptance Criteria:**
- AC-IAM-025: Every mutation API call generates an audit log entry
- AC-IAM-026: Audit logs are append-only (no update/delete via API)

---

#### FR-IAM-011: Platform Admin User Management

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Platform Admin |
| **Traces To** | BRQ-IAM-014 |

**Description:** Platform Admin shall list, search, view, deactivate, and reactivate user accounts. Assign/revoke roles.

**Acceptance Criteria:**
- AC-IAM-027: Admin can search users by email, name, role, status
- AC-IAM-028: Deactivated user cannot login (403)
- AC-IAM-029: Role assignment logged in audit trail

---

#### FR-IAM-012: Account Deactivation

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Patient, Doctor, Platform Admin |
| **Traces To** | BRQ-IAM-010, ASM-005 |

**Description:** Users may request account deactivation. Platform Admin may deactivate any account. Soft delete applied.

**Processing:**
1. Set user status to `DEACTIVATED`
2. Set `deletedAt` timestamp
3. Invalidate all refresh tokens
4. Retain all domain data for compliance retention period
5. Log audit event: `ACCOUNT_DEACTIVATED`

**Acceptance Criteria:**
- AC-IAM-030: Deactivated account data retained but inaccessible
- AC-IAM-031: Deactivated user excluded from search results

---

### 4.2 IAM Use Case: UC-001 Register & Verify Account

| Field | Detail |
|-------|--------|
| **Actors** | Guest |
| **Preconditions** | None |
| **Postconditions** | Active user account with assigned role |

**Main Flow:**
1. Guest navigates to registration page
2. Guest selects role (Patient or Doctor)
3. Guest fills registration form [FR-IAM-001]
4. System validates and creates account
5. System sends verification email
6. Guest clicks verification link [FR-IAM-002]
7. System activates account
8. Guest redirected to login

**Alternate Flows:**
- 3a. Validation fails → display field errors, remain on form
- 6a. Token expired → offer resend verification email

---

## 5. Module 02: Patient Domain

### 5.1 Functional Requirements

---

#### FR-PAT-001: Create Patient Profile

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Patient |
| **Traces To** | BRQ-PAT-001, BRQ-PAT-008, BR-PAT-008 |

**Description:** Upon first login, system creates an empty patient profile linked to the user account. Patient must accept health data processing consent before editing profile.

**Processing:**
1. Check health data consent accepted
2. Create PatientProfile record linked to userId
3. Initialize all sections as empty
4. Set profileCompletionScore = 0
5. Log audit event: `PATIENT_PROFILE_CREATED`

**Acceptance Criteria:**
- AC-PAT-001: Profile auto-created on first access after consent
- AC-PAT-002: Consent rejection prevents profile access

---

#### FR-PAT-002: Update Basic Information Section

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Patient |
| **Traces To** | BRQ-PAT-005 |

**Inputs:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| dateOfBirth | date | Yes | Not future; age ≥ 1 [BR-PAT-001] |
| gender | enum | Yes | MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY |
| bloodGroup | enum | No | A+, A-, B+, B-, AB+, AB-, O+, O- |
| maritalStatus | enum | No | SINGLE, MARRIED, DIVORCED, WIDOWED |
| nationality | string | No | ISO 3166-1 alpha-2, default IN |
| profilePhotoUrl | string | No | Valid URL |

**Processing:**
1. Validate inputs
2. Update BasicInformation section
3. Recalculate profileCompletionScore [BR-PAT-007]
4. Trigger formula engine recalculation [FR-ANL-012]
5. Add health timeline event: `PROFILE_SECTION_UPDATED`
6. Log audit event

**Acceptance Criteria:**
- AC-PAT-003: Section saves independently without requiring other sections
- AC-PAT-004: Completion score updates after save

---

#### FR-PAT-003: Update Contact Information Section

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Patient |
| **Traces To** | BRQ-PAT-006 |

**Inputs:**

| Field | Type | Required |
|-------|------|----------|
| primaryPhone | string | Yes |
| secondaryPhone | string | No |
| email | string | Yes (read-only from account) |
| permanentAddress | Address object | Yes |
| currentAddress | Address object | No |
| sameAsPermanentAddress | boolean | No |

**Address Object:** line1, line2, city, state, pincode (6-digit India), country

**Acceptance Criteria:**
- AC-PAT-005: "Same as permanent" copies permanent to current address
- AC-PAT-006: Invalid pincode returns validation error

---

#### FR-PAT-004: Update Physical Measurements Section

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Patient |
| **Traces To** | BRQ-PAT-007, BR-PAT-002, BR-PAT-003 |

**Inputs:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| heightCm | decimal | Yes | 30–300 cm [BR-PAT-002] |
| weightKg | decimal | Yes | 1–500 kg [BR-PAT-003] |
| waistCm | decimal | No | 20–300 cm |
| hipCm | decimal | No | 20–300 cm |
| neckCm | decimal | No | 15–100 cm |
| bodyFatPercent | decimal | No | 1–70% |
| measuredAt | datetime | Yes | Default: now |

**Processing:**
1. Save current measurements to profile
2. Append entry to physical measurements history
3. Trigger formula recalculation (BMI, BMR, WHR, etc.)

**Acceptance Criteria:**
- AC-PAT-007: Measurements history maintained with timestamps
- AC-PAT-008: BMI recalculated on weight/height change

---

#### FR-PAT-005: Manage Medical Information

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Patient |
| **Traces To** | BRQ-PAT-008 |

**Sub-entities (each supports CRUD list operations):**

**Allergies:** name, severity (MILD/MODERATE/SEVERE), reaction, diagnosedDate

**Current Medications:** name, dosage, frequency, route, startDate, endDate, prescribingDoctor

**Past Surgeries:** procedureName, surgeryDate, hospitalName, notes

**Vaccinations:** vaccineName, doseNumber, administeredDate, administeredBy

**Chronic Conditions:** conditionName, diagnosedDate, status (ACTIVE/MANAGED/RESOLVED), notes

**Acceptance Criteria:**
- AC-PAT-009: Each sub-entity supports add, edit, remove independently
- AC-PAT-010: Removing allergy logged in health timeline

---

#### FR-PAT-006: Update Lifestyle Profile

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Patient |
| **Traces To** | BRQ-PAT-009 |

**Inputs:**

| Field | Type | Values |
|-------|------|--------|
| smokingStatus | enum | NEVER, FORMER, CURRENT |
| smokingFrequency | enum | OCCASIONAL, DAILY (if CURRENT) |
| alcoholConsumption | enum | NEVER, OCCASIONAL, REGULAR |
| exerciseFrequency | enum | SEDENTARY, LIGHT, MODERATE, ACTIVE, VERY_ACTIVE |
| exerciseType | string | Free text |
| exerciseDurationMinutes | integer | Per session |
| occupationType | enum | SEDENTARY, MODERATE, PHYSICAL |
| averageSleepHours | decimal | 1–24 |
| dietaryPreference | enum | VEGETARIAN, NON_VEGETARIAN, VEGAN, MIXED |
| stressLevel | integer | 1–5 scale |

**Acceptance Criteria:**
- AC-PAT-011: Lifestyle update triggers Health Risk Score recalculation

---

#### FR-PAT-007: Manage Emergency Contacts

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Patient |
| **Traces To** | BRQ-PAT-010 |

**Inputs per contact:** name, relationship (enum + free text), phone, email, isPrimary (boolean)

**Business Rules:**
- Maximum 5 emergency contacts
- Exactly one must be marked primary if any exist

**Acceptance Criteria:**
- AC-PAT-012: Setting new primary demotes previous primary
- AC-PAT-013: Cannot delete last primary without assigning new primary

---

#### FR-PAT-008: Manage Family Members

| Attribute | Detail |
|-----------|--------|
| **Priority** | P1 |
| **Actors** | Patient |
| **Traces To** | BRQ-PAT-011 |

**Inputs per member:** name, relationship, dateOfBirth, gender, hereditaryConditions (array), isAlive (boolean)

**Acceptance Criteria:**
- AC-PAT-014: Family history contributes to Health Risk Score

---

#### FR-PAT-009: Record Vital Signs

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Patient |
| **Traces To** | BRQ-PAT-012, BRQ-PAT-013, BR-PAT-004 |

**Inputs:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| systolicBp | integer | No | 40–300 mmHg |
| diastolicBp | integer | No | 20–200 mmHg |
| heartRate | integer | No | 20–300 bpm |
| temperature | decimal | No | 30–45 °C |
| respiratoryRate | integer | No | 5–60 breaths/min |
| spo2 | integer | No | 50–100% |
| bloodGlucose | decimal | No | 20–600 mg/dL |
| glucoseReadingType | enum | Conditional | FASTING, RANDOM, POST_PRANDIAL (required if glucose provided) |
| recordedAt | datetime | Yes | Not future |

**Business Rules:** [BR-PAT-004] Vital records are append-only; corrections via new entry

**Acceptance Criteria:**
- AC-PAT-015: New vital record appended to history
- AC-PAT-016: BP classification calculated on save [FR-ANL-008]
- AC-PAT-017: Vital history displayed in chronological order with trend indicators

---

#### FR-PAT-010: Record Lab Values

| Attribute | Detail |
|-----------|--------|
| **Priority** | P1 |
| **Actors** | Patient |
| **Traces To** | BRQ-PAT-014 |

**Inputs:**

| Field | Type | Unit |
|-------|------|------|
| hba1c | decimal | % |
| totalCholesterol | decimal | mg/dL |
| hdl | decimal | mg/dL |
| ldl | decimal | mg/dL |
| triglycerides | decimal | mg/dL |
| hemoglobin | decimal | g/dL |
| vitaminD | decimal | ng/mL |
| tsh | decimal | mIU/L |
| creatinine | decimal | mg/dL |
| recordedAt | datetime | — |

**Acceptance Criteria:**
- AC-PAT-018: Lab values append-only with history
- AC-PAT-019: Lipid profile contributes to Health Risk Score

---

#### FR-PAT-011: Manage Health Goals

| Attribute | Detail |
|-----------|--------|
| **Priority** | P1 |
| **Actors** | Patient |
| **Traces To** | BRQ-PAT-015 |

**Inputs:** targetWeightKg, dailyStepsGoal, sleepHoursGoal, waterIntakeMlGoal, weeklyExerciseMinutesGoal

**Acceptance Criteria:**
- AC-PAT-020: Dashboard displays progress toward goals where applicable

---

#### FR-PAT-012: Upload Health Documents

| Attribute | Detail |
|-----------|--------|
| **Priority** | P1 |
| **Actors** | Patient |
| **Traces To** | BRQ-PAT-016, BR-PAT-005, BR-PAT-006 |

**Inputs:** file (binary), category (LAB_REPORT, PRESCRIPTION, SCAN, OTHER), title, description

**Processing:**
1. Validate file type [BR-PAT-006] and size [BR-PAT-005] max 10 MB
2. Upload to S3 with tenant-scoped path
3. Create document metadata record
4. Add health timeline event
5. Log audit event

**Acceptance Criteria:**
- AC-PAT-021: Valid file uploads and appears in document list
- AC-PAT-022: Oversized file returns 413 with size limit message
- AC-PAT-023: Invalid file type returns 400

---

#### FR-PAT-013: View Health Timeline

| Attribute | Detail |
|-----------|--------|
| **Priority** | P1 |
| **Actors** | Patient |
| **Traces To** | BRQ-PAT-017 |

**Description:** Display chronological feed of health events: profile updates, vitals recorded, appointments, documents uploaded, metrics calculated.

**Acceptance Criteria:**
- AC-PAT-024: Timeline sorted by date descending
- AC-PAT-025: Each event type has distinct icon and summary text
- AC-PAT-026: Timeline supports pagination (20 events per page)

---

#### FR-PAT-014: Profile Completion Score

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | System |
| **Traces To** | BRQ-PAT-003, BR-PAT-007 |

**Scoring Weights:**

| Section | Weight |
|---------|--------|
| Basic Information | 15% |
| Contact Information | 10% |
| Physical Measurements | 15% |
| Medical Information | 15% |
| Lifestyle | 10% |
| Emergency Contacts | 5% |
| Vitals (≥1 recording) | 10% |
| Lab Values (≥1 recording) | 5% |
| Health Goals | 5% |
| Documents (≥1 upload) | 10% |

**Acceptance Criteria:**
- AC-PAT-027: Score recalculates on any section save
- AC-PAT-028: Dashboard shows score with section breakdown
- AC-PAT-029: Sections marked complete when all required fields filled

---

#### FR-PAT-015: Doctor View Patient Summary (Limited)

| Attribute | Detail |
|-----------|--------|
| **Priority** | P1 |
| **Actors** | Doctor |
| **Traces To** | BRQ-PAT-018, BR-AUTH-007, SN-D-006 |

**Preconditions:**
- Active or upcoming appointment exists between doctor and patient
- Appointment within access window (24 hours before to 24 hours after scheduled time)

**Visible Data:** Basic info (name, age, gender), allergies, current medications, chronic conditions, latest vitals, latest lab values, health goals

**Not Visible:** Contact details, emergency contacts, documents, full timeline

**Acceptance Criteria:**
- AC-PAT-030: Doctor sees summary only during valid appointment window
- AC-PAT-031: No appointment relationship returns 403

---

## 6. Module 03: Doctor Domain

### 6.1 Functional Requirements

---

#### FR-DOC-001: Create Doctor Profile

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Doctor |
| **Traces To** | BRQ-DOC-001 |

**Description:** Doctor creates professional profile upon first login after registration.

**Initial Status:** `DRAFT`

**Acceptance Criteria:**
- AC-DOC-001: Profile created in DRAFT status
- AC-DOC-002: Draft profile not visible in public search

---

#### FR-DOC-002: Update Professional Details

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Doctor |
| **Traces To** | BRQ-DOC-002, BR-DOC-002 |

**Inputs:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| title | enum | Yes | DR, PROF, MR, MS |
| medicalRegistrationNumber | string | Yes | Unique [BR-DOC-002] |
| registrationCouncil | string | Yes | e.g., NMC, State Council |
| registrationYear | integer | Yes | 1950–current year |
| registrationExpiry | date | No | Future date if provided |
| gender | enum | No | MALE, FEMALE, OTHER |

---

#### FR-DOC-003: Manage Qualifications

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Doctor |
| **Traces To** | BRQ-DOC-003 |

**Per qualification:** degree, institution, yearOfCompletion, country

**Acceptance Criteria:**
- AC-DOC-003: Multiple qualifications supported
- AC-DOC-004: At least one qualification required before verification submission

---

#### FR-DOC-004: Manage Experience

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Doctor |
| **Traces To** | BRQ-DOC-004 |

**Inputs:** totalYearsExperience (integer), experienceEntries[] (institution, position, startYear, endYear)

---

#### FR-DOC-005: Set Specialization

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Doctor |
| **Traces To** | BRQ-DOC-005 |

**Inputs:** primarySpecialization (from taxonomy), subSpecializations[] (from taxonomy), customTags[] (optional)

**Specialization Taxonomy (sample — full list in DOC-09):**
General Physician, Cardiologist, Dermatologist, Pediatrician, Orthopedic, Gynecologist, Neurologist, Psychiatrist, ENT, Ophthalmologist, Urologist, Oncologist, Pulmonologist, Gastroenterologist, Endocrinologist, Nephrologist, Rheumatologist

**Acceptance Criteria:**
- AC-DOC-005: Only taxonomy values accepted for primary specialization
- AC-DOC-006: Specialization appears in search filters

---

#### FR-DOC-006: Manage Languages

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Doctor |
| **Traces To** | BRQ-DOC-006 |

**Inputs:** languages[] (from ISO 639-1 list: en, hi, mr, ta, te, bn, gu, kn, ml, pa, etc.)

---

#### FR-DOC-007: Hospital Association

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Doctor, Hospital Admin |
| **Traces To** | BRQ-DOC-007, BR-DOC-003, ASM-015 |

**Description:** Doctor associates with hospitals. Association can be initiated by doctor (request) or hospital admin (invite).

**Association Fields:** hospitalId, branchId (optional), departmentId (optional), status (PENDING, ACTIVE, INACTIVE)

**Acceptance Criteria:**
- AC-DOC-007: Doctor must have ≥1 active hospital association to enable booking [BR-DOC-003]
- AC-DOC-008: Doctor can have independent schedules per hospital

---

#### FR-DOC-008: Set Consultation Fee & Types

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Doctor |
| **Traces To** | BRQ-DOC-008, BR-DOC-004, BR-DOC-005 |

**Per hospital association:**

| Field | Type | Required |
|-------|------|----------|
| consultationType | enum | Yes — IN_PERSON, FOLLOW_UP |
| feeAmount | decimal | Yes — ≥ 0 [BR-DOC-004] |
| currency | string | Default INR |
| durationMinutes | integer | Default 15 |

**Acceptance Criteria:**
- AC-DOC-009: Fee = 0 displayed as "Free Consultation"
- AC-DOC-010: Fee visible on public profile and search results

---

#### FR-DOC-009: Biography, Awards & Memberships

| Attribute | Detail |
|-----------|--------|
| **Priority** | P1 |
| **Actors** | Doctor |
| **Traces To** | BRQ-DOC-009 |

**Inputs:** biography (text, max 2000 chars), awards[] (title, year, organization), memberships[] (organization, membershipId, year)

---

#### FR-DOC-010: Upload Verification Documents

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Doctor |
| **Traces To** | BRQ-DOC-017 |

**Inputs:** registrationCertificate (file), identityProof (file), profilePhoto (file)

**Acceptance Criteria:**
- AC-DOC-011: Documents stored securely; not publicly accessible
- AC-DOC-012: Only Platform Admin can view verification documents

---

#### FR-DOC-011: Submit for Verification

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Doctor |
| **Traces To** | BRQ-DOC-010, BRQ-DOC-011 |

**Preconditions:**
- Profile completeness ≥ 80% (all required fields filled)
- At least one qualification uploaded
- Registration certificate uploaded
- At least one hospital association active

**Processing:**
1. Validate preconditions
2. Change status: DRAFT → PENDING_VERIFICATION
3. Notify Platform Admin
4. Log audit event: `DOCTOR_VERIFICATION_SUBMITTED`

**Acceptance Criteria:**
- AC-DOC-013: Incomplete profile cannot submit (400 with missing items list)
- AC-DOC-014: Status change triggers admin notification

---

#### FR-DOC-012: Doctor Verification Review

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Platform Admin |
| **Traces To** | BRQ-DOC-011, BR-DOC-006 |

**Processing:**
1. Admin reviews profile and documents
2. Admin approves or rejects with reason
3. On approve: status → VERIFIED; verification badge applied [BR-DOC-001]
4. On reject: status → REJECTED; doctor notified with reason [BR-DOC-006]
5. Log audit event

**Acceptance Criteria:**
- AC-DOC-015: Verified doctor appears in bookable search
- AC-DOC-016: Rejected doctor can edit and resubmit
- AC-DOC-017: Verification badge visible on public profile

---

#### FR-DOC-013: Public Doctor Profile

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Guest, Patient |
| **Traces To** | BRQ-DOC-015 |

**Visible Data:** name, photo, specializations, experience, qualifications, languages, hospitals, fees, availability preview, ratings, reviews, biography, verification badge

**Not Visible:** registration number, verification documents, contact details

**Acceptance Criteria:**
- AC-DOC-018: Unverified doctors not listed in search [BR-DOC-001]
- AC-DOC-019: Public profile accessible without authentication

---

#### FR-DOC-014: Doctor Ratings Display

| Attribute | Detail |
|-----------|--------|
| **Priority** | P1 |
| **Actors** | Guest, Patient |
| **Traces To** | BRQ-DOC-013, BRQ-DOC-014 |

**Acceptance Criteria:**
- AC-DOC-020: Aggregate rating displayed to 1 decimal place
- AC-DOC-021: Reviews paginated, sorted by date descending

---

## 7. Module 04: Hospital Domain

### 7.1 Functional Requirements

---

#### FR-HOS-001: Create Hospital Profile

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Hospital Admin |
| **Traces To** | BRQ-HOS-001 |

**Inputs:**

| Field | Type | Required |
|-------|------|----------|
| name | string | Yes |
| registrationNumber | string | Yes, unique [BR-HOS-002] |
| hospitalType | enum | GOVERNMENT, PRIVATE, TRUST, CLINIC |
| establishedYear | integer | No |
| totalBedCount | integer | No |
| accreditation | enum | NABH, JCI, NONE |
| description | text | No |

---

#### FR-HOS-002: Manage Branches

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Hospital Admin |
| **Traces To** | BRQ-HOS-003, BRQ-HOS-004, BR-HOS-001, BR-HOS-003 |

**Per branch:**

| Field | Type | Required |
|-------|------|----------|
| name | string | Yes |
| address | Address object | Yes |
| latitude | decimal | Yes [BR-HOS-003] |
| longitude | decimal | Yes |
| phone | string | Yes |
| email | string | No |
| isPrimary | boolean | No |
| workingHours | WeeklySchedule | Yes |

**Acceptance Criteria:**
- AC-HOS-001: At least one branch required [BR-HOS-001]
- AC-HOS-002: Branch geo coordinates used in location search

---

#### FR-HOS-003: Manage Departments

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Hospital Admin |
| **Traces To** | BRQ-HOS-005, BR-HOS-005 |

**Per department:** name (unique per hospital), description, floor, headDoctorId (optional), operatingHours, isActive

---

#### FR-HOS-004: Manage Facilities

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Hospital Admin |
| **Traces To** | BRQ-HOS-006 |

**Per facility:** name, category (DIAGNOSTIC, SURGICAL, EMERGENCY, ICU, PHARMACY, OTHER), description, isAvailable, branchId

---

#### FR-HOS-005: Map Doctors to Hospital

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Hospital Admin |
| **Traces To** | BRQ-HOS-007 |

**Processing:** Hospital Admin associates doctor profiles with hospital, optionally assigning department.

**Acceptance Criteria:**
- AC-HOS-003: Associated doctor appears on hospital profile
- AC-HOS-004: Doctor-hospital link enables schedule creation for that hospital

---

#### FR-HOS-006: Emergency & ICU Information

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Hospital Admin |
| **Traces To** | BRQ-HOS-008, BRQ-HOS-009 |

**Inputs:** emergencyAvailable24x7 (boolean), emergencyPhone, ambulanceAvailable (boolean), icuAvailable (boolean), icuBedCount, icuType (GENERAL, CRITICAL_CARE)

---

#### FR-HOS-007: Hospital Image Gallery

| Attribute | Detail |
|-----------|--------|
| **Priority** | P1 |
| **Actors** | Hospital Admin |
| **Traces To** | BRQ-HOS-010, BR-HOS-004 |

**Constraints:** Max 20 images, 5 MB each, JPEG/PNG [BR-HOS-004]

**Acceptance Criteria:**
- AC-HOS-005: Gallery displayed on public profile
- AC-HOS-006: Upload beyond limit returns 400

---

#### FR-HOS-008: Public Hospital Profile

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Guest, Patient |
| **Traces To** | BRQ-HOS-012 |

**Visible:** name, type, description, branches (with map), departments, facilities, associated doctors, working hours, emergency info, gallery, ratings, reviews

**Acceptance Criteria:**
- AC-HOS-007: Public profile accessible without authentication
- AC-HOS-008: Map shows branch locations

---

## 8. Module 05: Scheduling Domain

### 8.1 Functional Requirements

---

#### FR-SCH-001: Define Weekly Schedule Template

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Doctor |
| **Traces To** | BRQ-SCH-001, BRQ-SCH-004 |

**Per hospital association:**

| Field | Type | Description |
|-------|------|-------------|
| dayOfWeek | enum | MONDAY–SUNDAY |
| startTime | time | e.g., 09:00 |
| endTime | time | e.g., 17:00 |
| slotDurationMinutes | integer | Default 15 |
| bufferMinutes | integer | Default 5 |
| consultationType | enum | IN_PERSON, FOLLOW_UP |
| isActive | boolean | — |

**Acceptance Criteria:**
- AC-SCH-001: Schedule defined independently per hospital
- AC-SCH-002: End time must be after start time
- AC-SCH-003: Overlapping schedule blocks for same day rejected [BR-SCH-001]

---

#### FR-SCH-002: Generate Time Slots

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | System |
| **Traces To** | BRQ-SCH-002 |

**Description:** System generates bookable time slots from schedule templates for a rolling 30-day horizon.

**Processing:**
1. For each active schedule template day matching calendar date
2. Generate slots: startTime to endTime in slotDuration increments
3. Apply buffer between slots
4. Mark slot status: AVAILABLE, BOOKED, BLOCKED
5. Run nightly batch to extend horizon

**Acceptance Criteria:**
- AC-SCH-004: Slots generated for 30 days ahead
- AC-SCH-005: Booked slots not regenerated as available

---

#### FR-SCH-003: View Doctor Availability

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Patient, Guest |
| **Traces To** | BRQ-SCH-002 |

**Inputs:** doctorId, hospitalId, dateRange (from, to)

**Outputs:** Calendar view with available/booked/blocked slots per day

**Acceptance Criteria:**
- AC-SCH-006: Only AVAILABLE slots selectable for booking
- AC-SCH-007: Unverified doctor returns empty availability

---

#### FR-SCH-004: Book Appointment

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Patient |
| **Traces To** | BRQ-SCH-005, BRQ-SCH-006, BRQ-SCH-007, BRQ-SCH-015, BR-SCH-008 |

**Preconditions:**
- Patient authenticated
- Doctor verified [BRQ-SCH-015]
- Slot status = AVAILABLE
- Slot datetime in future [BR-SCH-003]
- No existing active appointment same doctor same day [BR-SCH-002]

**Inputs:** doctorId, hospitalId, branchId, slotId, consultationType, reasonForVisit (optional, max 500 chars)

**Processing (Atomic Transaction):**
1. Acquire pessimistic lock on slot row
2. Verify slot still AVAILABLE
3. Create Appointment: status = CONFIRMED
4. Update slot status = BOOKED
5. Send notifications to patient and doctor [FR-NTF-001]
6. Schedule reminders [FR-NTF-002]
7. Log audit event: `APPOINTMENT_BOOKED`

**Outputs:**

```json
{
  "appointmentId": "uuid",
  "status": "CONFIRMED",
  "doctor": { "id", "name", "specialization" },
  "hospital": { "id", "name", "branch" },
  "scheduledAt": "2026-08-15T10:00:00Z",
  "consultationType": "IN_PERSON",
  "consultationFee": 500.00
}
```

**Acceptance Criteria:**
- AC-SCH-008: Successful booking returns confirmation with all details
- AC-SCH-009: Concurrent booking attempt on same slot — only one succeeds (409 for loser)
- AC-SCH-010: Booking unverified doctor returns 400
- AC-SCH-011: Notifications sent within 30 seconds

---

#### FR-SCH-005: Cancel Appointment

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Patient, Doctor, Platform Admin |
| **Traces To** | BRQ-SCH-009, BR-SCH-004 |

**Preconditions:** Appointment status = CONFIRMED; cancellation within allowed window [BR-SCH-004] (default: ≥ 2 hours before)

**Processing:**
1. Validate cancellation window
2. Update appointment status = CANCELLED
3. Release slot → AVAILABLE
4. Cancel scheduled reminders
5. Notify both parties
6. Log audit event

**Acceptance Criteria:**
- AC-SCH-012: Cancellation within window succeeds; slot released
- AC-SCH-013: Cancellation outside window returns 400 with policy message

---

#### FR-SCH-006: Reschedule Appointment

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Patient |
| **Traces To** | BRQ-SCH-010, BR-SCH-005 |

**Processing:**
1. Validate reschedule window [BR-SCH-005]
2. Mark original appointment status = RESCHEDULED
3. Release original slot
4. Book new slot (same atomic flow as FR-SCH-004)
5. Link original → new appointment
6. Notify both parties
7. Log audit event

**Acceptance Criteria:**
- AC-SCH-014: Rescheduled appointment linked to original
- AC-SCH-015: New slot booked atomically

---

#### FR-SCH-007: Appointment Status Lifecycle

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Doctor, System |
| **Traces To** | BRQ-SCH-008, BR-SCH-006, BR-SCH-007 |

**Valid Transitions:**

```
PENDING → CONFIRMED (on booking)
CONFIRMED → COMPLETED (doctor marks after visit)
CONFIRMED → CANCELLED (patient/doctor/admin cancels)
CONFIRMED → NO_SHOW (doctor/system after scheduledAt + 15 min)
CONFIRMED → RESCHEDULED (patient reschedules)
```

**Acceptance Criteria:**
- AC-SCH-016: Invalid status transition returns 400
- AC-SCH-017: Completed appointment triggers review prompt [FR-REV-001]

---

#### FR-SCH-008: Appointment History

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Patient, Doctor |
| **Traces To** | BRQ-SCH-012 |

**Filters:** status, dateRange, doctorId (patient view), patientId (doctor view)

**Acceptance Criteria:**
- AC-SCH-018: Patient sees all own appointments sorted by date desc
- AC-SCH-019: Doctor sees appointments for own schedule only

---

#### FR-SCH-009: Doctor Block Time Slot

| Attribute | Detail |
|-----------|--------|
| **Priority** | P1 |
| **Actors** | Doctor |
| **Traces To** | BRQ-SCH-001 |

**Description:** Doctor can block specific slots or date ranges (leave, emergency).

**Acceptance Criteria:**
- AC-SCH-020: Blocked slots not available for booking
- AC-SCH-021: Already booked slots in block range require manual cancellation first

---

## 9. Module 06: Location Domain

### 9.1 Functional Requirements

---

#### FR-LOC-001: Google Maps Integration

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | System, Patient |
| **Traces To** | BRQ-LOC-001, ASM-002 |

**Description:** Integrate Google Maps JavaScript API (web) and Maps SDK (mobile) for map display, markers, and info windows.

**Acceptance Criteria:**
- AC-LOC-001: Hospital branches displayed as map markers
- AC-LOC-002: Map loads within 2 seconds on standard connection

---

#### FR-LOC-002: Geocode Address

| Attribute | Detail |
|-----------|--------|
| **Priority** | P1 |
| **Actors** | System |
| **Traces To** | BRQ-LOC-008 |

**Description:** Convert hospital branch address to lat/lng using Google Geocoding API when coordinates not provided.

**Acceptance Criteria:**
- AC-LOC-003: Valid address returns coordinates stored on branch

---

#### FR-LOC-003: Nearby Hospitals Search

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Patient, Guest |
| **Traces To** | BRQ-LOC-002, BRQ-LOC-006 |

**Inputs:** latitude, longitude, radiusKm (default 5, max 50), filters (department, emergency, rating)

**Processing:**
1. Query hospitals with branches within radius using Haversine formula (or PostGIS future)
2. Calculate distance from user point to each branch
3. Apply filters and sort

**Outputs:** List of hospitals with nearest branch distance, sorted by distance

**Acceptance Criteria:**
- AC-LOC-004: Results within specified radius only
- AC-LOC-005: Distance displayed in km to 1 decimal

---

#### FR-LOC-004: Nearby Doctors Search

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Patient, Guest |
| **Traces To** | BRQ-LOC-003 |

**Description:** Search verified doctors near user location based on associated hospital branch coordinates.

**Acceptance Criteria:**
- AC-LOC-006: Only verified doctors returned
- AC-LOC-007: Distance based on nearest associated hospital branch

---

#### FR-LOC-005: Distance & Travel Time

| Attribute | Detail |
|-----------|--------|
| **Priority** | P1 |
| **Actors** | System |
| **Traces To** | BRQ-LOC-004, BRQ-LOC-005 |

**Description:** Use Google Distance Matrix API to calculate road distance and estimated travel time.

**Acceptance Criteria:**
- AC-LOC-008: Travel time displayed in minutes
- AC-LOC-009: Results cached in Redis for 1 hour per origin-destination pair

---

#### FR-LOC-006: Mobile Location Permission

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Patient (Mobile) |
| **Traces To** | BRQ-LOC-007 |

**Description:** React Native app requests location permission. On denial, fallback to manual city/pincode entry with geocoding.

**Acceptance Criteria:**
- AC-LOC-010: Permission granted → auto-detect location for search
- AC-LOC-011: Permission denied → manual entry field displayed

---

## 10. Module 07: Health Analytics Domain

### 10.1 Functional Requirements

---

#### FR-ANL-001: Health Dashboard

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Patient |
| **Traces To** | BRQ-ANL-001, BRQ-ANL-012 |

**Description:** Display comprehensive health dashboard with all calculated metrics, scores, and profile completion status.

**Dashboard Sections:**
1. Profile Completion Banner (if < 100%)
2. Wellness Score & Health Risk Score (gauges)
3. Key Metrics Grid (BMI, BMR, BP classification, etc.)
4. Goals Progress
5. Recent Vitals Trend (sparklines)
6. Health Timeline (last 5 events)

**Acceptance Criteria:**
- AC-ANL-001: Dashboard loads all available metrics in < 2 seconds
- AC-ANL-002: Missing data sections show "Complete your profile" CTA

---

#### FR-ANL-002: Formula Engine Execution

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | System |
| **Traces To** | BRQ-ANL-002, BRQ-ANL-013, BR-ANL-002 |

**Description:** Deterministic calculation of all health metrics from patient profile data. Full formula specifications in [DOC-08].

**Calculated Metrics:**

| Metric | Required Inputs | Output Unit |
|--------|----------------|-------------|
| BMI | height, weight | kg/m² |
| BMR (Mifflin-St Jeor) | weight, height, age, gender | kcal/day |
| Ideal Weight (Devine) | height, gender | kg |
| Lean Body Mass | weight, bodyFat% OR height, weight, gender | kg |
| Body Surface Area (Du Bois) | height, weight | m² |
| Healthy Weight Range | height, gender | kg range |
| Protein Requirement | weight, activity level | g/day |
| Water Intake | weight, activity level | ml/day |
| Daily Calories | BMR, activity level, goal | kcal/day |
| Sleep Recommendation | age | hours range |
| Daily Step Goal | age, activity level | steps |
| Heart Rate Zones | age, resting HR | zones 1–5 |
| BP Classification | systolic, diastolic | category |
| Blood Sugar Classification | glucose, reading type | category |
| Waist-Hip Ratio | waist, hip | ratio |
| Waist-Height Ratio | waist, height | ratio |
| Wellness Score | composite | 0–100 |
| Health Risk Score | composite | 0–100 |
| Profile Completion | all sections | 0–100% |

**Processing:**
1. Fetch current patient profile
2. For each metric: check required inputs present
3. If inputs sufficient: calculate, classify, interpret
4. If inputs missing: return `{ status: "INSUFFICIENT_DATA", missingFields: [...] }`
5. Cache results in Redis (TTL 5 min, invalidated on profile update)

**Acceptance Criteria:**
- AC-ANL-003: Same inputs always produce same outputs [BRQ-ANL-013]
- AC-ANL-004: Each metric includes value, unit, classification, interpretation, disclaimer
- AC-ANL-005: Insufficient data returns specific missing field guidance

---

#### FR-ANL-003: Metric Classification & Interpretation

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | System |
| **Traces To** | BRQ-ANL-008, BR-ANL-001, BR-ANL-005 |

**Classification Levels:** NORMAL (green), WARNING (amber), CRITICAL (red), INSUFFICIENT_DATA (grey)

**Every metric display includes:**
- Calculated value with unit
- Classification badge with color
- Plain-language interpretation (1–2 sentences)
- Mandatory disclaimer: *"This is not a medical diagnosis. Consult a healthcare professional for medical advice."*

**Acceptance Criteria:**
- AC-ANL-006: All metrics display disclaimer
- AC-ANL-007: Classification thresholds per WHO/AHA/ADA standards [DOC-08]

---

#### FR-ANL-004: Wellness Score Calculation

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | System |
| **Traces To** | BRQ-ANL-007, BR-ANL-003 |

**Preconditions:** Profile completion ≥ 60%

**Composite Factors (weighted):**
- BMI classification (20%)
- BP classification (15%)
- Lifestyle score — exercise, sleep, smoking, alcohol (25%)
- Vital signs score (15%)
- Profile completeness (10%)
- Goals progress (15%)

**Output:** Score 0–100 with label: Excellent (80+), Good (60–79), Fair (40–59), Needs Attention (< 40)

---

#### FR-ANL-005: Health Risk Score Calculation

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | System |
| **Traces To** | BRQ-ANL-007, BR-ANL-004 |

**Preconditions:** Medical Information and Lifestyle sections complete

**Composite Factors (weighted):**
- Chronic conditions count & severity (25%)
- Family history (15%)
- Lifestyle risk factors — smoking, alcohol, sedentary (25%)
- Vital signs risk — BP, glucose, HR (20%)
- Lab values risk — HbA1c, cholesterol (15%)

**Output:** Score 0–100 with label: Low Risk (0–25), Moderate Risk (26–50), High Risk (51–75), Very High Risk (76–100)

---

#### FR-ANL-006: Automatic Recalculation on Profile Update

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | System |
| **Traces To** | BRQ-ANL-011 |

**Description:** Any profile section save triggers formula engine recalculation and cache invalidation.

**Acceptance Criteria:**
- AC-ANL-008: Dashboard reflects updated metrics within 5 seconds of profile save

---

#### FR-ANL-007: Health Timeline Visualization

| Attribute | Detail |
|-----------|--------|
| **Priority** | P1 |
| **Actors** | Patient |
| **Traces To** | BRQ-ANL-009, BR-ANL-006 |

**Description:** Chart view of key metrics over time (BMI, weight, BP, glucose). Requires ≥ 2 data points [BR-ANL-006].

**Acceptance Criteria:**
- AC-ANL-009: Line chart renders for metrics with sufficient history
- AC-ANL-010: Single data point shows "Add more recordings to see trends"

---

#### FR-ANL-008: Export Health Report (PDF)

| Attribute | Detail |
|-----------|--------|
| **Priority** | P2 |
| **Actors** | Patient |
| **Traces To** | BRQ-ANL-010 |

**Report Contents:** Patient name, report date, profile summary, all current metrics with classifications, wellness/risk scores, disclaimer

**Acceptance Criteria:**
- AC-ANL-011: PDF generated and downloadable within 10 seconds

---

## 11. Cross-Module: Search & Discovery

---

#### FR-SRH-001: Unified Search

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Patient, Guest |
| **Traces To** | BRQ-SRH-001 |

**Inputs:** query (free text), type (DOCTOR, HOSPITAL, ALL), location (lat/lng or city), filters, sort, page, pageSize

**Acceptance Criteria:**
- AC-SRH-001: Search returns results in < 500ms p95
- AC-SRH-002: Empty query with filters returns filtered results

---

#### FR-SRH-002: Doctor Search Filters

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Patient, Guest |
| **Traces To** | BRQ-SRH-002, BRQ-SRH-006 |

**Filters:** specialization, subSpecialization, minExperience, maxDistance, availableDate, minRating, maxFee, gender, language, hospitalId

**Sort Options:** NEAREST, HIGHEST_RATED, MOST_EXPERIENCED, LOWEST_FEE, RELEVANCE (default)

**Acceptance Criteria:**
- AC-SRH-003: Only VERIFIED doctors in results
- AC-SRH-004: Multiple filters applied as AND conditions
- AC-SRH-005: Sort by nearest requires location input

---

#### FR-SRH-003: Hospital Search Filters

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | Patient, Guest |
| **Traces To** | BRQ-SRH-003 |

**Filters:** department, facility, maxDistance, minRating, emergency24x7, icuAvailable

**Sort Options:** NEAREST, HIGHEST_RATED, RELEVANCE

---

## 12. Cross-Module: Reviews & Ratings

---

#### FR-REV-001: Submit Review

| Attribute | Detail |
|-----------|--------|
| **Priority** | P1 |
| **Actors** | Patient |
| **Traces To** | BRQ-REV-001, BRQ-REV-002, BR-REV-001, BR-REV-003 |

**Preconditions:**
- Appointment status = COMPLETED
- Within 30 days of appointment [BR-REV-001]
- No existing review for this appointment [BR-REV-003]

**Inputs:** appointmentId, rating (1–5 integer), comment (max 1000 chars)

**Processing:**
1. Validate preconditions
2. Create review linked to appointment, doctor, and/or hospital
3. Recalculate aggregate rating [BRQ-REV-004]
4. Log audit event

**Acceptance Criteria:**
- AC-REV-001: Valid review published on doctor/hospital profile
- AC-REV-002: Duplicate review attempt returns 409
- AC-REV-003: Review outside window returns 400

---

#### FR-REV-002: Review Moderation

| Attribute | Detail |
|-----------|--------|
| **Priority** | P1 |
| **Actors** | Platform Admin |
| **Traces To** | BRQ-REV-005 |

**Acceptance Criteria:**
- AC-REV-004: Admin can hide/remove review with reason logged
- AC-REV-005: Removed review excluded from aggregate rating

---

## 13. Cross-Module: Notifications

---

#### FR-NTF-001: Send Transactional Notification

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | System |
| **Traces To** | BRQ-SCH-014, ASM-007 |

**Channels:** Email (AWS SES), SMS (AWS SNS), In-App (database)

**Processing:**
1. Check user notification preferences [FR-IAM-009]
2. Render template for notification type
3. Dispatch to enabled channels
4. Log delivery status

**Acceptance Criteria:**
- AC-NTF-001: Appointment confirmation sent to patient and doctor
- AC-NTF-002: Respects user channel preferences

---

#### FR-NTF-002: Schedule Appointment Reminders

| Attribute | Detail |
|-----------|--------|
| **Priority** | P0 |
| **Actors** | System |
| **Traces To** | BRQ-SCH-011, BR-SCH-009, ASM-013 |

**Description:** Background job schedules reminders at T-24 hours and T-1 hour before appointment.

**Processing:**
1. On appointment confirmation, create two scheduled jobs
2. At trigger time, check appointment still CONFIRMED
3. Send reminder via preferred channels
4. Log delivery

**Acceptance Criteria:**
- AC-NTF-003: Reminders sent at correct intervals
- AC-NTF-004: Cancelled appointments do not trigger reminders

---

## 14. Use Case Specifications

### UC-007: Book Appointment (Detailed)

| Field | Detail |
|-------|--------|
| **Actors** | Patient (primary), System |
| **Preconditions** | Patient authenticated; doctor verified and has availability |
| **Trigger** | Patient clicks "Book Appointment" on doctor profile |
| **Postconditions** | Appointment CONFIRMED; slot BOOKED; notifications sent |

**Main Success Scenario:**
1. Patient views doctor public profile [FR-DOC-013]
2. Patient clicks "Book Appointment"
3. System prompts login if guest → registration flow [UC-001]
4. System displays hospital selection (if doctor at multiple hospitals)
5. System displays availability calendar [FR-SCH-003]
6. Patient selects date
7. System displays available time slots for selected date
8. Patient selects slot and consultation type
9. Patient enters reason for visit (optional)
10. System displays booking summary (doctor, hospital, date/time, fee)
11. Patient confirms booking
12. System executes atomic booking [FR-SCH-004]
13. System displays confirmation screen with appointment details
14. System sends notifications [FR-NTF-001]
15. System schedules reminders [FR-NTF-002]

**Extensions:**
- 7a. No slots available → display "No availability" with option to check other dates
- 12a. Slot taken concurrently → display "Slot no longer available" and return to step 6
- 12b. Patient already has appointment same doctor same day → display policy message [BR-SCH-002]

---

### UC-004: View Health Dashboard (Detailed)

| Field | Detail |
|-------|--------|
| **Actors** | Patient |
| **Preconditions** | Patient authenticated; profile created |
| **Trigger** | Patient navigates to Health Dashboard |

**Main Success Scenario:**
1. System fetches patient profile
2. System checks profile completion score [FR-PAT-014]
3. If completion < 60%: display completion banner with missing sections
4. System invokes Formula Engine [FR-ANL-002]
5. System renders Wellness Score and Health Risk Score [FR-ANL-004, FR-ANL-005]
6. System renders metric cards with classifications [FR-ANL-003]
7. System renders goals progress [FR-PAT-011]
8. System renders vitals trend charts (if ≥ 2 data points) [FR-ANL-007]
9. System renders recent timeline events [FR-PAT-013]

---

## 15. Requirements Traceability Matrix

| FR ID | BRQ ID | UC ID | Priority | Module |
|-------|--------|-------|----------|--------|
| FR-IAM-001 | BRQ-IAM-001 | UC-001 | P0 | IAM |
| FR-IAM-003 | BRQ-IAM-002 | UC-002 | P0 | IAM |
| FR-PAT-002 | BRQ-PAT-005 | UC-003 | P0 | Patient |
| FR-PAT-004 | BRQ-PAT-007 | UC-003 | P0 | Patient |
| FR-PAT-009 | BRQ-PAT-012 | UC-003 | P0 | Patient |
| FR-PAT-014 | BRQ-PAT-003 | UC-004 | P0 | Patient |
| FR-DOC-011 | BRQ-DOC-010 | UC-010 | P0 | Doctor |
| FR-DOC-012 | BRQ-DOC-011 | UC-011 | P0 | Doctor |
| FR-DOC-013 | BRQ-DOC-015 | UC-005 | P0 | Doctor |
| FR-HOS-008 | BRQ-HOS-012 | UC-006 | P0 | Hospital |
| FR-SCH-004 | BRQ-SCH-005 | UC-007 | P0 | Scheduling |
| FR-SCH-005 | BRQ-SCH-009 | UC-008 | P0 | Scheduling |
| FR-SCH-006 | BRQ-SCH-010 | UC-009 | P0 | Scheduling |
| FR-LOC-003 | BRQ-LOC-002 | UC-005 | P0 | Location |
| FR-LOC-004 | BRQ-LOC-003 | UC-005 | P0 | Location |
| FR-ANL-001 | BRQ-ANL-001 | UC-004 | P0 | Analytics |
| FR-ANL-002 | BRQ-ANL-002 | UC-004 | P0 | Analytics |
| FR-SRH-002 | BRQ-SRH-002 | UC-005 | P0 | Search |
| FR-REV-001 | BRQ-REV-001 | UC-015 | P1 | Reviews |
| FR-NTF-002 | BRQ-SCH-011 | UC-007 | P0 | Notifications |

---

## 16. Functional Requirements Summary

| Module | P0 Count | P1 Count | P2 Count | Total |
|--------|----------|----------|----------|-------|
| IAM | 10 | 2 | 0 | 12 |
| Patient | 10 | 5 | 0 | 15 |
| Doctor | 10 | 4 | 0 | 14 |
| Hospital | 6 | 2 | 0 | 8 |
| Scheduling | 8 | 1 | 0 | 9 |
| Location | 3 | 3 | 0 | 6 |
| Analytics | 6 | 1 | 1 | 8 |
| Search | 3 | 0 | 0 | 3 |
| Reviews | 0 | 2 | 0 | 2 |
| Notifications | 2 | 0 | 0 | 2 |
| **Total** | **58** | **20** | **1** | **79** |

---

## 17. Open Items (Deferred to Subsequent Documents)

| Item | Target Document |
|------|----------------|
| Detailed validation error codes | DOC-09 |
| API endpoint mapping per FR | DOC-07 |
| Database entity mapping per FR | DOC-06 |
| UI screen mapping per FR | DOC-10 |
| Formula mathematical specifications | DOC-08 |
| Performance benchmarks | DOC-04 |
| Full user story backlog | DOC-14 |

---

## 18. Approval

| Role | Name | Signature | Date | Status |
|------|------|-----------|------|--------|
| Product Owner | _________________ | _________________ | ________ | Pending |
| Business Analyst Lead | _________________ | _________________ | ________ | Pending |
| Technical Lead / Architect | _________________ | _________________ | ________ | Pending |
| QA Lead | _________________ | _________________ | ________ | Pending |
| Engineering Lead | _________________ | _________________ | ________ | Pending |

---

*End of DOC-03 — Functional Requirements Specification v1.0*
