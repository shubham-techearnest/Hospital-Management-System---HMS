# Security Architecture — CURRENT

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-SEC-001 |
| **Version** | 1.0 |
| **Status** | DRAFT |
| **Compliance claim** | **NONE** — OWASP ASVS used as reference lens only |

## Authentication (CURRENT)

- JWT access tokens RS256; refresh rotation (see IAM services)
- BCrypt strength 12
- Failed login lockout (IAM implementation)
- Optional MFA TOTP (V77) — full UX coverage UNKNOWN
- Webhook endpoints authenticated per payment provider rules (Razorpay webhook public path)

## Authorization (CURRENT)

- Role → permission matrix in `iam.*`
- JWT embeds permission strings as Spring authorities
- Controllers use `@PreAuthorize`
- Hospital scope asserts on hospital-scoped APIs

## Data protection (CURRENT)

- Soft-delete common; hard-delete uncommon
- Local file storage for documents (encryption-at-rest: **UNKNOWN** / depends on host)
- PHI/PII present in patient/clinical schemas — formal classification inventory: see gap (TECHNICAL-DEBT)

## Audit

- `AuditLogService` used across modules
- Admin audit log API exists

## Threat notes (INFERRED, not full STRIDE workshop)

| Threat | Mitigation present? |
|--------|---------------------|
| Stolen JWT | Short TTL + blacklist on logout (PARTIAL if Redis off) |
| IDOR across hospitals | Scope services (must be regression-tested continuously) |
| Public webhook abuse | Provider signature verification — verify in payment code reviews |
| Secrets in repo | `.env` gitignored; ensure no key commits (ongoing) |

Formal threat model workshop: **NOT EVIDENCED**.
