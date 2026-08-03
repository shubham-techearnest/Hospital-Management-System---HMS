# Health360 AI — Mobile API Integration Guide

| Attribute | Value |
|-----------|-------|
| **Document ID** | MOBILE-API-001 |
| **Version** | 1.0.0 |
| **Status** | Approved for Handover |
| **Date** | 2026-07-30 |
| **Audience** | React Native Mobile Development Team |
| **Backend Version** | `0.1.0-SNAPSHOT` (Phase 1 — through Sprint S7 target) |
| **Scope** | REST API integration for iOS/Android via React Native |
| **Strategy** | [MOBILE_DEVELOPMENT_STRATEGY.md](./MOBILE_DEVELOPMENT_STRATEGY.md) |
| **Sprint Status** | [MOBILE_SPRINT_STATUS.md](./MOBILE_SPRINT_STATUS.md) |

---

## Document Control

This guide documents **only endpoints implemented in the current backend codebase** (`backend/health360-api`). Endpoints defined in [DOC-07 REST API Design Specification](../07-REST-API-DESIGN-SPECIFICATION.md) but not yet implemented are marked **Status: Planned**.

The mobile application consumes the **same REST APIs** as the React web application (`frontend/health360-web`). No mobile-specific API layer exists.

**Development policy (2026-07-30):** Mobile ships every sprint alongside backend and web. See [MOBILE-STRAT-001](./MOBILE_DEVELOPMENT_STRATEGY.md) for catch-up program (S1–S7) and architecture.

---

## 1. Project Overview

### 1.1 Architecture

Health360 AI Phase 1 is a modular monolith built on:

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Backend API** | Spring Boot 3.3 (Java 21) | REST API, business logic, security |
| **Database** | PostgreSQL 16 | Persistent storage (Flyway migrations) |
| **Authentication** | JWT (RS256) + refresh tokens | Stateless auth with token rotation |
| **Authorization** | RBAC (roles + permissions) | Fine-grained endpoint access |
| **Web Client** | React 18 + Vite + MUI | Patient/Doctor web portals |
| **Mobile Client** | React Native (planned) | Patient/Doctor mobile apps |

```
┌─────────────────┐     ┌─────────────────┐
│  React Web App  │     │ React Native App│
│  (health360-web)│     │   (mobile/)     │
└────────┬────────┘     └────────┬────────┘
         │   HTTPS / JSON        │
         └──────────┬────────────┘
                    ▼
         ┌──────────────────────┐
         │  Spring Boot API     │
         │  /api/v1/*           │
         │  JWT + RBAC          │
         └──────────┬───────────┘
                    ▼
         ┌──────────────────────┐
         │  PostgreSQL          │
         │  (iam, patient,      │
         │   doctor schemas)    │
         └──────────────────────┘
```

### 1.2 API Design Principles

- **Base path:** `/api/v1`
- **Format:** JSON request/response bodies
- **Timestamps:** ISO-8601 UTC (`Instant`) or ISO dates (`LocalDate`)
- **IDs:** UUID v4 strings
- **Envelope:** All successful API responses use `ApiResponse<T>` wrapper
- **Errors:** All error responses use `ErrorResponse` wrapper
- **Correlation ID:** Returned in error responses for support/debugging

### 1.3 Implemented Modules (Phase 1 — Current)

| Module | Schema | Sprint | Status |
|--------|--------|--------|--------|
| IAM / Auth | `iam` | S1–S2 | Implemented |
| Patient Profile | `patient` | S3–S4 | Implemented |
| Doctor Profile | `doctor` | S5 | Implemented |
| Hospital | `hospital` | S7 | Planned |
| Scheduling | `scheduling` | S8–S9 | Planned |
| Analytics | `analytics` | S10–S11 | Planned |
| Admin | — | S6+ | Partially (RBAC probes only) |

---

## 2. Base URLs

| Environment | Base URL | Status |
|-------------|----------|--------|
| **Development** | `http://localhost:8080/api/v1` | Active |
| **Staging** | `https://staging-api.health360.ai/api/v1` | _Placeholder — TBD_ |
| **Production** | `https://api.health360.ai/api/v1` | _Placeholder — TBD_ |

**Health check (no auth):** `GET http://localhost:8080/api/v1/health`

**Swagger UI (development):** `http://localhost:8080/swagger-ui.html`

**OpenAPI JSON:** `http://localhost:8080/api-docs`

---

## 3. Authentication

### 3.1 Overview

Authentication uses **JWT Bearer tokens** with a separate **refresh token** for session renewal.

| Token | TTL (default) | Storage Recommendation |
|-------|---------------|------------------------|
| Access Token | 900 seconds (15 min) | Memory / short-lived secure store |
| Refresh Token | 604,800 seconds (7 days) | React Native Secure Storage |

Configuration source: `Health360Properties.Jwt` (`accessTokenTtlSeconds`, `refreshTokenTtlSeconds`).

### 3.2 Login Flow

1. Mobile app calls `POST /auth/login` with email and password.
2. Backend validates credentials, email verification, and account status.
3. Response includes `accessToken`, `refreshToken`, `expiresIn`, and embedded `user` object (roles + permissions).
4. Mobile stores tokens securely and attaches access token to subsequent requests.

**Preconditions for successful login:**
- User email must be verified (`emailVerified: true`)
- Account status must be `ACTIVE`
- Account must not be locked or deactivated

### 3.3 Refresh Token Flow

1. When access token expires (401 with message `"Access token has expired"`), call `POST /auth/refresh`.
2. Send `{ "refreshToken": "<stored_refresh_token>" }`.
3. Receive new access + refresh token pair.
4. Replace stored tokens atomically.

**On refresh failure:** Clear tokens and redirect to login.

### 3.4 Logout

1. Call `POST /auth/logout` with:
   - Header: `Authorization: Bearer <access_token>`
   - Header: `X-Refresh-Token: <refresh_token>` (optional but recommended)
2. Backend blacklists the current access token JTI and invalidates refresh token.
3. Response: `204 No Content`
4. Mobile clears all stored tokens.

### 3.5 Authorization Header

All authenticated endpoints require:

```http
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
Accept: application/json
```

### 3.6 Token Expiration Strategy (Mobile)

```
┌─────────────────────────────────────────────────────────┐
│  Recommended Mobile Token Strategy                      │
├─────────────────────────────────────────────────────────┤
│  1. Store refresh token in react-native-keychain /      │
│     expo-secure-store                                   │
│  2. Keep access token in memory (Redux/Zustand)         │
│  3. Proactive refresh at 80% of expiresIn (≈12 min)   │
│  4. On 401: attempt one refresh, retry original request │
│  5. On refresh 401: force logout                        │
│  6. Serialize concurrent refresh calls (single flight)  │
└─────────────────────────────────────────────────────────┘
```

### 3.7 Secure Storage Recommendation

| Library | Platform | Use For |
|---------|----------|---------|
| `react-native-keychain` | iOS/Android | Refresh token, biometric-gated access |
| `expo-secure-store` | Expo projects | Refresh token |
| **Never use** AsyncStorage | — | Tokens, passwords, PHI |

---

## 4. Common Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes (protected routes) | `Bearer <access_token>` |
| `Content-Type` | Yes (POST/PUT/PATCH) | `application/json` |
| `Accept` | Recommended | `application/json` |
| `X-Refresh-Token` | Logout only | Refresh token for server-side invalidation |
| `X-Tenant-Id` | **Not used** | Tenant is embedded in JWT claims (`tenantId`) |

---

## 5. Common Response Format

### 5.1 Success Response (`ApiResponse<T>`)

```json
{
  "success": true,
  "data": { },
  "message": null,
  "timestamp": "2026-07-30T10:30:00.123Z"
}
```

Message-only success:

```json
{
  "success": true,
  "data": null,
  "message": "Email verified successfully. You can now log in.",
  "timestamp": "2026-07-30T10:30:00.123Z"
}
```

### 5.2 Validation Error (400)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "email",
        "message": "must be a well-formed email address",
        "code": "VALIDATION_ERROR"
      }
    ],
    "correlationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "timestamp": "2026-07-30T10:30:00.123Z"
  }
}
```

### 5.3 Unauthorized (401)

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Access token has expired",
    "correlationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "timestamp": "2026-07-30T10:30:00.123Z"
  }
}
```

