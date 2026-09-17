# IAM — Identity & Access

## Module Summary

Platform authentication, account lifecycle, MFA, twelve-role RBAC, and portal routing. Theme **THM-001**. Phase C verified login, registration, MFA, and identified RoleRoute gaps.

## Current Implementation Status

| Metric | Value | Notes |
|--------|------:|-------|
| Verified features (overlay) | 5 | AUTH-001/003, ACCT-001, RBAC-001, RBAC-003 |
| IMPLEMENTED | 4 | |
| PARTIAL | 1 | FEAT-IAM-RBAC-003 |
| UNKNOWN siblings | Several (password reset, invites, scope) | Not storyed this pass |

**Completeness formula (verified subset only):** Implemented / (Implemented + Partial) among overlay IAM features = 4/5 = **80%** of verified IAM features (not whole IAM domain).

## Actors

- Public visitor, PATIENT, DOCTOR, HOSPITAL_ADMIN, PLATFORM_ADMIN, all staff roles (see `03_ACTORS_AND_ROLES.md`)

## Epic(s)

- EPIC-IAM-001 Authentication & Session Security
- EPIC-IAM-002 RBAC & Role Portal Access
- EPIC-PLT-001 (health/audit adjacent)

## Feature Groups

- FG-IAM-AUTH, FG-IAM-ACCT, FG-IAM-RBAC, FG-IAM-SCOPE, FG-PLT-AUDIT

## Features

See catalog + overlay for FEAT-IAM-* / FEAT-PLT-AUDIT-002.

## Implemented Features

- FEAT-IAM-AUTH-001 JWT login & refresh
- FEAT-IAM-AUTH-003 MFA TOTP
- FEAT-IAM-ACCT-001 Patient self-registration
- FEAT-IAM-RBAC-001 Twelve-role RBAC
- FEAT-PLT-AUDIT-002 Health endpoint

## Partially Implemented Features

- FEAT-IAM-RBAC-003 Post-login routing (redirect works; patient RoleRoute + null-user gaps)

## Planned Features

- US-AUTH-FIX-001 / US-AUTH-FIX-002 (RoleRoute hardening)
- Unverified: password reset, portal invites — remain UNKNOWN until traced

## User Stories

### US-IAM-AUTH-001

| Field | Value |
|-------|-------|
| Actor | Any role |
| Story | As a registered user, I want to sign in and receive a JWT session, so that I can access my portal. |
| Business Value | Entry point to all product workflows |
| Status | IMPLEMENTED |
| Priority | P0 |
| Story Points | — Baseline |
| Dependencies | — |
| Acceptance Criteria | See `08_USER_STORY_CATALOG.md` |
| Repository Evidence | Phase C #2 |
| Frontend | `LoginPage.tsx`, auth client, `roleNavigation.ts` |
| Backend | `AuthController`, `AuthenticationService` |
| Database | IAM V1+ |
| Tests | Auth ITs present (exact coverage MEDIUM) |

### US-IAM-AUTH-002 / US-IAM-ACCT-001 / US-IAM-RBAC-001 / US-IAM-RBAC-002

Full AC and evidence: [08_USER_STORY_CATALOG.md](../08_USER_STORY_CATALOG.md).

### US-AUTH-FIX-001 / US-AUTH-FIX-002

| Field | Value |
|-------|-------|
| Status | PLANNED |
| Points | 3 + 3 |
| Priority | P1 / P2 |
| Linked bugs | BUG-AUTH-001, BUG-AUTH-002 |

## Bugs

- BUG-AUTH-001 Patient RoleRoute missing
- BUG-AUTH-002 RoleRoute null user bypass

## Technical Debt

- TECH-NTF-001 SMS stub (adjacent to account notifications)

## Gaps

- GAP-AUTH-001, GAP-AUTH-002

## Recommended Next Work

Sprint 01: RoleRoute fixes; then re-run ACP-AUTH-001.
