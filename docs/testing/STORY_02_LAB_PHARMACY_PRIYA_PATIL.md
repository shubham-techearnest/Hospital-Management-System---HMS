# Story S2 — Priya Patil: Desk registration + Lab + Pharmacy + Billing

| Story ID | S2-CROSS |
| Patient | **Priya Patil** · Mobile `9000000002` · Age 28 · Female · **no account at start** |
| Goal | Reception creates patient → walk-in OPD → doctor orders labs → lab results → Rx → pharmacy dispense → billing |
| Cast | RX1 · DR1 · LB1 · PH1 · Patient P2 |
| Prerequisite | S0 complete; lab catalog + pharmacy stock ready |
| Known gap | Lab/Pharmacy **do not auto-bill** — use manual invoice lines; mark PARTIAL if that is the only gap |

---

## Scene 1 — Desk creates Priya (user + patient + UHID)

### Step S2.1 — Search before create

| Field | Value |
|-------|-------|
| Role | `RECEPTIONIST` RX1 |
| Screen / URL | Reception patient search / register |
| Action | Search mobile **9000000002**, name Priya Patil, DOB 1998-07-22. |
| Look for / check | - No existing patient (first time)<br>- Empty state clear (“No patient found”)<br>- Search trims spaces if you type ` 9000000002 ` |
| Expected outcome | No match → proceed to register |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

### Step S2.2 — Register hospital patient

| Field | Value |
|-------|-------|
| Role | RX1 |
| Screen / URL | Walk-in / new patient registration |
| Action | Enter Priya’s demographics + mobile **9000000002**. Submit. **Read credentials panel carefully.** |
| Look for / check | - **UHID** generated and shown<br>- Login guidance shows **mobile** (and real email only if entered)<br>- Temporary password shown once<br>- Stub email `@patient.health360.local` is **NOT** shown as the login id<br>- Message that patient can log in with mobile + password |
| Expected outcome | User + patient created; UHID; temp password; user rule satisfied (patient has user account) |
| Actual outcome | UHID=____ · Temp password recorded? Y/N · Login id shown=____ |
| Result | |
| Bug ID | |
| Improve? | |

### Step S2.3 — Priya can log in with mobile

| Field | Value |
|-------|-------|
| Role | P2 |
| Screen / URL | `/login` |
| Action | Login field = **9000000002**, password = temp password from desk. |
| Look for / check | - Login succeeds<br>- Patient portal opens<br>- UHID on profile<br>- Prompt to set email/password in settings (nice-to-have) |
| Expected outcome | Mobile login works for desk-created patient |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

### Step S2.4 — Duplicate protection smoke

| Field | Value |
|-------|-------|
| Role | RX1 |
| Action | Try register again with same mobile `9000000002`. |
| Look for / check | - Block or strong duplicate warning<br>- Does not create second UHID silently |
| Expected outcome | Duplicate prevented or clearly warned |
| Actual outcome | _(document exact behavior)_ |
| Result | |
| Bug ID | |
| Improve? | |

---

## Scene 2 — Walk-in OPD to doctor

### Step S2.5 — Create walk-in OPD for Priya

| Field | Value |
|-------|-------|
| Role | RX1 |
| Screen / URL | OPD walk-in / registration |
| Action | Find Priya by UHID/mobile. Select DR1. Create walk-in visit / queue entry. |
| Look for / check | - Correct patient linked<br>- Doctor selected<br>- Token / visit number<br>- Queue **WAITING** |
| Expected outcome | Priya waiting for DR1 |
| Actual outcome | Visit/Token=____ |
| Result | |
| Bug ID | |
| Improve? | |

### Step S2.6 — Doctor starts consult

| Field | Value |
|-------|-------|
| Role | DR1 |
| Screen / URL | `/doctor/opd` |
| Action | Call Priya; open consult. Complaint: “Weakness, routine check-up.” |
| Look for / check | - Correct patient (Priya, not Rahul)<br>- Encounter IN_PROGRESS |
| Expected outcome | Consult open for Priya |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