### 5.4 Forbidden (403)

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Access denied",
    "correlationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "timestamp": "2026-07-30T10:30:00.123Z"
  }
}
```

### 5.5 Not Found (404)

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Patient profile not found",
    "correlationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "timestamp": "2026-07-30T10:30:00.123Z"
  }
}
```

### 5.6 Conflict (409)

```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_EMAIL",
    "message": "Email is already registered",
    "correlationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "timestamp": "2026-07-30T10:30:00.123Z"
  }
}
```

### 5.7 Internal Server Error (500)

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred",
    "correlationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "timestamp": "2026-07-30T10:30:00.123Z"
  }
}
```

> **Note:** HTTP 422 is **not currently returned** by the backend. Validation failures use **400** with `VALIDATION_ERROR`.

---

## 6. API Groups

### 6.1 Summary Table

| API Group | Base Path | Implemented | Planned | Sprint |
|-----------|-----------|-------------|---------|--------|
| **Shared / Health** | `/health` | 1 | 0 | S0 |
| **Authentication** | `/auth` | 8 | 0 | S1 |
| **User Account** | `/users` | 4 | 3 | S1–S2 |
| **Patient Profile** | `/patients` | 31 | 12+ | S3–S4 |
| **Doctor Profile** | `/doctors` | 13 | 8+ | S5–S6 |
| **RBAC Probes** | `/rbac` | 3 | 0 | S2 (dev/test) |
| **Hospital** | `/hospitals` | 0 | 15+ | S7 |
| **Scheduling** | `/scheduling` | 0 | 12+ | S8–S9 |
| **Notifications (in-app)** | `/users/me/notifications` | 0 | 4 | S9 |
| **Analytics** | `/analytics` | 0 | 8+ | S10–S11 |
| **Admin** | `/admin` | 0 | 8+ | S6+ |
| **Search / Public** | `/doctors/{id}/public`, `/search` | 0 | 6+ | S12–S13 |

---

## 7. API Details

> **Legend:** Each endpoint includes **Status: Implemented** or **Status: Planned**.
> Permission format matches JWT `permissions` claim (e.g., `patient:profile:read`).

---

### 7.1 Shared / Health

#### API-SHR-001: Health Check

| Field | Value |
|-------|-------|
| **Status** | Implemented |
| **HTTP Method** | `GET` |
| **URL** | `/health` |
| **Full URL (dev)** | `http://localhost:8080/api/v1/health` |
| **Description** | Returns service health status. Used for connectivity checks. |
| **Authentication Required** | No |
| **Allowed Roles** | Public |

**Request Headers:** None required.

**Response (200):**

```json
{
  "status": "UP",
  "service": "health360-api",
  "version": "0.1.0-SNAPSHOT",
  "timestamp": "2026-07-30T10:30:00.123456789Z",
  "phase": "Phase 1 — S0 Kickoff"
}
```

> **Note:** Health endpoint does **not** use `ApiResponse` envelope.

**Example cURL:**

```bash
curl -s http://localhost:8080/api/v1/health
```

---

### 7.2 Authentication (`/auth`)

#### API-IAM-001: Register User

| Field | Value |
|-------|-------|
| **Status** | Implemented |
| **HTTP Method** | `POST` |
| **URL** | `/auth/register` |
| **Description** | Creates a new user account with PATIENT or DOCTOR role. Sends verification email. |
| **Authentication Required** | No |
| **Allowed Roles** | Public |

**Request Body:** `RegisterRequest`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | Yes | Valid email, max 255 |
| `password` | string | Yes | Min 8 chars; upper, lower, digit, special (`!@#$%^&*()_+=-`) |
| `confirmPassword` | string | Yes | Must match `password` |
| `firstName` | string | Yes | 1–100 chars; letters, spaces, `.`, `'`, `-` |
| `lastName` | string | Yes | 1–100 chars |
| `phone` | string | Yes | E.164 or Indian 10-digit (`6-9` prefix) |
| `role` | enum | Yes | `PATIENT` \| `DOCTOR` |
| `acceptTerms` | boolean | Yes | Must be `true` |

**HTTP Status Codes:** `201 Created`, `400 Validation`, `409 Duplicate Email`

**Example Request:**

```json
{
  "email": "mobile.patient@health360.test",
  "password": "SecureP@ss1!",
  "confirmPassword": "SecureP@ss1!",
  "firstName": "Mobile",
  "lastName": "Patient",
  "phone": "9876543210",
  "role": "PATIENT",
  "acceptTerms": true
}
```

**Example Response (201):**

```json
{
  "success": true,
  "data": {
    "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "email": "mobile.patient@health360.test",
    "status": "PENDING_VERIFICATION",
    "message": "Registration successful. Please verify your email."
  },
  "timestamp": "2026-07-30T10:30:00.123Z"
}
```

**Example Error (409):**

```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_EMAIL",
    "message": "Email is already registered",
    "correlationId": "abc-123",
    "timestamp": "2026-07-30T10:30:00.123Z"
  }
}
```

**Example cURL:**

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"mobile.patient@health360.test","password":"SecureP@ss1!","confirmPassword":"SecureP@ss1!","firstName":"Mobile","lastName":"Patient","phone":"9876543210","role":"PATIENT","acceptTerms":true}'
```

**Business Rules:**
- User created with status `PENDING_VERIFICATION`
- Default notification preferences seeded on first access
- No patient/doctor profile created at registration

---

#### API-IAM-002: Verify Email

| Field | Value |
|-------|-------|
| **Status** | Implemented |
| **HTTP Method** | `GET` |
| **URL** | `/auth/verify-email?token={token}` |
| **Description** | Activates account after email verification link is clicked. |
| **Authentication Required** | No |

**Query Parameters:**

| Name | Required | Description |
|------|----------|-------------|
| `token` | Yes | Email verification token from registration email |

**HTTP Status Codes:** `200 OK`, `400 Invalid/Expired Token`, `404 User Not Found`

**Example cURL:**

```bash
curl "http://localhost:8080/api/v1/auth/verify-email?token=eyJhbGciOiJIUzI1NiJ9..."
```

**Example Response (200):**

```json
{
  "success": true,
  "message": "Email verified successfully. You can now log in.",
  "timestamp": "2026-07-30T10:30:00.123Z"
}
```

---

#### API-IAM-003: Resend Verification Email

| Field | Value |
|-------|-------|
| **Status** | Implemented |
| **HTTP Method** | `POST` |
| **URL** | `/auth/resend-verification` |
| **Authentication Required** | No |

**Request Body:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | Yes | Valid email |

**Example Request:** `{ "email": "mobile.patient@health360.test" }`

**Example Response (200):**

```json
{
  "success": true,
  "message": "Verification email sent",
  "timestamp": "2026-07-30T10:30:00.123Z"
}
```

---

#### API-IAM-004: Login

| Field | Value |
|-------|-------|
| **Status** | Implemented |
| **HTTP Method** | `POST` |
| **URL** | `/auth/login` |
| **Description** | Authenticates user and returns JWT token pair. |
| **Authentication Required** | No |

**Request Body:** `LoginRequest`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | Yes | Valid email |
| `password` | string | Yes | Not blank |
| `deviceInfo` | string | No | Optional device identifier for audit |

**HTTP Status Codes:** `200`, `401 Invalid Credentials`, `403 Email Not Verified / Deactivated`, `423 Locked`

**Example Request:**

```json
{
  "email": "s2test@health360.test",
  "password": "SecureP@ss1!",
  "deviceInfo": "ReactNative/iOS/17.0"
}
```

**Example Response (200):**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
    "expiresIn": 900,
    "tokenType": "Bearer",
    "user": {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "email": "s2test@health360.test",
      "firstName": "Test",
      "lastName": "Patient",
      "phone": "9876543210",
      "avatarUrl": null,
      "roles": ["PATIENT"],
      "permissions": ["health:read", "user:read", "user:write", "patient:profile:read", "patient:profile:write"],
      "status": "ACTIVE",
      "emailVerified": true,
      "timezone": "Asia/Kolkata",
      "locale": "en-IN"
    }
  },
  "timestamp": "2026-07-30T10:30:00.123Z"
}
```

**Example Error (403 — Email Not Verified):**

```json
{
  "success": false,
  "error": {
    "code": "EMAIL_NOT_VERIFIED",
    "message": "Please verify your email before logging in",
    "correlationId": "abc-123",
    "timestamp": "2026-07-30T10:30:00.123Z"
  }
}
```

