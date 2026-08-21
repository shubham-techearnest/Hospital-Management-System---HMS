# Decisions Requiring Senior Approval

| Document ID | PM-DEC-001 |
| Status | **RESOLVED — approved 2026-08-20 with roadmap approval** |

---

## DEC-001 — UHID scope

**Question:** Is UHID unique per tenant (network-wide) or per hospital?

| Option | Pros | Cons |
|--------|------|------|
| **A: Tenant-global UHID** (recommended) | One ID for patient across branches; simpler search | Requires central sequence |
| B: Per-hospital MRN | Local hospital control | Cross-branch confusion |

**Recommendation:** Tenant-global UHID + optional `registration_number` per hospital in `hospital_registrations`.

**Impact:** V42 unique index, search API, receipt format.

**Status:** **APPROVED** — Option A (tenant-global UHID)

---

## DEC-002 — Duplicate detection threshold

**Question:** When to block registration and show candidates?

| Option | Rule |
|--------|------|
| **A** (recommended) | Block on exact mobile match OR (name + DOB) fuzzy ≥ 0.85 |
| B | Warn only, never block |
| C | Block only exact mobile |

**Impact:** P1-F1 register API behavior, override workflow.

**Status:** **UPDATED 2026-08-21** — Block only on **name+DOB** match. Exact mobile shows candidates (family may share one phone across multiple patient accounts) but does **not** block registration.

---

## DEC-003 — Name search technology

**Question:** ILIKE vs PostgreSQL pg_trgm for name search?

**Recommendation:** pg_trgm for scale; ILIKE acceptable for MVP if index size concern.

**Status:** **APPROVED** — ILIKE/JPA for MVP

---

## DEC-004 — Walk-in patient without mobile app account

**Question:** `patient_profiles.user_id` is NOT NULL today. How to register desk-only patients?

| Option | Description |
|--------|-------------|
| **A** (recommended) | Create system-linked `iam.users` stub (no login) per registration |
| B | Nullable `user_id` for HOSPITAL_DESK source |
| C | Require mobile number + OTP always |

**Impact:** V42 migration, IAM integration, privacy.

**Status:** **APPROVED** — Option A (stub IAM user)

---

## DEC-005 — Registration SMS with UHID

**Question:** Send SMS on registration by default?

**Recommendation:** Optional per hospital setting; default off until SMS gateway approved.

**Status:** **APPROVED** — Optional per hospital; default off

---

## DEC-006 — Emergency temporary registration

**Question:** Minimum fields for emergency register before merge?

**Recommendation:** Defer to P1-F4; name optional, gender, approximate age, triage tag.

**Status:** DEFERRED

---

## DEC-007 — Prescription safety default severity

**Question:** Hard block vs warn on interaction?

**Recommendation:** WARN default; hospital config for BLOCK on high severity.

**Status:** DEFERRED (P2-F4)

---

## DEC-008 — Billing gate before dispense

**Question:** Block pharmacy dispense until invoice paid?

**Recommendation:** Configurable per hospital; default allow dispense with credit for IPD.

**Status:** DEFERRED (P3)

---

## DEC-009 — Discharge clearance departments

**Question:** Mandatory clearance list?

**Recommendation:** Pharmacy, Lab pending, Billing — configurable.

**Status:** DEFERRED (P4)

---

## DEC-010 — Payment gateway provider

**Question:** Razorpay vs Stripe vs other?

**Recommendation:** Adapter pattern; select at Sprint 17.

**Status:** DEFERRED (P5)

---

## Approval log

| Decision | Approved by | Date |
|----------|-------------|------|
| DEC-001 … DEC-005 | Product Owner (roadmap approval) | 2026-08-20 |
