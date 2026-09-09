# Health360 Story-Based Manual Test Script

| Document | H360-STORY-MANUAL-001 |
| Type | Narrative / step-by-step UAT (not checklist-only) |
| Audience | Manual tester, BA, hospital simulation operator |
| Hospital | **Health360 Test Multispeciality Hospital** (`H360-TEST-001`) |
| Status | Ready to execute — fill **Actual** / **Result** / **Improve?** as you go |

---

## How to use this manual

This is a **story script**. You act as each person in order, like a play.

For **every step**:

1. Log in as the **Role** named.  
2. Open the **Screen**.  
3. Do the **Action** exactly.  
4. Tick every item under **Look for / check**.  
5. Compare with **Expected outcome**.  
6. Write what you really saw in **Actual outcome**.  
7. Mark **Result**: `PASS` · `FAIL` · `PARTIAL` · `BLOCKED` · `NOT IN UI`.  
8. Answer **Improve?** — if UX is confusing, slow, missing confirmation, wrong label, etc., write it even when Result is PASS.

### Result meanings

| Result | Meaning |
|--------|---------|
| PASS | Expected outcome matched |
| FAIL | Wrong / error / data not saved |
| PARTIAL | Main path works but something important is missing (e.g. no auto-bill) |
| BLOCKED | Cannot continue — environment or previous bug |
| NOT IN UI | Feature not available in UI (document as gap) |

### Bug rule

Any **FAIL** → create entry in [BUG_TRACKER.md](./BUG_TRACKER.md) and put BUG-ID in the step.

### Story index

| Story | File | What it proves |
|-------|------|----------------|
| S0 | This file (below) | App up → hospital created → configured → staff ready |
| S1 | [STORY_01_OPD_RAHUL_SHARMA.md](./STORY_01_OPD_RAHUL_SHARMA.md) | Patient self-reg → appointment → OPD → Rx → portal |
| S2 | [STORY_02_LAB_PHARMACY_PRIYA_PATIL.md](./STORY_02_LAB_PHARMACY_PRIYA_PATIL.md) | Desk reg → OPD → lab → Rx → pharmacy → bill |
| S3 | [STORY_03_IPD_AMIT_KULKARNI.md](./STORY_03_IPD_AMIT_KULKARNI.md) | Admit → bed → nursing → transfer → discharge |
| S4 | [STORY_04_RBAC_AND_SECURITY.md](./STORY_04_RBAC_AND_SECURITY.md) | Wrong roles blocked · hospital isolation |

Also see: [TEST_DATA.md](./TEST_DATA.md) · [TEST_USERS.md](./TEST_USERS.md) · master [HEALTH360_END_TO_END_SYSTEM_VALIDATION.md](./HEALTH360_END_TO_END_SYSTEM_VALIDATION.md)

### Step card template (copy if you add steps)

```
### Step X.Y — Short title
| Field | Value |
|-------|-------|
| Role | |
| Screen / URL | |
| Action | 1. … 2. … |
| Look for / check | - … |
| Expected outcome | |
| Actual outcome | _(fill)_ |
| Result | _(fill)_ |
| Bug ID | — |
| Improve? | No / Yes — _(what)_ |
```

---

# STORY S0 — Open the hospital for business

**Goal:** From a clean QA environment, create and configure the test hospital so patients and staff can work.

**Actors:** Platform Admin → Hospital Admin → (creates) Receptionists, Doctors, Nurses, Lab, Pharmacy.

**Stop if:** You cannot create hospital or hospital admin cannot log in.

---

### Step S0.1 — Confirm environment is ready

| Field | Value |
|-------|-------|
| Role | Anyone / DevOps |
| Screen / URL | Backend health + frontend home |
| Action | 1. Open frontend URL. 2. Confirm API is running. 3. Confirm Flyway applied through **V87** (ask developer if unsure). |
| Look for / check | - Frontend loads without blank error page<br>- Login page shows **Email or mobile**<br>- No stuck “Network Error” on open |
| Expected outcome | App is usable for login |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

