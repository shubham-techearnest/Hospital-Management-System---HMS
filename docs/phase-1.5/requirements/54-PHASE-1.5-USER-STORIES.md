# DOC-54: Phase 1.5 — User Stories & Acceptance Criteria

| Attribute | Value |
|-----------|-------|
| **Document ID** | DOC-54 |
| **Version** | 1.0 |
| **Status** | Approved |
| **References** | [DOC-53](./53-PHASE-1.5-FUNCTIONAL-REQUIREMENTS.md) |

---

## Epic E1 — Subscription foundation

### US-1.5.01 — Seed subscription plans
**As** platform operator  
**I want** default plans with limits and features  
**So that** new hospitals can be assigned a tier immediately  

**Acceptance criteria:**
- [x] V28 seeds FREE, STARTER, PROFESSIONAL, ENTERPRISE
- [x] Each plan has limit rows for MAX_DOCTORS, MAX_PATIENTS, MAX_DEPARTMENTS, MAX_BRANCHES, MAX_APPOINTMENTS_PER_MONTH
- [x] Each plan has feature flag rows
- [x] Existing hospitals backfilled to FREE with INITIAL history event

### US-1.5.02 — Hospital subscription history
**As** compliance officer  
**I want** append-only subscription history  
**So that** plan changes are auditable  

**Acceptance criteria:**
- [x] `hospital_subscription_history` table exists
- [x] INITIAL, PLAN_CHANGE, UPGRADE events recorded on assign/change
- [x] History rows are never updated or deleted
- [x] Admin can GET history for a hospital

---

## Epic E2 — Platform admin provisioning

### US-1.5.10 — Create hospital
**As** platform admin  
**I want** to create a hospital with an admin user  
**So that** the hospital can operate on Health360  

**Acceptance criteria:**
- [x] POST `/api/v1/admin/hospitals` with hospital + admin user fields
- [x] Creates HOSPITAL_ADMIN user with invitation email
- [x] Assigns subscription plan (default FREE)
- [x] Returns hospital admin summary
- [x] Duplicate admin email returns 409

### US-1.5.11 — Invite doctor
**As** platform admin  
**I want** to invite a doctor to a hospital  
**So that** they can practice under that hospital  

**Acceptance criteria:**
- [x] POST `/api/v1/admin/hospitals/{id}/doctors/invite`
- [x] Creates user, DOCTOR role, DRAFT profile, ACTIVE association
- [x] Sends verification + invitation emails
- [x] Returns 409 DOCTOR_LIMIT_REACHED when at plan capacity
- [x] Duplicate email returns 409

### US-1.5.12 — Manage hospital status
**As** platform admin  
**I want** to suspend a hospital  
**So that** abuse or non-payment can be handled  

**Acceptance criteria:**
- [x] PATCH status to ACTIVE / INACTIVE / SUSPENDED
- [x] Audit log entry written
- [ ] Suspended hospital blocks hospital admin login (future)

### US-1.5.13 — Change hospital plan
**As** platform admin  
**I want** to upgrade/downgrade a hospital plan  
**So that** they receive appropriate limits and features  

**Acceptance criteria:**
- [x] PUT `/api/v1/admin/hospitals/{id}/subscription/plan`
- [x] Previous subscription cancelled; new active subscription created
- [x] History records plan change
- [ ] Downgrade blocked if usage exceeds new limits (future)

---

## Epic E3 — Hospital admin experience

### US-1.5.20 — View subscription
**As** hospital admin  
**I want** to see my plan and usage  
**So that** I know when to request an upgrade  

**Acceptance criteria:**
- [x] GET `/api/v1/hospitals/me/subscription`
- [x] Shows plan name, status, usage (doctors, etc.), features
- [x] Web page at `/hospital/subscription` with usage bars

### US-1.5.21 — View doctor roster (read-only adds)
**As** hospital admin  
**I want** to see doctors at my hospital  
**So that** I know who is on my team  

**Acceptance criteria:**
- [x] GET `/api/v1/hospitals/me/doctors` works
- [x] Invite/associate buttons removed; info message shown
- [x] POST invite/associate returns 403

### US-1.5.22 — No self-service hospital create
**As** platform operator  
**I want** hospitals created only by admin  
**So that** onboarding is controlled  

**Acceptance criteria:**
- [x] POST `/api/v1/hospitals/me/profile` returns 403
- [x] Hospital profile page shows message when no hospital linked

---

## Epic E4 — Public registration

### US-1.5.30 — Patient-only registration
**As** patient  
**I want** to register for an account  
**So that** I can use Health360  

**Acceptance criteria:**
- [x] Web and mobile register only as PATIENT
- [x] INDIVIDUAL_PRACTICE / DOCTOR rejected
- [x] Copy explains hospitals/doctors are admin-provisioned

---

## Epic E5 — Plan administration

### US-1.5.40 — View and edit plans
**As** platform admin  
**I want** to manage plan catalog  
**So that** pricing and availability stay current  

**Acceptance criteria:**
- [x] GET `/api/v1/admin/plans`
- [x] PATCH plan metadata
- [ ] Edit limits/features per plan (future)

---

## Epic E6 — Enforcement (remaining)

### US-1.5.50 — Branch/department limits
**As** platform operator  
**I want** branch and department creation limited by plan  
**So that** tiers are meaningful  

**Acceptance criteria:**
- [ ] assertCanAddBranch / assertCanAddDepartment on create endpoints
- [ ] 409 with clear message when limit reached

### US-1.5.51 — Feature gating
**As** platform operator  
**I want** premium features blocked on lower tiers  
**So that** upsell is enforceable  

**Acceptance criteria:**
- [ ] Analytics endpoints check FEATURE_ANALYTICS
- [ ] Returns FEATURE_NOT_AVAILABLE when disabled

---

## Story point summary (indicative)

| Epic | Points | Done |
|------|--------|------|
| E1 Subscription foundation | 13 | 13 |
| E2 Platform admin provisioning | 21 | 18 |
| E3 Hospital admin experience | 8 | 8 |
| E4 Public registration | 3 | 3 |
| E5 Plan administration | 5 | 3 |
| E6 Enforcement remaining | 13 | 0 |
| **Total** | **63** | **45 (~71%)** |