**Example cURL:**

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"s2test@health360.test","password":"SecureP@ss1!"}'
```

---

#### API-IAM-005: Refresh Token

| Field | Value |
|-------|-------|
| **Status** | Implemented |
| **HTTP Method** | `POST` |
| **URL** | `/auth/refresh` |
| **Authentication Required** | No |

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `refreshToken` | string | Yes |

**Example Request:** `{ "refreshToken": "550e8400-e29b-41d4-a716-446655440000" }`

**Response:** Same structure as Login (`AuthTokenResponse`)

**HTTP Status Codes:** `200`, `401 TOKEN_EXPIRED / UNAUTHORIZED`

---

#### API-IAM-006: Logout

| Field | Value |
|-------|-------|
| **Status** | Implemented |
| **HTTP Method** | `POST` |
| **URL** | `/auth/logout` |
| **Authentication Required** | Yes |

**Request Headers:**

| Header | Required |
|--------|----------|
| `Authorization` | Yes |
| `X-Refresh-Token` | Optional |

**HTTP Status Codes:** `204 No Content`

**Example cURL:**

```bash
curl -X POST http://localhost:8080/api/v1/auth/logout \
  -H "Authorization: Bearer <access_token>" \
  -H "X-Refresh-Token: <refresh_token>"
```

---

#### API-IAM-007: Change Password

| Field | Value |
|-------|-------|
| **Status** | Implemented |
| **HTTP Method** | `PUT` |
| **URL** | `/auth/password` |
| **Authentication Required** | Yes |
| **Permission** | Authenticated user (any role) |

**Request Body:** `ChangePasswordRequest`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `currentPassword` | string | Yes | Not blank |
| `newPassword` | string | Yes | ValidPassword rules |
| `confirmPassword` | string | Yes | Must match `newPassword` |

**HTTP Status Codes:** `200`, `400 Invalid Current Password`

**Business Rules:** Invalidates current access token; user must re-login.

---

#### API-IAM-008 through API-IAM-014 (Planned)

| Endpoint | Status | Sprint |
|----------|--------|--------|
| `GET /users/me/notifications` | Planned | S9 |
| `PATCH /users/me/notifications/{id}/read` | Planned | S9 |
| `DELETE /users/me` (deactivate account) | Planned | S14 |

---

### 7.3 User Account (`/users`)

#### API-USR-001: Get Current User

| Field | Value |
|-------|-------|
| **Status** | Implemented |
| **HTTP Method** | `GET` |
| **URL** | `/users/me` |
| **Authentication Required** | Yes |
| **Permission** | Authenticated (any role with valid token) |

**Example Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "email": "s2test@health360.test",
    "firstName": "Test",
    "lastName": "Patient",
    "phone": "9876543210",
    "avatarUrl": null,
    "roles": ["PATIENT"],
    "permissions": ["health:read", "user:read", "user:write", "patient:profile:read", "patient:profile:write"],
    "status": "ACTIVE",
    "emailVerified": true,
    "timezone": "Asia/Kolkata",
    "locale": "en-IN"
  },
  "timestamp": "2026-07-30T10:30:00.123Z"
}
```

---

#### API-USR-002: Update Current User

| Field | Value |
|-------|-------|
| **Status** | Implemented |
| **HTTP Method** | `PATCH` |
| **URL** | `/users/me` |
| **Permission** | `user:write` |

**Request Body:** `UpdateUserProfileRequest` (all fields optional)

| Field | Type | Validation |
|-------|------|------------|
| `firstName` | string | 1–100 chars |
| `lastName` | string | 1–100 chars |
| `phone` | string | Phone pattern |
| `avatarUrl` | string | Max 500 |
| `timezone` | string | Max 50 |
| `locale` | string | Max 10 |

---

#### API-USR-003: Get Notification Preferences

| Field | Value |
|-------|-------|
| **Status** | Implemented |
| **HTTP Method** | `GET` |
| **URL** | `/users/me/notification-preferences` |
| **Authentication Required** | Yes |

**Example Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "notificationType": "APPOINTMENT_CONFIRMATION",
      "emailEnabled": true,
      "smsEnabled": true,
      "inAppEnabled": true
    },
    {
      "notificationType": "VERIFICATION_STATUS",
      "emailEnabled": true,
      "smsEnabled": false,
      "inAppEnabled": true
    }
  ],
  "timestamp": "2026-07-30T10:30:00.123Z"
}
```

---

#### API-USR-004: Update Notification Preferences

| Field | Value |
|-------|-------|
| **Status** | Implemented |
| **HTTP Method** | `PUT` |
| **URL** | `/users/me/notification-preferences` |
| **Authentication Required** | Yes |

**Request Body:** Array of `NotificationPreferenceItemRequest`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `notificationType` | string | Yes | Valid `NotificationType` enum, max 50 |
| `emailEnabled` | boolean | Yes | — |
| `smsEnabled` | boolean | Yes | Only effective for appointment types |
| `inAppEnabled` | boolean | Yes | Always forced `true` by backend |

---

### 7.4 Patient Profile (`/patients`)

> **Permission pattern:** Read endpoints require `patient:profile:read`. Write endpoints require `patient:profile:write`. Role: `PATIENT`.

#### API-PAT-001: Get My Patient Profile

| Field | Value |
|-------|-------|
| **Status** | Implemented |
| **HTTP Method** | `GET` |
| **URL** | `/patients/me/profile` |
| **Permission** | `patient:profile:read` |

**Business Rules:**
- Returns `404` if profile does not exist (before consent)
- Includes nested sections: basicInfo, contactInfo, physicalMeasurements, lifestyle, medical lists, emergency contacts

**Example Response (200):** See Section 8 — `PatientProfileResponse`

**Example cURL:**

```bash
curl http://localhost:8080/api/v1/patients/me/profile \
  -H "Authorization: Bearer <token>"
