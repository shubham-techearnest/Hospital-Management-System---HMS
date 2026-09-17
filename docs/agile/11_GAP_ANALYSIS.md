# 11 — Gap Analysis (Product Gap Register)

| Attribute | Value |
|-----------|-------|
| **Document ID** | AGILE-GAP-001 |
| **Status** | DRAFT — Phase F |
| **Last Updated** | 2026-09-17 |
| **Sources** | Phase C overlay partials · Phase C defects · SSOT vision NOT_STARTED |

**Rule:** Vision items are **PLANNED** only when evidenced in product vision/roadmap docs. Do not invent non-vision HIS modules.

---

## Gap register

| Gap ID | Theme | Epic | Feature | Current State | Problem | Impact | Recommended Next Step | Evidence | Priority |
|--------|-------|------|---------|---------------|---------|--------|----------------------|----------|----------|
| GAP-AUTH-001 | THM-001 | EPIC-IAM-002 | FEAT-IAM-RBAC-003 | PARTIAL | `/patient/*` lacks `RoleRoute role="PATIENT"` | Non-patient tokens may reach patient URLs | Implement US-AUTH-FIX-001 / BUG-AUTH-001 | `router.tsx`; Phase C | P1 |
| GAP-AUTH-002 | THM-001 | EPIC-IAM-002 | FEAT-IAM-RBAC-003 | PARTIAL | RoleRoute skips role check when `user` null with token | Authz bypass edge | Implement US-AUTH-FIX-002 / BUG-AUTH-002 | `RoleRoute.tsx` | P2 |
| GAP-BIL-001 | THM-004 | EPIC-BIL-001 | FEAT-BIL-CHG-001/002 | PARTIAL | FE charge attach unwired; POST ≠ invoice lines | Charge engine disconnected from invoices | US-BIL-CHG-003 / BUG-BIL-001 | Phase C #12 | P1 |
| GAP-API-001 | THM-006 | EPIC-CC-001 | FEAT-CC-OPS-001 | PARTIAL | Double `/api/v1` on several FE API clients | Command center + ops modules may fail | Fix BUG-API-001; re-verify CC | `commandCenterApi.ts` et al. | P1 |
| GAP-ONB-001 | THM-007 | EPIC-ADM-001 | FEAT-ADM-HOS-002 | PARTIAL | APPROVED onboarding does not provision accounts | Manual ops after every approval | US-ONB-PROV-001 | `OnboardingRequestService` | P2 |
| GAP-NTF-001 | THM-001 | EPIC-IAM-001 | — | TECH | SMS gateway logs only | No real SMS for reminders/OTP if relied upon | Provider decision + TECH-NTF-001 | `DefaultSmsNotificationGateway` | P2 |
| GAP-PAY-001 | THM-004 | EPIC-BIL-002 | FEAT-BIL-PAY-002 | SEC | Sandbox accepts blank webhook secret | Unsafe if misconfigured in non-sandbox | SEC-PAY-001 harden | `RazorpayPaymentGatewayClient` | P2 |
| GAP-CAT-UNK-001 | Multi | Multi | 78 UNKNOWN features | UNKNOWN | Features not Phase-C verified | Backlog incomplete; risk of false IMPLEMENTED claims | Continue Phase B/C waves | Feature catalog + overlay | P1 (process) |
| GAP-VIS-AMB-001 | THM-003 | — | — | PLANNED | Ambulance operations not started | Out of current MVP | Keep in Future Expansion only | PRODUCT-VISION FUTURE; FEATURE-INVENTORY F-AMB-001 | P3 |
| GAP-VIS-HOME-001 | THM-002 | — | — | PLANNED | Home nursing / homecare not started | Out of current MVP | Future Expansion | PRODUCT-VISION; F-HOME-001 | P3 |
| GAP-VIS-PHY-001 | THM-003 | — | — | PLANNED | Physiotherapy product module not started | Out of current MVP | Future Expansion | PRODUCT-VISION; F-PHY-001 | P3 |
| GAP-VIS-AI-001 | THM-006 | — | — | PLANNED | AI clinical decision support not started | Out of current MVP | Future Expansion | PRODUCT-VISION FUTURE | P3 |

---

## Overlay partials summary

| Feature | Overlay status | Gap linkage |
|---------|----------------|-------------|
| FEAT-IAM-RBAC-003 | PARTIALLY_IMPLEMENTED | GAP-AUTH-001/002 |
| FEAT-ADM-HOS-002 | PARTIALLY_IMPLEMENTED | GAP-ONB-001 |
| FEAT-BIL-CHG-001 | PARTIALLY_IMPLEMENTED | GAP-BIL-001 |
| FEAT-BIL-CHG-002 | PARTIALLY_IMPLEMENTED | GAP-BIL-001 |
| FEAT-CC-OPS-001 | PARTIALLY_IMPLEMENTED | GAP-API-001 |

---

## Explicitly not claimed as gaps-from-assumption

UNKNOWN catalog features (radiology depth, OT, insurance, inventory, etc.) are **not** listed as “missing product” until Phase C/B confirms absence vs incomplete. Confidence: **HIGH** for Phase C items; **LOW** for unverified modules.
