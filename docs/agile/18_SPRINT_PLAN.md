# 18 — Sprint Plan (Proposed)

| Attribute | Value |
|-----------|-------|
| **Document ID** | AGILE-SPR-001 |
| **Status** | DRAFT — Phase J proposals only |
| **Last Updated** | 2026-09-17 |

---

## Assumptions (stated first)

| Assumption | Value |
|------------|-------|
| Sprint length | **2 weeks** |
| Team capacity | **UNKNOWN** |
| Historical velocity | **UNKNOWN** — none claimed |
| Story points | Fibonacci estimates for **future** work only |
| Baseline work | Already shipped; **not** placed into Sprint 01–03 as delivery commitments |
| Plan nature | **Proposed** ordering for PO/engineering approval — not committed calendar |

If capacity is later measured, re-cut sprint scope; do not invent completion dates.

---

## SPRINT 01 — Stabilize identity & FE API paths

| Field | Value |
|-------|-------|
| **Goal** | Close patient portal RoleRoute gaps and fix double `/api/v1` FE clients so authz and ops UIs are trustworthy. |
| **Target release** | REL-STABILIZATION |
| **Proposed points** | 3 + 3 + 5 = **11** (plus TECH-API-001 if not merged into bug) |

### Backlog items

| ID | Type | Points | Notes |
|----|------|--------|-------|
| BUG-AUTH-001 | BUG | 3 | Add `RoleRoute role="PATIENT"` |
| US-AUTH-FIX-001 | STORY | 3 | Same outcome; track AC |
| BUG-AUTH-002 | BUG | 3 | Null-user RoleRoute deny |
| US-AUTH-FIX-002 | STORY | 3 | Same outcome; may combine with bug tasks |
| BUG-API-001 | BUG | 5 | Fix path prefix family |
| TECH-API-001 | TECH | 5 | Optional if not fully covered by bug |

**Practical note:** Treat paired BUG+US as one delivery slice (~11–14 pts total if not double-counted). PO should pick single tracking ID per slice.

### Dependencies
None external; unblocks US-CC-OPS-001 re-verification and patient portal trust.

### Definition of Done for sprint goal
- `/patient/*` role-gated.
- RoleRoute denies when user null.
- Command center (and sibling APIs) callable without double prefix.
- Regression: ACP-AUTH-001 + CC smoke.

---

## SPRINT 02 — Complete charge→invoice continuity & payment hygiene

| Field | Value |
|-------|-------|
| **Goal** | Wire charge attach in FE and define/implement POST→invoice line behavior; harden Razorpay webhook secret handling for non-sandbox. |
| **Target release** | REL-CORE-WF (+ start REL-HARDENING for SEC) |
| **Proposed points** | 8 + 5 = **13** |

### Backlog items

| ID | Type | Points | Notes |
|----|------|--------|-------|
| BUG-BIL-001 | BUG | 8 | Attach + POST invoice lines |
| US-BIL-CHG-003 | STORY | 8 | User-facing AC; pair with bug |
| SEC-PAY-001 | SEC | 5 | Reject blank secret outside sandbox |
| SPIKE-BIL-001 *(optional)* | SPIKE | 2 | If product policy for POST lines unclear |

### Dependencies
Charge engine baseline (US-BIL-CHG-001/002) exists; product decision on POST semantics required.

### Definition of Done for sprint goal
- FE can attach charges.
- POST mode creates or explicitly queues invoice lines per written policy.
- Webhook secret policy enforced for non-sandbox.
- ACP-BIL-001 updated to CURRENT after fix.

---

## SPRINT 03 — Onboarding provision & notification direction

| Field | Value |
|-------|-------|
| **Goal** | Close onboarding APPROVED→provision gap and decide SMS provider path (implement or formally accept stub for non-prod). |
| **Target release** | REL-CORE-WF / REL-HARDENING |
| **Proposed points** | 8 + 5 = **13** |

### Backlog items

| ID | Type | Points | Notes |
|----|------|--------|-------|
| GAP-ONB-001 / US-ONB-PROV-001 | GAP/STORY | 8 | Auto-provision policy + impl |
| TECH-NTF-001 | TECH | 5 | Provider or documented stub boundary |
| *(optional)* Phase C wave | AUDIT | — | Verify next UNKNOWN batch (ED/pharmacy) — no fake points |

### Dependencies
Admin onboarding queue (US-ADM-HOS-002) already works for status changes.

### Definition of Done for sprint goal
- APPROVED path provisions per policy or creates auditable provisioning jobs.
- SMS: real gateway configured **or** stub explicitly limited to non-prod with docs.
- ACP-ONB-001 updated.

---

## Beyond Sprint 03 (not detailed)

- Module Completion waves for UNKNOWN features.
- Integration + Hardening releases.
- Future Expansion vision items remain P3 / REL-FUTURE.

---

## Anti-patterns avoided

- No “Sprint 0…N history” for baseline code.
- No date commitments.
- No stuffing baseline IMPLEMENTED stories into Sprint 01 as if newly delivered.