```

---

#### API-PAT-002: Accept Health Data Consent

| Field | Value |
|-------|-------|
| **Status** | Implemented |
| **HTTP Method** | `POST` |
| **URL** | `/patients/me/profile/consent` |
| **Permission** | `patient:profile:write` |

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `accepted` | boolean | Yes (must be `true`) |

**Business Rules:** Creates patient profile if not exists. Required before profile updates.

**Example Request:** `{ "accepted": true }`

---

#### API-PAT-003: Update Basic Information

| Field | Value |
|-------|-------|
| **Status** | Implemented |
| **HTTP Method** | `PUT` |
| **URL** | `/patients/me/profile/basic-info` |
| **Permission** | `patient:profile:write` |

**Request Body:** `UpdateBasicInfoRequest`

| Field | Type | Validation |
|-------|------|------------|
| `dateOfBirth` | date | Must be in the past |
| `gender` | string | Max 30 |
| `bloodGroup` | string | Max 5 |
| `maritalStatus` | string | Max 20 |
| `nationality` | string | ISO 3166-1 alpha-2 (2 chars) |
| `profilePhotoUrl` | string | Max 500 |

**Example Request:**

```json
{
  "dateOfBirth": "1990-05-15",
  "gender": "MALE",
  "bloodGroup": "O_POSITIVE",
  "maritalStatus": "SINGLE",
  "nationality": "IN"
}
```

**Response:** Full `PatientProfileResponse` with updated `completionScore`.

---

#### API-PAT-004: Update Contact Information

| Field | Value |
|-------|-------|
| **Status** | Implemented |
| **HTTP Method** | `PUT` |
| **URL** | `/patients/me/profile/contact-info` |

**Request Body:** `UpdateContactInfoRequest`

| Field | Type | Validation |
|-------|------|------------|
| `primaryPhone` | string | Max 20 |
| `secondaryPhone` | string | Max 20 |
| `permanentAddress` | AddressDto | Nested validation |
| `currentAddress` | AddressDto | Nested validation |
| `sameAsPermanentAddress` | boolean | Optional |

**AddressDto fields:** `line1`, `line2` (max 200), `city`, `state` (max 100), `pincode` (6 digits), `country` (2 chars)

---

#### API-PAT-005: Update Physical Measurements

| Field | Value |
|-------|-------|
| **Status** | Implemented |
| **HTTP Method** | `PUT` |
| **URL** | `/patients/me/profile/physical-measurements` |

**Request Body:** `UpdatePhysicalMeasurementsRequest`

| Field | Type | Validation |
|-------|------|------------|
| `heightCm` | decimal | 30–300 |
| `weightKg` | decimal | 1–500 |
| `waistCm` | decimal | Optional |
| `hipCm` | decimal | Optional |
| `neckCm` | decimal | Optional |
| `bodyFatPercent` | decimal | Optional |
| `measuredAt` | instant | **Required** |

**Business Rules:** Appends entry to measurement history on save.

---

#### API-PAT-006: Get Physical Measurement History

| Field | Value |
|-------|-------|
| **Status** | Implemented |
| **HTTP Method** | `GET` |
| **URL** | `/patients/me/profile/physical-measurements/history` |
| **Pagination** | Yes — see Section 15 |

**Query Parameters:** `page`, `size`, `sort` (default: `measuredAt,desc`)

---

#### API-PAT-007: Update Lifestyle Profile

| Field | Value |
|-------|-------|
| **Status** | Implemented |
| **HTTP Method** | `PUT` |
| **URL** | `/patients/me/profile/lifestyle` |

**Request Body:** `UpdateLifestyleRequest` — all fields optional

| Field | Max Length | Notes |
|-------|------------|-------|
| `smokingStatus` | 20 | See enums |
| `smokingFrequency` | 20 | |
| `alcoholConsumption` | 20 | |
| `exerciseFrequency` | 20 | |
| `exerciseType` | 100 | |
| `exerciseDurationMinutes` | integer | |
| `occupationType` | 20 | |
| `averageSleepHours` | decimal | |
| `dietaryPreference` | 20 | |
| `stressLevel` | integer | 1–5 |

---

#### API-PAT-008: Get Profile Completion

| Field | Value |
|-------|-------|
| **Status** | Implemented |
| **HTTP Method** | `GET` |
| **URL** | `/patients/me/profile/completion` |

**Example Response (200):**

```json
{
  "success": true,
  "data": {
    "completionScore": 45,
    "sections": [
      {
        "name": "BASIC_INFO",
        "weight": 13,
        "completed": true,
        "missingFields": []
      },
      {
        "name": "VITALS",
        "weight": 15,
        "completed": false,
        "missingFields": ["At least one vital recording"]
      }
    ]
  },
  "timestamp": "2026-07-30T10:30:00.123Z"
}
```

**Section weights:** BASIC_INFO 13%, CONTACT_INFO 13%, PHYSICAL_MEASUREMENTS 18%, LIFESTYLE 13%, MEDICAL_INFO 18%, EMERGENCY_CONTACTS 10%, VITALS 15%.

---

#### API-PAT-009 to API-PAT-014: Medical & Emergency CRUD

All endpoints follow the same pattern:

| Resource | Base Path | Methods |
|----------|-----------|---------|
| Allergies | `/patients/me/profile/allergies` | GET, POST |
| Allergies by ID | `/patients/me/profile/allergies/{id}` | PUT, DELETE |
| Medications | `/patients/me/profile/medications` | GET, POST |
| Medications by ID | `/patients/me/profile/medications/{id}` | PUT, DELETE |
| Surgeries | `/patients/me/profile/surgeries` | GET, POST |
| Surgeries by ID | `/patients/me/profile/surgeries/{id}` | PUT, DELETE |
| Chronic Conditions | `/patients/me/profile/chronic-conditions` | GET, POST |
| Chronic Conditions by ID | `/patients/me/profile/chronic-conditions/{id}` | PUT, DELETE |
| Emergency Contacts | `/patients/me/profile/emergency-contacts` | GET, POST |
| Emergency Contacts by ID | `/patients/me/profile/emergency-contacts/{id}` | PUT, DELETE |

**Status:** All **Implemented**

**Path Variable:** `id` — UUID of the resource

**Example — Create Allergy (POST `/patients/me/profile/allergies`):**

Request:
```json
{
  "name": "Penicillin",
  "severity": "SEVERE",
  "reaction": "Anaphylaxis",
  "diagnosedDate": "2015-03-10"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "name": "Penicillin",
    "severity": "SEVERE",
    "reaction": "Anaphylaxis",
    "diagnosedDate": "2015-03-10"
  },
  "timestamp": "2026-07-30T10:30:00.123Z"
}
```

**Business Rules:**
- Emergency contacts: maximum **5** per patient
- All deletes are soft-deletes
- Medical info contributes to profile completion when at least one allergy, medication, or condition exists

**Request DTO Validation Summary:**

| DTO | Required Fields |
|-----|-----------------|
| `AllergyRequest` | `name`, `severity` |
| `MedicationRequest` | `name` |
| `SurgeryRequest` | `procedureName` |
| `ChronicConditionRequest` | `conditionName`, `status` |
| `EmergencyContactRequest` | `name`, `relationship`, `phone` |

---

#### API-PAT-016: Record Vital Signs

| Field | Value |
|-------|-------|
| **Status** | Implemented |
| **HTTP Method** | `POST` |
| **URL** | `/patients/me/profile/vitals` |
| **Permission** | `patient:profile:write` |

**Request Body:** `RecordVitalSignsRequest`

| Field | Type | Validation |
|-------|------|------------|
| `systolicBp` | integer | 40–300 |
| `diastolicBp` | integer | 20–200 |
| `heartRate` | integer | 20–300 |
| `temperature` | decimal | 30.0–45.0 °C |
| `respiratoryRate` | integer | Optional |
| `spo2` | integer | 50–100 |
| `bloodGlucose` | decimal | 20–600 |
| `glucoseReadingType` | string | Optional |
| `recordedAt` | instant | **Required** |

**HTTP Status Codes:** `201 Created`, `400 Validation`

**Business Rules:**
- BP classification calculated on save (`NORMAL`, `WARNING`, `CRITICAL`, `INVALID`)
- At least one vital field should be provided

**Example Request:**

```json
{
  "systolicBp": 120,
  "diastolicBp": 80,
  "heartRate": 72,
  "spo2": 98,
  "recordedAt": "2026-07-30T10:30:00.000Z"
}
```

**Example Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "8d9e6679-7425-40de-944b-e07fc1f90ae7",
    "systolicBp": 120,
    "diastolicBp": 80,
    "heartRate": 72,
    "temperature": null,
    "respiratoryRate": null,
    "spo2": 98,
    "bloodGlucose": null,
    "glucoseReadingType": null,
    "recordedAt": "2026-07-30T10:30:00.000Z",
    "bpClassification": "NORMAL",
    "bpInterpretation": "Your blood pressure 120/80 mmHg is within the normal range."
  },
  "timestamp": "2026-07-30T10:30:00.123Z"
}
```

---

#### API-PAT-017: Get Vital Signs History

| Field | Value |
|-------|-------|
| **Status** | Implemented |
| **HTTP Method** | `GET` |
| **URL** | `/patients/me/profile/vitals` |
| **Pagination** | Yes |

**Query Parameters:**

| Name | Required | Description |
|------|----------|-------------|
| `fromDate` | No | ISO-8601 datetime filter |
| `toDate` | No | ISO-8601 datetime filter |
| `page` | No | Page number (0-based) |
| `size` | No | Page size (default 20) |
| `sort` | No | Default `recordedAt,desc` |

---

#### API-PAT-018: Get Latest Vital Signs

| Field | Value |
|-------|-------|
| **Status** | Implemented |
| **HTTP Method** | `GET` |
| **URL** | `/patients/me/profile/vitals/latest` |

**Response:** Single `VitalSignResponse` or `null` data if no records.

---

#### API-PAT Planned Endpoints

| Endpoint | Status | Sprint |
|----------|--------|--------|
| `PUT /patients/me/profile/goals` | Planned | S14 |
| `POST /patients/me/profile/lab-values` | Planned | S14 |
| `GET /patients/me/profile/lab-values` | Planned | S14 |
| `POST /patients/me/profile/documents` | Planned | S14 |
| `GET /patients/me/profile/documents` | Planned | S14 |
| `GET /patients/me/profile/timeline` | Planned | S14 |
| `GET /patients/{id}/summary` (doctor view) | Planned | S15 |

---

### 7.5 Doctor Profile (`/doctors`)

> **Permission pattern:** `doctor:profile:read` / `doctor:profile:write`. Role: `DOCTOR`.

#### API-DOC-001: Get My Doctor Profile

| Field | Value |
|-------|-------|
| **Status** | Implemented |
| **HTTP Method** | `GET` |
| **URL** | `/doctors/me/profile` |

