# ADR-008: Server-Side Hospital Scope

| Status | PROPOSED |

## Decision
`HospitalScopeService` resolves hospital/branch from staff assignment for RECEPTIONIST, NURSE, etc. APIs must not trust client-supplied hospital UUID for staff roles.

## Reference
Existing implementation in `com.health360.hospital.application.service.HospitalScopeService`.
