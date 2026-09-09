# Health360 Bug Tracker

| Doc | H360-BUGS-001 |
| Master | [HEALTH360_END_TO_END_SYSTEM_VALIDATION.md](./HEALTH360_END_TO_END_SYSTEM_VALIDATION.md) |

## Summary

| Severity | Open | Fixed | Verified |
|----------|-----:|------:|---------:|
| BLOCKER | 0 | 0 | 0 |
| CRITICAL | 0 | 0 | 0 |
| HIGH | 0 | 0 | 0 |
| MEDIUM | 0 | 0 | 0 |
| LOW | 0 | 0 | 0 |

## Known pre-UAT gaps (not bugs until claimed working)

| ID | Module | Title | Severity | Priority | Status | Notes |
|----|--------|-------|----------|----------|--------|-------|
| GAP-G001 | Billing | Lab does not auto-create invoice lines | HIGH | P1 | KNOWN | Manual lines workaround |
| GAP-G002 | Billing | Pharmacy does not auto-create invoice lines | HIGH | P1 | KNOWN | Manual lines workaround |
| GAP-G003 | Notifications | Email delivery log-only | MEDIUM | P2 | KNOWN | Local UAT OK |
| GAP-G006 | IPD | Blood/transfusion stub | MEDIUM | P2 | KNOWN | Do not mark FAIL if UI labeled stub |
| GAP-G012 | RBAC | No Cashier/Ward Manager/TPA roles | LOW | P3 | KNOWN | Proxied in TEST_USERS |

---

## Bug entry template (copy per bug)

```
BUG ID: BUG-001
Module:
Title:
Severity: BLOCKER | CRITICAL | HIGH | MEDIUM | LOW
Priority: P0 | P1 | P2 | P3
Environment: Manual QA / H360-TEST-001
User Role:
Precondition:
Steps to Reproduce:
1.
2.
3.
Expected Result:
Actual Result:
API involved:
Frontend component / route:
Backend component:
Database entity:
Screenshot / log refs:
Root Cause: (after investigation)
Fix: (PR / commit)
Retest Result:
Final Status: OPEN | IN PROGRESS | FIXED | VERIFIED | WONTFIX | DUPLICATE
```

## Log (append during execution)

| BUG ID | Module | Title | Sev | Pri | Status | Linked TC |
|--------|--------|-------|-----|-----|--------|-----------|
| | | | | | | |