**Business Rules:**
- Auto-creates profile in `DRAFT` status on first access (AC-DOC-001)
- Draft profiles are not publicly searchable (AC-DOC-002)

**Example Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "9e0f6679-7425-40de-944b-e07fc1f90ae7",
    "verificationStatus": "DRAFT",
    "professionalDetails": {
      "title": "DR",
      "medicalRegistrationNumber": null,
      "registrationCouncil": null,
      "registrationYear": null,
      "registrationExpiry": null,
      "gender": null,
      "biography": null,
      "profilePhotoUrl": null,
      "totalYearsExperience": null
    },
    "specialization": {
      "primarySpecializationId": null,
      "primarySpecializationName": null,
      "subSpecializations": []
    },
    "qualifications": [],
    "experience": [],
    "consultationDefaults": []
  },
  "timestamp": "2026-07-30T10:30:00.123Z"
}
```

---

#### API-DOC-002: Update Professional Details

| Field | Value |
|-------|-------|
| **Status** | Implemented |
| **HTTP Method** | `PUT` |
| **URL** | `/doctors/me/profile/professional-details` |

**Request Body:** `UpdateProfessionalDetailsRequest`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `title` | string | Yes | Max 10 (`DR`, `PROF`, `MR`, `MS`) |
| `medicalRegistrationNumber` | string | No | Max 100; unique per tenant |
| `registrationCouncil` | string | No | Max 200 |
| `registrationYear` | integer | No | 1950–2100 |
| `registrationExpiry` | date | No | |
| `gender` | string | No | Max 30 |
| `totalYearsExperience` | integer | No | 0–60 |

**HTTP Status Codes:** `200`, `409 DUPLICATE_REGISTRATION`, `403` (if not DRAFT/REJECTED)

**Example Request:**

```json
{
  "title": "DR",
  "medicalRegistrationNumber": "MH-123456",
  "registrationCouncil": "Maharashtra Medical Council",
  "registrationYear": 2015,
  "gender": "MALE",
  "totalYearsExperience": 8
}
```

---

#### API-DOC-003: Qualifications CRUD

| Endpoint | Method | Status |
|----------|--------|--------|
| `/doctors/me/profile/qualifications` | GET | Implemented |
| `/doctors/me/profile/qualifications` | POST | Implemented |
| `/doctors/me/profile/qualifications/{id}` | PUT | Implemented |
| `/doctors/me/profile/qualifications/{id}` | DELETE | Implemented |

**Request Body:** `QualificationRequest`

| Field | Required | Validation |
|-------|----------|------------|
| `degree` | Yes | Max 200 |
| `institution` | Yes | Max 200 |
| `yearOfCompletion` | Yes | 1950–2100 |
| `country` | No | 2-char ISO (default `IN`) |

**Example POST Request:**

```json
{
  "degree": "MBBS",
  "institution": "AIIMS Delhi",
  "yearOfCompletion": 2010,
  "country": "IN"
}
```

---

#### API-DOC-004: Experience CRUD

| Endpoint | Method | Status |
|----------|--------|--------|
| `/doctors/me/profile/experience` | GET | Implemented |
| `/doctors/me/profile/experience` | POST | Implemented |
| `/doctors/me/profile/experience/{id}` | PUT | Implemented |
| `/doctors/me/profile/experience/{id}` | DELETE | Implemented |

**Request Body:** `ExperienceRequest`

| Field | Required | Validation |
|-------|----------|------------|
| `institution` | Yes | Max 200 |
| `position` | Yes | Max 200 |
| `startYear` | Yes | 1950–2100 |
| `endYear` | No | Must be ≥ startYear; null = current |

---

#### API-DOC-005: Update Specialization

| Field | Value |
|-------|-------|
| **Status** | Implemented |
| **HTTP Method** | `PUT` |
| **URL** | `/doctors/me/profile/specialization` |

**Request Body:** `UpdateSpecializationRequest`

| Field | Type | Required |
|-------|------|----------|
| `primarySpecializationId` | UUID | Yes |
| `subSpecializationIds` | UUID[] | No |

**Business Rules:**
- Primary specialization must exist in `shared.specializations` taxonomy
- Sub-specializations cannot duplicate primary

**Example Request:**

```json
{
  "primarySpecializationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "subSpecializationIds": []
}
```

---

#### API-DOC-006: List Specializations (Reference Data)

| Field | Value |
|-------|-------|
| **Status** | Implemented |
| **HTTP Method** | `GET` |
| **URL** | `/doctors/specializations` |
| **Permission** | `doctor:profile:read` |

**Example Response (200):**

```json
{
  "success": true,
  "data": [
    { "id": "...", "code": "GENERAL_PHYSICIAN", "name": "General Physician" },
    { "id": "...", "code": "CARDIOLOGIST", "name": "Cardiologist" }
  ],
  "timestamp": "2026-07-30T10:30:00.123Z"
}
```

---

#### API-DOC-007: Update Consultation Defaults

| Field | Value |
|-------|-------|
| **Status** | Implemented |
| **HTTP Method** | `PUT` |
| **URL** | `/doctors/me/profile/consultation-defaults` |

**Request Body:** `UpdateConsultationDefaultsRequest`

```json
{
  "configs": [
    {
      "consultationType": "IN_PERSON",
      "feeAmount": 500.00,
      "currency": "INR",
      "durationMinutes": 15
    },
    {
      "consultationType": "FOLLOW_UP",
      "feeAmount": 0,
      "currency": "INR",
      "durationMinutes": 15
    }
  ]
}
```

**Business Rules:**
- `feeAmount` ≥ 0; `0` displayed as **"Free Consultation"**
- Allowed types: `IN_PERSON`, `FOLLOW_UP`
- Profile-level defaults until hospital associations (S7)

---

#### API-DOC Planned Endpoints

| Endpoint | Status | Sprint |
|----------|--------|--------|
| `POST /doctors/me/profile/languages` | Planned | S6 |
| `PUT /doctors/me/profile/biography` | Planned | S6 |
| `POST /doctors/me/profile/verification-documents` | Planned | S6 |
| `POST /doctors/me/profile/submit-verification` | Planned | S6 |
| `GET /doctors/{doctorId}/public` | Planned | S13 |
| `GET /doctors/me/hospital-associations` | Planned | S7 |

---

### 7.6 RBAC Probes (`/rbac`) — Development/Testing

| Endpoint | Method | Permission | Status |
|----------|--------|------------|--------|
| `/rbac/patient-profile` | GET | `patient:profile:read` | Implemented |
| `/rbac/doctor-profile` | GET | `doctor:profile:read` | Implemented |
| `/rbac/admin-users` | GET | `admin:users:read` | Implemented |

> These endpoints are for RBAC verification during development. Do not use in production mobile flows.

---

### 7.7 Hospital, Scheduling, Analytics, Admin (Planned)

Refer to [DOC-07](../07-REST-API-DESIGN-SPECIFICATION.md) for planned API specifications. None of these modules have production controllers implemented yet.

| Module | Planned Sprint | Key Planned Endpoints |
|--------|----------------|----------------------|
| Hospital | S7 | `POST /hospitals`, `GET /hospitals/me/profile` |
| Scheduling | S8–S9 | `POST /scheduling/appointments`, `GET /scheduling/doctors/{id}/availability` |
| Analytics | S10–S11 | `GET /analytics/patients/me/dashboard` |
| Admin | S6+ | `GET /admin/users`, `PATCH /admin/users/{id}/status` |

**Status:** All **Planned**

---

## 8. Request/Response DTOs

### 8.1 Authentication DTOs

#### RegisterRequest

| Field | Type | Required | Nullable | Validation |
|-------|------|----------|----------|------------|
| email | string | Yes | No | Email, max 255 |
| password | string | Yes | No | ValidPassword |
| confirmPassword | string | Yes | No | Must match password |
| firstName | string | Yes | No | 1–100, name pattern |
| lastName | string | Yes | No | 1–100 |
| phone | string | Yes | No | Phone regex |
| role | RegistrationRole | Yes | No | PATIENT, DOCTOR |
| acceptTerms | boolean | Yes | No | Must be true |

#### LoginRequest

| Field | Type | Required |
|-------|------|----------|
| email | string | Yes |
| password | string | Yes |
| deviceInfo | string | No |

#### RefreshTokenRequest

| Field | Type | Required |
|-------|------|----------|
| refreshToken | string | Yes |

#### AuthTokenResponse

| Field | Type | Description |
|-------|------|-------------|
| accessToken | string | JWT access token |
| refreshToken | string | Opaque refresh token UUID |
| expiresIn | long | Access token TTL in seconds |
| tokenType | string | Always `"Bearer"` |
| user | UserProfileResponse | Embedded user with roles/permissions |

#### RegisterResponse

| Field | Type |
|-------|------|
| userId | UUID |
| email | string |
| status | string |
| message | string |

---

### 8.2 User DTOs

#### UserProfileResponse

| Field | Type | Nullable |
|-------|------|----------|
| id | UUID | No |
| email | string | No |
| firstName | string | No |
| lastName | string | No |
| phone | string | No |
| avatarUrl | string | Yes |
| roles | string[] | No |
| permissions | string[] | No |
| status | string | No |
| emailVerified | boolean | No |
| timezone | string | No |
| locale | string | No |

#### NotificationPreferenceResponse / NotificationPreferenceItemRequest

| Field | Type |
|-------|------|
| notificationType | string (NotificationType enum) |
| emailEnabled | boolean |
| smsEnabled | boolean |
| inAppEnabled | boolean |

---

### 8.3 Patient DTOs

#### PatientProfileResponse (top-level)

| Field | Type |
|-------|------|
| id | UUID |
| consentAccepted | boolean |
| consentAcceptedAt | Instant (nullable) |
| completionScore | int (0–100) |
| basicInfo | BasicInfoSection |
| contactInfo | ContactInfoSection |
| physicalMeasurements | PhysicalMeasurementsSection |
| lifestyle | LifestyleSection |
| allergies | AllergyResponse[] |
| medications | MedicationResponse[] |
| surgeries | SurgeryResponse[] |
| chronicConditions | ChronicConditionResponse[] |
| emergencyContacts | EmergencyContactResponse[] |

#### VitalSignResponse

| Field | Type |
|-------|------|
| id | UUID |
| systolicBp | Integer |
| diastolicBp | Integer |
| heartRate | Integer |
| temperature | BigDecimal |
| respiratoryRate | Integer |
| spo2 | Integer |
| bloodGlucose | BigDecimal |
| glucoseReadingType | String |
| recordedAt | Instant |
| bpClassification | String |
| bpInterpretation | String |

---

### 8.4 Doctor DTOs

#### DoctorProfileResponse

| Field | Type |
|-------|------|
| id | UUID |
| verificationStatus | string |
| professionalDetails | ProfessionalDetails |
| specialization | SpecializationInfo |
| qualifications | QualificationResponse[] |
| experience | ExperienceResponse[] |
| consultationDefaults | ConsultationDefaultResponse[] |

#### ConsultationDefaultResponse

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | |
| consultationType | string | IN_PERSON, FOLLOW_UP |
| feeAmount | BigDecimal | |
| currency | string | Default INR |
| durationMinutes | int | |
| feeDisplay | string | "Free Consultation" when fee is 0 |

---

## 9. Enumerations

### 9.1 RegistrationRole (Backend Enum)

| Value | Description |
|-------|-------------|
| `PATIENT` | Patient portal access |
| `DOCTOR` | Doctor portal access |

### 9.2 IAM Roles (Database Seed)

| Role | Permissions (current) |
|------|----------------------|
| `PATIENT` | health:read, user:read, user:write, patient:profile:read, patient:profile:write |
| `DOCTOR` | health:read, user:read, user:write, doctor:profile:read, doctor:profile:write |
| `HOSPITAL_ADMIN` | health:read, user:read, user:write |
| `PLATFORM_ADMIN` | All above + admin:users:read, admin:users:write |

### 9.3 User Status

| Value | Description |
|-------|-------------|
| `PENDING_VERIFICATION` | Awaiting email verification |
| `ACTIVE` | Can login |
| `DEACTIVATED` | Account disabled |
| `LOCKED` | Too many failed login attempts |

### 9.4 Gender (Patient/Doctor Profile — String Values)

| Value | Used In |
|-------|---------|
| `MALE` | Patient basic info, Doctor profile |
| `FEMALE` | Patient basic info, Doctor profile |
| `OTHER` | Patient basic info |
| `PREFER_NOT_TO_SAY` | Patient basic info |

### 9.5 Blood Group (Patient — String Values)

| Value |
|-------|
| `A_POSITIVE`, `A_NEGATIVE`, `B_POSITIVE`, `B_NEGATIVE`, `AB_POSITIVE`, `AB_NEGATIVE`, `O_POSITIVE`, `O_NEGATIVE` |

### 9.6 Marital Status (Patient)

| Value |
|-------|
| `SINGLE`, `MARRIED`, `DIVORCED`, `WIDOWED` |

### 9.7 Lifestyle Enums (Patient — String Values)

| Category | Values |
|----------|--------|
| smokingStatus | `NEVER`, `FORMER`, `CURRENT` |
| smokingFrequency / exerciseFrequency | `DAILY`, `WEEKLY`, `OCCASIONALLY`, `RARELY`, `NEVER` |
| alcoholConsumption | `NEVER`, `OCCASIONAL`, `MODERATE`, `HEAVY` |
| occupationType | `SEDENTARY`, `MODERATE`, `ACTIVE`, `VERY_ACTIVE` |
| dietaryPreference | `VEGETARIAN`, `NON_VEGETARIAN`, `VEGAN`, `EGGETARIAN`, `OTHER` |

### 9.8 Allergy Severity

| Value |
|-------|
| `MILD`, `MODERATE`, `SEVERE` (and custom strings up to 20 chars) |

### 9.9 Doctor Verification Status

| Value | Description |
|-------|-------------|
| `DRAFT` | Profile being edited; not searchable |
| `PENDING_VERIFICATION` | Submitted for admin review |
| `VERIFIED` | Approved for public listing |
| `REJECTED` | Rejected; can re-edit |

### 9.10 Doctor Title

| Value |
|-------|
| `DR`, `PROF`, `MR`, `MS` |

### 9.11 Consultation Types

| Value | Phase 1 |
|-------|---------|
| `IN_PERSON` | Supported |
| `FOLLOW_UP` | Supported |
| `TELE` | Planned (Phase 2) |

### 9.12 Notification Types (Backend Enum)

| Value | SMS Configurable |
|-------|------------------|
| `APPOINTMENT_CONFIRMATION` | Yes |
| `APPOINTMENT_REMINDER_24H` | Yes |
| `APPOINTMENT_REMINDER_1H` | Yes |
| `APPOINTMENT_CANCELLATION` | Yes |
| `VERIFICATION_STATUS` | No |
| `REVIEW_PROMPT` | No |

### 9.13 BP Classification (Computed)

| Value | Meaning |
|-------|---------|
| `NORMAL` | Within normal range |
| `WARNING` | Elevated |
| `CRITICAL` | High — consult doctor |
| `INVALID` | Systolic ≤ diastolic |

### 9.14 Appointment Status (Planned — S8)

| Value |
|-------|
| `CONFIRMED`, `CANCELLED`, `COMPLETED`, `NO_SHOW`, `RESCHEDULED` |

### 9.15 Error Codes (Backend Enum)

| Code | Typical HTTP Status |
|------|---------------------|
| `VALIDATION_ERROR` | 400 |
| `DUPLICATE_EMAIL` | 409 |
| `DUPLICATE_REGISTRATION` | 409 |
| `INVALID_CREDENTIALS` | 401 |
| `UNAUTHORIZED` | 401 |
| `TOKEN_EXPIRED` | 401 |
| `FORBIDDEN` | 403 |
| `EMAIL_NOT_VERIFIED` | 403 |
| `ACCOUNT_LOCKED` | 423 |
| `ACCOUNT_DEACTIVATED` | 403 |
| `RESOURCE_NOT_FOUND` | 404 |
| `INTERNAL_ERROR` | 500 |

---

## 10. Authentication Flow Diagram

```mermaid
sequenceDiagram
    participant App as React Native App
    participant API as Health360 API
    participant Store as Secure Storage

    App->>API: POST /auth/login {email, password}
    alt Success
        API-->>App: 200 AuthTokenResponse
        App->>Store: Save refreshToken (Keychain)
        App->>App: Store accessToken in memory
    else Email not verified
        API-->>App: 403 EMAIL_NOT_VERIFIED
    else Invalid credentials
        API-->>App: 401 INVALID_CREDENTIALS
    end

    App->>API: GET /patients/me/profile (+ Bearer token)
    alt Token expired
        API-->>App: 401 Access token has expired
        App->>API: POST /auth/refresh {refreshToken}
        API-->>App: 200 New token pair
        App->>Store: Update refreshToken
        App->>API: Retry original request
    end

    App->>API: POST /auth/logout (+ Bearer + X-Refresh-Token)
    API-->>App: 204 No Content
    App->>Store: Clear all tokens
