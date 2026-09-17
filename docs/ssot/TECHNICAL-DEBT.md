# Technical Debt

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-TD-001 |
| **Version** | 1.0 |
| **Status** | DRAFT |

| ID | Description | Impact | Severity | Area | Recommended solution | Priority | Status |
|----|-------------|--------|----------|------|----------------------|----------|--------|
| TD-01 | Competing documentation trees | Wrong builds | High | Documentation | Adopt SSOT; archive supersessions | P0 | OPEN |
| TD-02 | Large uncommitted HMS V2 diff | Release/audit risk | High | DevOps/Git | Branch, review, commit intentionally | P0 | OPEN |
| TD-03 | CI branches ≠ `master` | CI may skip | High | DevOps | Align names | P0 | OPEN |
| TD-04 | Email/SMS stubs | False prod readiness | Medium | Backend | Real providers + feature flags | P1 | OPEN |
| TD-05 | Charge failures swallowed in reactor | Silent revenue gaps | Medium | Backend | Metrics/alerts; harden error path | P1 | OPEN |
| TD-06 | RoleRoute null-user edge | Authz hole risk | Medium | Web | Fail closed when user null | P1 | OPEN |
| TD-07 | No frozen OpenAPI | Client drift | Medium | API | Export committed OpenAPI | P2 | OPEN |
| TD-08 | PHI field inventory absent | Compliance risk | Medium | Security | Data classification pass | P1 | OPEN |
| TD-09 | Mobile/web divergence | Support cost | Medium | Mobile | Explicit parity matrix per release | P1 | OPEN |
| TD-10 | In-code automation rules | Change friction | Low | Backend | Externalize later | P2 | OPEN |
| TD-11 | Redis disabled in prod profile | Blacklist durability | Medium | Security | Decide Redis requirement | P1 | OPEN |
| TD-12 | Test coverage % unknown | Quality blind spot | Medium | Testing | Coverage gate in CI | P2 | OPEN |