---

### Step S0.2 — Platform Admin logs in

| Field | Value |
|-------|-------|
| Role | `PLATFORM_ADMIN` (U-PA) |
| Screen / URL | `/login` → should land `/admin` |
| Action | 1. Enter platform admin email + password. 2. Submit. |
| Look for / check | - Success toast or redirect<br>- Admin menu: Hospitals, etc.<br>- No access to patient clinical chart as if you were a doctor |
| Expected outcome | Admin portal opens |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

---

### Step S0.3 — Create test hospital

| Field | Value |
|-------|-------|
| Role | `PLATFORM_ADMIN` |
| Screen / URL | `/admin/hospitals` |
| Action | 1. Open Create Hospital.<br>2. Name: **Health360 Test Multispeciality Hospital**<br>3. Registration / code: **H360-TEST-001**<br>4. Type: Multispeciality (or closest).<br>5. Hospital admin: name **Kavita Deshmukh**, email `ha1.h360test@example.com`, phone `9100000001`.<br>6. Plan: FREE (or available).<br>7. Submit. |
| Look for / check | - Success message<br>- Hospital appears in list<br>- Status visible (ACTIVE / PENDING)<br>- Admin invite / verification message (email may only appear in **server logs**) |
| Expected outcome | Hospital record created; hospital admin user created |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

---

### Step S0.4 — Hospital Admin activates account and logs in

| Field | Value |
|-------|-------|
| Role | `HOSPITAL_ADMIN` (U-HA1 Kavita) |
| Screen / URL | Email verify if required → `/login` → `/hospital` |
| Action | 1. If email verification required, take token/link from **API logs** (local email is log-only).<br>2. Set password if prompted.<br>3. Login with HA email + password.<br>4. Record password in TEST_USERS.md. |
| Look for / check | - Lands on hospital portal<br>- Sidebar: profile, departments, staff, doctors, OPD, IPD, lab, pharmacy, facilities, etc.<br>- Hospital name shown matches test hospital |
| Expected outcome | Hospital Admin can operate `/hospital` |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

---

### Step S0.5 — Complete hospital profile

| Field | Value |
|-------|-------|
| Role | `HOSPITAL_ADMIN` |
| Screen / URL | Hospital profile (e.g. `/hospital/profile` or equivalent) |
| Action | 1. Enter address, city, contact, emergency contact, working hours.<br>2. Upload logo if UI allows.<br>3. Save.<br>4. Refresh page. |
| Look for / check | - Values persist after refresh<br>- Validation on empty required fields<br>- Clear success feedback |
| Expected outcome | Profile saved and visible |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

---

### Step S0.6 — Create departments

| Field | Value |
|-------|-------|
| Role | `HOSPITAL_ADMIN` |
| Screen / URL | Departments |
| Action | Create: **General Medicine**, **Orthopedics**, **Cardiology**, **Laboratory**, **Pharmacy**, **Nursing** (or IPD). |
| Look for / check | - Each appears in list<br>- Can open/edit<br>- No duplicate name crash (note behavior) |
| Expected outcome | Six departments listed |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

---

### Step S0.7 — Create staff accounts (story cast)

| Field | Value |
|-------|-------|
| Role | `HOSPITAL_ADMIN` |
| Screen / URL | Staff |
| Action | Create each person from [TEST_USERS.md](./TEST_USERS.md) (RX1, RX2, DR1–3, NU1–2, PH1–2, LB1–2, ICU). Assign correct **IAM role** and department. Capture temp passwords. |
| Look for / check | - Invite / credentials shown once<br>- Role dropdown includes RECEPTIONIST, DOCTOR, NURSE, LAB_TECHNICIAN, PHARMACIST, ICU_NURSE<br>- Staff appear in list after create |
| Expected outcome | All core staff exist and can later log in |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