```

---

## 11. Registration Flow Diagram

```mermaid
sequenceDiagram
    participant App as React Native App
    participant API as Health360 API
    participant Email as Email Link / Deep Link

    App->>API: POST /auth/register {role: PATIENT|DOCTOR, ...}
    API-->>App: 201 RegisterResponse (PENDING_VERIFICATION)

    Email->>App: Deep link with verification token
    App->>API: GET /auth/verify-email?token=...
    API-->>App: 200 Email verified

    App->>API: POST /auth/login
    API-->>App: 200 AuthTokenResponse

    alt PATIENT role
        App->>API: POST /patients/me/profile/consent {accepted: true}
        API-->>App: 200 PatientProfileResponse
    else DOCTOR role
        App->>API: GET /doctors/me/profile
        API-->>App: 200 DoctorProfileResponse (DRAFT auto-created)
    end
```

---

## 12. Appointment Flow Diagram (Planned — S8)

```mermaid
sequenceDiagram
    participant Patient as Patient App
    participant API as Health360 API
    participant Doctor as Doctor Schedule

    Note over Patient,Doctor: Status: Planned — Not yet implemented

    Patient->>API: GET /scheduling/doctors/{id}/availability
    API-->>Patient: Available time slots

    Patient->>API: POST /scheduling/appointments {slotId, ...}
    API-->>Patient: 201 Appointment confirmed

    API->>Patient: Notification APPOINTMENT_CONFIRMATION
    API->>Doctor: Notification APPOINTMENT_CONFIRMATION