---

## Scene 3 — Laboratory path

### Step S2.7 — Doctor orders lab tests

| Field | Value |
|-------|-------|
| Role | DR1 |
| Action | Order: **CBC**, **Blood Sugar**, **Lipid Profile**. Submit order. |
| Look for / check | - Order created with order number<br>- Patient, doctor, hospital, visit linked<br>- Lab order status starts **RECEIVED** (actual enum) |
| Expected outcome | Three tests on one or more lab orders visible to lab |
| Actual outcome | Order ID(s)=____ · Status=____ |
| Result | |
| Bug ID | |
| Improve? | |

### Step S2.8 — Lab sees worklist

| Field | Value |
|-------|-------|
| Role | `LAB_TECHNICIAN` LB1 |
| Screen / URL | `/lab` worklist |
| Action | Login LB1. Find Priya’s pending orders. |
| Look for / check | - Patient name + UHID<br>- Ordered tests<br>- Ordering doctor<br>- Hospital correct |
| Expected outcome | Lab can pick up work |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

### Step S2.9 — Sample collected

| Field | Value |
|-------|-------|
| Role | LB1 |
| Action | Mark sample collected for Priya’s order. |
| Look for / check | - Status → **SAMPLE_COLLECTED**<br>- Timestamp / collector if shown<br>- Cannot collect for wrong patient (UI clarity) |
| Expected outcome | Sample stage recorded |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

### Step S2.10 — Enter results (draft)

| Field | Value |
|-------|-------|
| Role | LB1 |
| Action | Enter plausible values for CBC / sugar / lipids. Save as draft. |
| Look for / check | - Status **RESULTS_DRAFT**<br>- Result line status **DRAFT**<br>- Reference range shown if implemented<br>- Validation on absurd values (note behavior) |
| Expected outcome | Draft results saved |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

### Step S2.11 — Verify and release

| Field | Value |
|-------|-------|
| Role | LB1 (or verifier role if split) |
| Action | Verify results → release to clinical/patient. |
| Look for / check | - Result **VERIFIED**<br>- Order **VERIFIED** then **RELEASED**<br>- After release, editing locked or audited |
| Expected outcome | Results available downstream |
| Actual outcome | Final order status=____ |
| Result | |
| Bug ID | |
| Improve? | |

### Step S2.12 — Doctor reviews results

| Field | Value |
|-------|-------|
| Role | DR1 |
| Screen / URL | Same encounter / patient reports |
| Action | Open Priya’s lab results inside consult or reports. |
| Look for / check | - Same values as lab entered<br>- Linked to this visit<br>- Can update diagnosis after review |
| Expected outcome | Doctor→Lab→Doctor loop closed |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

### Step S2.13 — Patient sees lab report (if supported)

| Field | Value |
|-------|-------|
| Role | P2 |
| Screen / URL | `/patient` reports / lab-values |
| Action | Login Priya; open lab reports. |
| Look for / check | - Released results visible<br>- Not visible before RELEASED (if you retest timing)<br>- Only Priya’s data |
| Expected outcome | Patient access when released |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

---

## Scene 4 — Prescription → Pharmacy → Stock

### Step S2.14 — Doctor signs prescription after labs

| Field | Value |
|-------|-------|
| Role | DR1 |
| Action | Update diagnosis if needed. Prescribe e.g. **Vitamin D** + **Pantoprazole** with dose/duration. Sign. Complete consult. |
| Look for / check | - Rx **SIGNED**<br>- Encounter completed<br>- Pharmacy can see request |
| Expected outcome | Rx ready for pharmacy |
| Actual outcome | Rx ID=____ |
| Result | |
| Bug ID | |
| Improve? | |

### Step S2.15 — Pharmacist opens request