**Note:** Titles like Cashier / Ward Manager are **not** separate IAM roles — do not fail the story for missing those labels; use Receptionist / Admin as documented.

---

### Step S0.8 — Map doctors and publish schedules

| Field | Value |
|-------|-------|
| Role | `HOSPITAL_ADMIN` + each `DOCTOR` |
| Screen / URL | Hospital doctors + Doctor schedule |
| Action | 1. Ensure DR1 General Medicine, DR2 Ortho, DR3 Cardio linked to hospital.<br>2. As DR1 (or admin), create **future** available slots for next 3–5 days (morning + afternoon). |
| Look for / check | - Doctor visible for hospital in patient search later<br>- Slots show as available<br>- Consultation fee visible if field exists |
| Expected outcome | Patient can later book DR1 |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

---

### Step S0.9 — Lab catalog ready

| Field | Value |
|-------|-------|
| Role | `HOSPITAL_ADMIN` or `LAB_TECHNICIAN` |
| Screen / URL | Hospital lab / lab catalog |
| Action | Ensure **CBC**, **Blood Sugar**, **Lipid Profile** exist with prices if supported. |
| Look for / check | - Tests selectable for ordering later<br>- Active / available flag |
| Expected outcome | Catalog ready for Story S2 |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

---

### Step S0.10 — Pharmacy stock ready

| Field | Value |
|-------|-------|
| Role | `HOSPITAL_ADMIN` or `PHARMACIST` |
| Screen / URL | Pharmacy catalog / inventory |
| Action | Add Paracetamol, Amoxicillin, Pantoprazole, Vitamin D, Metformin with batch, expiry (>6 months), stock > 50. |
| Look for / check | - Stock quantity visible<br>- Expiry stored<br>- Reorder level if present |
| Expected outcome | Stock ready for Story S2 dispense |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

---

### Step S0.11 — Wards and beds ready

| Field | Value |
|-------|-------|
| Role | `HOSPITAL_ADMIN` |
| Screen / URL | Facilities / IPD facilities |
| Action | Create General Ward, Semi-Private, Private, ICU with ≥2 beds each. Confirm IPD services / FEATURE_IPD enabled (`/hospital/ipd-services`). |
| Look for / check | - Beds show status **AVAILABLE**<br>- IPD menu accessible<br>- Cannot accidentally create bed without ward |
| Expected outcome | Story S3 can admit to a free bed |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

---

### Step S0.12 — Spot-check staff logins

| Field | Value |
|-------|-------|
| Role | RX1, DR1, NU1, LB1, PH1 (one by one) |
| Screen / URL | `/login` |
| Action | Login each; confirm correct portal home (`/reception`, `/doctor`, `/nursing`, `/lab`, `/pharmacy`). Logout between. |
| Look for / check | - Correct landing<br>- Hospital context correct<br>- Wrong portal routes blocked or redirected |
| Expected outcome | Cast can enter their workplaces |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

---

### S0 story exit criteria

Continue to **Story S1** only if:

- [ ] Hospital exists and is operable  
- [ ] HA1 logged in  
- [ ] DR1 has future slots  
- [ ] At least RX1, DR1, LB1, PH1, NU1 can log in  
- [ ] Beds AVAILABLE for IPD later  

**S0 overall:** Result ______ · Improve notes: ______

---

## Next stories

1. Open [STORY_01_OPD_RAHUL_SHARMA.md](./STORY_01_OPD_RAHUL_SHARMA.md) and execute as Rahul + desk + doctor.  
2. Then [STORY_02_LAB_PHARMACY_PRIYA_PATIL.md](./STORY_02_LAB_PHARMACY_PRIYA_PATIL.md).  
3. Then [STORY_03_IPD_AMIT_KULKARNI.md](./STORY_03_IPD_AMIT_KULKARNI.md).  
4. Then [STORY_04_RBAC_AND_SECURITY.md](./STORY_04_RBAC_AND_SECURITY.md).