```

---

## 13. Patient Profile Flow

```mermaid
sequenceDiagram
    participant App as Patient Mobile App
    participant API as Health360 API

    App->>API: GET /patients/me/profile
    alt Profile not found (404)
        App->>API: POST /patients/me/profile/consent {accepted: true}
        API-->>App: 200 Profile created
    end

    App->>API: PUT /patients/me/profile/basic-info
    App->>API: PUT /patients/me/profile/contact-info
    App->>API: PUT /patients/me/profile/physical-measurements
    App->>API: POST /patients/me/profile/allergies
    App->>API: POST /patients/me/profile/vitals

    App->>API: GET /patients/me/profile/completion
    API-->>App: completionScore + section breakdown

    Note over App: Cache profile locally for offline viewing
```

---

## 14. Error Handling Guide

### 14.1 HTTP Status Reference

| Status | When | Mobile Action |
|--------|------|---------------|
| **400** | Validation failure, bad business rule | Show field errors from `error.details[]` |
| **401** | Missing/invalid/expired/revoked token | Refresh token or redirect to login |
| **403** | Insufficient permission, unverified email, deactivated account | Show message; do not retry |
| **404** | Resource not found | Show "not found"; may trigger create flow (consent) |
| **409** | Duplicate email or registration number | Show conflict message |
| **423** | Account locked (failed login attempts) | Show lockout message with retry time |
| **500** | Server error | Show generic error; log `correlationId` |

### 14.2 JWT-Specific Errors

| Scenario | Code | Message |
|----------|------|---------|
| Access token expired | `UNAUTHORIZED` | "Access token has expired" |
| Access token revoked (logout/password change) | `UNAUTHORIZED` | "Access token has been revoked" |
| Invalid token | `UNAUTHORIZED` | "Invalid access token" |
| Refresh token expired/invalid | `TOKEN_EXPIRED` / `UNAUTHORIZED` | Force full re-login |

### 14.3 Validation Errors

Always parse `error.details[]` array:

```typescript
interface ErrorDetail {
  field: string;
  message: string;
  code: string;
}
```

### 14.4 Database Errors

Unhandled database exceptions return **500** with `INTERNAL_ERROR`. Mobile should:
- Never expose raw error to user
- Log `correlationId` for support tickets
- Offer retry for idempotent GET requests

---

## 15. Pagination

Spring Data pagination is used for list endpoints.

### 15.1 Query Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `page` | `0` | Zero-based page index |
| `size` | `20` | Items per page |
| `sort` | varies | `field,direction` (e.g., `recordedAt,desc`) |

### 15.2 Paginated Response Structure

```json
{
  "success": true,
  "data": {
    "content": [ ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 20,
      "sort": { "sorted": true, "unsorted": false, "empty": false }
    },
    "totalElements": 45,
    "totalPages": 3,
    "last": false,
    "first": true,
    "numberOfElements": 20,
    "size": 20,
    "number": 0,
    "empty": false
  },
  "timestamp": "2026-07-30T10:30:00.123Z"
}
```

### 15.3 Paginated Endpoints (Implemented)

| Endpoint | Default Sort |
|----------|--------------|
| `GET /patients/me/profile/vitals` | `recordedAt,desc` |
| `GET /patients/me/profile/physical-measurements/history` | `measuredAt,desc` |

### 15.4 Filtering

| Endpoint | Filter Params |
|----------|---------------|
| Vitals history | `fromDate`, `toDate` (ISO-8601) |

---

## 16. File Upload APIs

**Status: Planned** — No multipart upload endpoints are implemented in the current backend.

Planned endpoints (S6/S14 per DOC-07):

| Endpoint | Purpose | Sprint |
|----------|---------|--------|
| `POST /doctors/me/profile/verification-documents` | Doctor credential upload | S6 |
| `POST /patients/me/profile/documents` | Patient health documents | S14 |

Expected constraints (from DOC-07/DOC-09 — subject to change):

| Constraint | Expected Value |
|------------|----------------|
| Max file size | 10 MB |
| Allowed formats | PDF, JPEG, PNG |
| Content-Type | `multipart/form-data` |
| Oversized response | 413 Payload Too Large |

---

## 17. Mobile Offline Strategy

### 17.1 Recommended Cache Targets

| Data | Cache Strategy | TTL | Sync Trigger |
|------|----------------|-----|--------------|
| **User profile** (`/users/me`) | Secure cache | 24h | App launch, after PATCH |
| **Patient profile** | Encrypted local DB | 5 min stale | App launch, pull-to-refresh, after any save |
| **Doctor profile** | Encrypted local DB | 5 min stale | App launch, after any save |
| **Profile completion** | Derived from profile cache | — | After section save |
| **Specializations list** | AsyncStorage/SQLite | 24h | App launch (doctor app) |
| **Notification preferences** | Local cache | 1h | Settings screen open |
| **Vitals history** | Paginated cache | 5 min | Vitals screen, after record |
| **Latest vitals** | Memory + cache | 1 min | Dashboard focus |

### 17.2 Do NOT Cache

- Access tokens (memory only)
- Refresh tokens (Keychain only — not in app state snapshots)
- Auth endpoints responses

### 17.3 Sync Strategy

```
App Launch → Refresh token if needed → Fetch /users/me
          → Fetch role-specific profile
          → Background sync pending offline writes (future)

Pull-to-Refresh → Invalidate cache → Re-fetch active screen data

After Save → Optimistic UI update → PUT/POST → On success update cache
                                        → On failure revert + show error
```

---

## 18. API Dependency Matrix

```
Registration + Email Verification
        ↓
     Login
        ↓
   ┌────┴────┐
   ↓         ↓
PATIENT    DOCTOR
   ↓         ↓
Consent    GET /doctors/me/profile (auto-create DRAFT)
   ↓         ↓
Profile    Professional Details → Qualifications → Experience
Sections       ↓
   ↓       Specialization + Consultation Fees
Vitals         ↓
   ↓       Verification (Planned S6)
Completion
   ↓
Dashboard (Planned S11 — Analytics)
   ↓