| Field | Value |
|-------|-------|
| Role | `PHARMACIST` PH1 |
| Screen / URL | `/pharmacy` worklist / requests |
| Action | Find Priya’s pharmacy request / medication order. |
| Look for / check | - Correct medicines & qty<br>- Patient + UHID<br>- Prescriber<br>- Request status progresses (REQUESTED → …) |
| Expected outcome | Pharmacist sees doctor Rx |
| Actual outcome | Request status=____ |
| Result | |
| Bug ID | |
| Improve? | |

### Step S2.16 — Check stock then dispense

| Field | Value |
|-------|-------|
| Role | PH1 |
| Action | 1. Note stock qty before.<br>2. Dispense available medicines.<br>3. Confirm dispense complete. |
| Look for / check | - Stock **decreases** by dispensed qty<br>- Status ends **DISPENSED** (or PARTIALLY_AVAILABLE if partial)<br>- Cannot dispense more than stock (try once as negative) |
| Expected outcome | Inventory deducted; dispense complete |
| Actual outcome | Stock before=____ after=____ · Final status=____ |
| Result | |
| Bug ID | |
| Improve? | |

### Step S2.17 — Negative: expired / zero stock (optional same day)

| Field | Value |
|-------|-------|
| Role | PH1 |
| Action | If you can set a batch expired or qty 0 on a test medicine, attempt dispense. |
| Look for / check | - Clear error<br>- No silent negative stock |
| Expected outcome | Blocked with message |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

---

## Scene 5 — Billing (with known workaround)

### Step S2.18 — OPD checkout invoice

| Field | Value |
|-------|-------|
| Role | RX1 |
| Screen / URL | Checkout for Priya’s encounter |
| Action | 1. Open checkout.<br>2. Confirm consultation line.<br>3. **Manually add** lab and pharmacy charge lines if they did not appear automatically.<br>4. Issue invoice and take payment (full or partial). |
| Look for / check | - Auto lab/pharmacy lines? **Yes/No** (expect No today → PARTIAL)<br>- Totals math correct<br>- No duplicate consultation fee<br>- Invoice **ISSUED** → **PAID** or **PARTIALLY_PAID**<br>- Patient payments page updates |
| Expected outcome | Bill can be settled; auto-charge gap documented |
| Actual outcome | Auto lines? ____ · Invoice status=____ · Amount=____ |
| Result | PASS / **PARTIAL** |
| Bug ID | Use GAP-G001/G002 unless UI falsely claims auto-billing |
| Improve? | Yes — auto bill from lab/pharmacy |

### Step S2.19 — Patient sees bill / Rx

| Field | Value |
|-------|-------|
| Role | P2 |
| Screen / URL | `/patient` payments + prescriptions |
| Action | Confirm Rx list and payment/bill visibility. |
| Look for / check | - Own data only<br>- Amounts match |
| Expected outcome | Portal reflects visit financially & clinically |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

---

## Integration scorecard (fill at end of S2)

| Integration | Expected | Actual (PASS/FAIL/PARTIAL) |
|-------------|----------|----------------------------|
| Desk → User+Patient+UHID | Connected | |
| Doctor → Lab order | Connected | |
| Lab → Doctor result | Connected | |
| Lab → Patient report | Connected / Partial | |
| Doctor → Pharmacy | Connected | |
| Pharmacy → Inventory | Connected | |
| Pharmacy → Billing | **Not auto** | |
| OPD → Billing | Connected | |

## S2 exit criteria

- [ ] Desk credentials + mobile login work  
- [ ] Lab status chain to RELEASED  
- [ ] Pharmacy dispensed + stock down  
- [ ] Invoice settled (manual lines OK)  

**S2 overall Result:** ______  

**Top improvements:**  

1. ______  
2. ______  

**Next:** [STORY_03_IPD_AMIT_KULKARNI.md](./STORY_03_IPD_AMIT_KULKARNI.md)
