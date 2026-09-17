# Integration Catalog — CURRENT

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-INT-001 |
| **Version** | 1.0 |
| **Status** | DRAFT |

| Integration | Purpose | Provider | Protocol | Auth | Status |
|-------------|---------|----------|----------|------|--------|
| PostgreSQL | System of record | Self/hosted | JDBC | DB creds | IMPLEMENTED |
| Redis | Optional token/cache | Self/hosted | Redis | password optional | PARTIAL (often disabled) |
| Razorpay | Online payments | Razorpay | HTTPS REST + webhook | Key/secret + webhook | IMPLEMENTED |
| MSG91 | SMS | MSG91 | HTTPS | API key | PARTIAL / optional |
| Email | Notifications | Local log stub | — | — | STUB |
| Expo Push | Mobile push | Expo | HTTPS | — | IMPLEMENTED (when enabled) |
| Local disk | Document binaries | Filesystem | FS | OS perms | IMPLEMENTED |
| S3 | Object storage | — | — | — | NOT_STARTED |
| External ICD/coding API | Coding | — | — | — | NOT_STARTED |

Retries/timeouts: per-client defaults — detailed matrices UNKNOWN without code deep-dive per gateway.