Appointments (Planned S8 — requires Doctor VERIFIED + Hospital S7)
```

---

## 19. Development Order

Recommended mobile sprint alignment with backend availability:

| Phase | Mobile Feature | Backend Dependency | Sprint |
|-------|----------------|-------------------|--------|
| 1 | Auth (register, login, refresh, logout) | IAM | S1–S2 ✅ |
| 2 | User settings + notification prefs | IAM | S1–S2 ✅ |
| 3 | Patient consent + profile sections | Patient | S3 ✅ |
| 4 | Vitals + completion score | Patient | S4 ✅ |
| 5 | Doctor professional profile | Doctor | S5 ✅ |
| 6 | Doctor verification upload | Doctor | S6 |
| 7 | Hospital association (doctor) | Hospital | S7 |
| 8 | Appointment booking | Scheduling | S8 |
| 9 | Push/in-app notifications | Notifications | S9 |
| 10 | Health dashboard/analytics | Analytics | S10–S11 |
| 11 | Search + public profiles | Search | S12–S13 |

---

## 20. React Native Folder Recommendation

```
mobile/
├── src/
│   ├── screens/           # Screen components by feature
│   │   ├── auth/
│   │   ├── patient/
│   │   ├── doctor/
│   │   └── settings/
│   ├── components/        # Reusable UI (forms, cards, loaders)
│   ├── navigation/        # React Navigation stacks/tabs
│   │   ├── PatientNavigator.tsx
│   │   ├── DoctorNavigator.tsx
│   │   └── AuthNavigator.tsx
│   ├── services/          # API client layer
│   │   ├── apiClient.ts   # Axios + interceptors (mirrors web client)
│   │   ├── authService.ts
│   │   ├── patientService.ts
│   │   └── doctorService.ts
│   ├── hooks/             # React Query hooks (mirror web patterns)
│   │   ├── useAuth.ts
│   │   ├── usePatientProfile.ts
│   │   └── useDoctorProfile.ts
│   ├── store/             # Auth state (Zustand or Redux)
│   ├── types/             # TypeScript interfaces matching backend DTOs
│   │   ├── api.types.ts
│   │   ├── patient.types.ts
│   │   └── doctor.types.ts
│   ├── utils/             # Token helpers, date formatting, validation
│   ├── theme/             # Design tokens (align with MUI web theme)
│   └── assets/            # Images, fonts, icons
├── app.json
└── package.json
```

**Key patterns to mirror from web (`health360-web`):**
- Axios interceptor with token refresh (see `src/shared/api/client.ts`)
- React Query for server state (`staleTime`, `gcTime`)
- Zod schemas matching backend Jakarta validation

---

## 21. Integration Checklist

### Authentication
- [ ] Register patient account
- [ ] Register doctor account
- [ ] Email verification deep link handling
- [ ] Resend verification email
- [ ] Login with valid credentials
- [ ] Handle EMAIL_NOT_VERIFIED (403)
- [ ] Handle ACCOUNT_LOCKED (423)
- [ ] Store refresh token in Secure Storage
- [ ] Attach Bearer token to authenticated requests
- [ ] Proactive token refresh before expiry
- [ ] Reactive refresh on 401
- [ ] Logout with token invalidation

### Patient Profile
- [ ] Accept consent (first-time flow)
- [ ] Load full profile
- [ ] Update basic info
- [ ] Update contact info
- [ ] Update physical measurements
- [ ] Update lifestyle
- [ ] CRUD allergies, medications, surgeries, conditions
- [ ] CRUD emergency contacts (max 5)
- [ ] Profile completion score display

### Vitals
- [ ] Record vital signs
- [ ] View latest vitals
- [ ] Paginated vitals history
- [ ] Display BP classification

### Doctor Profile
- [ ] Auto-create draft profile on first access
- [ ] Update professional details
- [ ] CRUD qualifications
- [ ] CRUD experience
- [ ] Set specialization (load taxonomy first)
- [ ] Set consultation fees

### Settings
- [ ] Get/update user profile
- [ ] Get/update notification preferences
- [ ] Change password

### Error Handling
- [ ] Parse validation error details
- [ ] Handle 401/403/404/409/500 gracefully
- [ ] Log correlationId on errors

---

## 22. API Change Policy

| Policy | Detail |
|--------|--------|
| **Active development** | Backend Phase 1 is under active development (S1–S15) |
| **Document versioning** | This guide is versioned (currently **1.0.0**). Breaking changes increment major version |
| **New endpoints** | May be added without notice; check Section 23 coverage report |
| **Existing endpoints** | Should not change request/response shape without API version bump |
| **Breaking changes** | Will be communicated via changelog and `/api/v2` if required |
| **Source of truth** | Implemented controllers in `backend/health360-api` + OpenAPI at `/api-docs` |

---

## 23. Endpoint Coverage Report

| API Group | Total (DOC-07) | Implemented | Pending | Current Sprint |
|-----------|------------------|-------------|---------|----------------|
| Shared / Health | 1 | 1 | 0 | S0 |
| Authentication | 8 | 8 | 0 | S1 |
| User Account | 7 | 4 | 3 | S1–S2 |
| Patient Profile | ~43 | 31 | ~12 | S3–S4 |
| Doctor Profile | ~21 | 13 | ~8 | S5 |
| RBAC Probes | 3 | 3 | 0 | S2 |
| Hospital | ~15 | 0 | ~15 | S7 |
| Scheduling | ~12 | 0 | ~12 | S8–S9 |
| Notifications (in-app) | 4 | 0 | 4 | S9 |
| Analytics | ~8 | 0 | ~8 | S10–S11 |
| Admin | ~8 | 0 | 8 | S6+ |
| Search / Public | ~6 | 0 | ~6 | S12–S13 |
| **Total** | **~136** | **60** | **~76** | — |

### Implemented Endpoint Count by Group

| Group | Count |
|-------|-------|
| Health | 1 |
| Auth | 8 |
| Users | 4 |
| Patients | 31 |
| Doctors | 13 |
| RBAC | 3 |
| **Total Implemented** | **60** |

---

## 24. Appendix

### 24.1 Swagger / OpenAPI

| Resource | URL (Development) |
|----------|-------------------|
| Swagger UI | http://localhost:8080/swagger-ui.html |
| OpenAPI JSON | http://localhost:8080/api-docs |
| Actuator Health | http://localhost:8080/actuator/health |

### 24.2 Environment Variables (Backend)

| Variable | Default | Description |
|----------|---------|-------------|
| `SERVER_PORT` | `8080` | API server port |
| `POSTGRES_HOST` | `localhost` | Database host |
| `POSTGRES_PORT` | `5432` | Database port |
| `POSTGRES_DB` | `health360_db` | Database name |
| `POSTGRES_USER` | `health360` | Database user |
| `POSTGRES_PASSWORD` | — | Database password |
| `SPRING_PROFILES_ACTIVE` | `local` | Spring profile |
| `APP_BASE_URL` | `http://localhost:5173` | Frontend URL for email links |

### 24.3 Environment Variables (Mobile)

| Variable | Example | Description |
|----------|---------|-------------|
| `API_BASE_URL` | `http://localhost:8080/api/v1` | Backend API base (dev) |
| `API_BASE_URL` | `https://staging-api.health360.ai/api/v1` | Staging |

> For Android emulator, use `http://10.0.2.2:8080/api/v1` to reach host localhost.

### 24.4 Useful Commands

**Backend startup (Windows):**

```powershell
# From repo root
.\scripts\start-s1-local.ps1

# Or manually:
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.12.8-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;C:\Users\ParmeshwarSuryawansh\tools\apache-maven-3.9.6\bin;$env:PATH"
$env:SPRING_PROFILES_ACTIVE = "local"
$env:POSTGRES_USER = "health360"
$env:POSTGRES_PASSWORD = "health360_local_dev"
cd backend\health360-api
mvn spring-boot:run -DskipTests
```

**Frontend startup:**

```powershell
cd frontend\health360-web
npm run dev
# → http://localhost:5173
```

**Database setup:**

```powershell
.\scripts\setup-local-db.ps1
```

**Health check:**

```bash
curl http://localhost:8080/api/v1/health
```

**Test login:**

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"s2test@health360.test","password":"SecureP@ss1!"}'
```

### 24.5 Test Accounts

| Email | Password | Role | Notes |
|-------|----------|------|-------|
| `s2test@health360.test` | `SecureP@ss1!` | PATIENT | Pre-seeded test user (if available in local DB) |

> Register new test accounts via `POST /auth/register` for isolated mobile testing.

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-07-30 | Health360 Engineering | Initial handover document — S0 through S5 implemented APIs |

---

*End of Document*
