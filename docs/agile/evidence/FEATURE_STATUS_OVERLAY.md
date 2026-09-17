# Evidence — Feature Status Overlay (Phase C)

| Attribute | Value |
|-----------|-------|
| **Document ID** | AGILE-EVID-STATUS-001 |
| **Rule** | Overrides `UNKNOWN` in catalog only where listed; all others remain UNKNOWN |
| **Date** | 2026-09-17 |

| Feature ID | New Status | Confidence | Basis |
|------------|------------|------------|-------|
| FEAT-IAM-AUTH-001 | IMPLEMENTED | HIGH | Phase C #2 |
| FEAT-IAM-AUTH-003 | IMPLEMENTED | HIGH | Phase C #11 |
| FEAT-IAM-ACCT-001 | IMPLEMENTED | HIGH | Phase C #1 |
| FEAT-IAM-RBAC-001 | IMPLEMENTED | HIGH | 12 roles seeded + portals |
| FEAT-IAM-RBAC-003 | PARTIALLY_IMPLEMENTED | HIGH | Redirect works; patient RoleRoute gap |
| FEAT-PUB-ONB-001 | IMPLEMENTED | HIGH | Phase C #15 |
| FEAT-PUB-ONB-002 | IMPLEMENTED | HIGH | Phase C #15 |
| FEAT-ADM-HOS-002 | PARTIALLY_IMPLEMENTED | HIGH | Queue works; no auto-provision |
| FEAT-ADM-VFY-001 | IMPLEMENTED | HIGH | Phase C #9 |
| FEAT-HOS-STAFF-001 | IMPLEMENTED | HIGH | Phase C #10 |
| FEAT-PAT-CARE-001 | IMPLEMENTED | HIGH | Phase C #3 |
| FEAT-OPD-REQ-001 | IMPLEMENTED | HIGH | Phase C #3 |
| FEAT-RCV-REG-001 | IMPLEMENTED | HIGH | Phase C #4 |
| FEAT-RCV-DESK-001 | IMPLEMENTED | HIGH | Phase C #4 |
| FEAT-RCV-DESK-002 | IMPLEMENTED | HIGH | Phase C #8 |
| FEAT-DOC-WORK-001 | IMPLEMENTED | HIGH | Phase C #5 |
| FEAT-CLN-NOTE-001 | IMPLEMENTED | HIGH | Phase C #5 |
| FEAT-CLN-NOTE-002 | IMPLEMENTED | HIGH | Phase C #5 |
| FEAT-CLN-RX-001 | IMPLEMENTED | HIGH | Phase C #5 |
| FEAT-CLN-ORD-001 | IMPLEMENTED | HIGH | Phase C #6 |
| FEAT-LAB-WRK-001 | IMPLEMENTED | HIGH | Phase C #6 |
| FEAT-IPD-ADM-001 | IMPLEMENTED | HIGH | Phase C #7 |
| FEAT-DOC-WORK-002 | IMPLEMENTED | HIGH | Phase C #7 (doctor side) |
| FEAT-BIL-INV-001 | IMPLEMENTED | HIGH | Phase C #8 |
| FEAT-BIL-PAY-001 | IMPLEMENTED | HIGH | Phase C #8 |
| FEAT-BIL-PAY-002 | IMPLEMENTED | HIGH | Phase C #8 |
| FEAT-BIL-CHG-001 | PARTIALLY_IMPLEMENTED | HIGH | Phase C #12 |
| FEAT-BIL-CHG-002 | PARTIALLY_IMPLEMENTED | HIGH | Phase C #12 |
| FEAT-BIL-XCP-001 | IMPLEMENTED | HIGH | Exceptions UI + API |
| FEAT-NUR-MAR-001 | IMPLEMENTED | HIGH | Phase C #13 |
| FEAT-CC-OPS-001 | PARTIALLY_IMPLEMENTED | HIGH | Phase C #14 + BUG-API-001 |
| FEAT-PLT-AUDIT-002 | IMPLEMENTED | HIGH | HealthController |
| FEAT-PUB-LAND-001 | IMPLEMENTED | MEDIUM | Landing pages present; not deep-traced |
| FEAT-DOC-PROF-002 | IMPLEMENTED | HIGH | Phase C #9 doctor submit side |

**Counts from this overlay only:**

| Status | Count |
|--------|------:|
| IMPLEMENTED | 28 |
| PARTIALLY_IMPLEMENTED | 6 |
| Still UNKNOWN in catalog | 112 − 34 = **78** (approx; verify exact against catalog length) |
