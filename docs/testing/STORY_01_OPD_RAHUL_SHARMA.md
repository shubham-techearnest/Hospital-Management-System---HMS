# Story S1 — Rahul Sharma: Complete OPD journey

| Story ID | S1-OPD |
| Patient | **Rahul Sharma** · Mobile `9000000001` · Age 32 · Male |
| Goal | Self-register → find hospital → book GM doctor → check-in → queue → consult → Rx → follow-up → see records on portal |
| Cast | Patient P1 · Receptionist RX1 · Doctor DR1 (General Medicine) |
| Prerequisite | Story **S0** complete (hospital + DR1 slots) |
| Log results | Fill Actual / Result / Improve on every step |

---

## Scene 1 — Rahul becomes a Health360 patient

### Step S1.1 — Open registration

| Field | Value |
|-------|-------|
| Role | Public (Rahul) |
| Screen / URL | `/register` |
| Action | 1. Open Register.<br>2. Enter: Name **Rahul Sharma**, mobile **9000000001**, email `rahul.sharma.h360qa@example.com`, DOB ~1994-03-15, Gender Male, password (record in TEST_USERS).<br>3. Submit. |
| Look for / check | - Required field validation<br>- Mobile format validation<br>- Clear error if mobile already exists<br>- Success message or redirect to verify/login |
| Expected outcome | User account created; **UHID generated** (shown now or after login/profile) |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

### Step S1.2 — Verify email if asked

| Field | Value |
|-------|-------|
| Role | P1 |
| Screen / URL | Verify email flow |
| Action | If app requires verification: read token from **server log** (local email is not real SMTP), complete verify. |
| Look for / check | - Account becomes usable<br>- Message is understandable for a real patient |
| Expected outcome | Rahul can log in |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | Yes if only logs — note “patients need real email in prod” |

### Step S1.3 — First login as patient

| Field | Value |
|-------|-------|
| Role | `PATIENT` |
| Screen / URL | `/login` → `/patient` |
| Action | Login with email + password. |
| Look for / check | - Patient portal dashboard<br>- UHID visible on profile or dashboard<br>- Toast nav / sidebar: search, doctors, appointments/OPD, prescriptions, etc. |
| Expected outcome | Patient home works; UHID recorded in TEST_USERS |
| Actual outcome | UHID = ________ |
| Result | |
| Bug ID | |
| Improve? | |

---

## Scene 2 — Rahul finds the hospital and books

### Step S1.4 — Search hospital

| Field | Value |
|-------|-------|
| Role | P1 |
| Screen / URL | Patient search / hospitals (e.g. `/patient/search` or hospitals list) |
| Action | Search **Health360 Test Multispeciality** or city filters used in S0. |
| Look for / check | - Hospital appears<br>- Name, address, type readable<br>- Open details works without leaving patient shell (sidebar stays if designed so) |
| Expected outcome | Hospital found and openable |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

### Step S1.5 — Choose General Medicine → Doctor 1

| Field | Value |
|-------|-------|
| Role | P1 |
| Screen / URL | Hospital / doctors / booking profile |
| Action | 1. Open departments or doctors.<br>2. Select **General Medicine**.<br>3. Open **Dr. Ananya Gupta (DR1)**.<br>4. View profile: specialization, fees if shown. |
| Look for / check | - Doctor belongs to this hospital<br>- Availability / calendar visible<br>- Fee and department correct |
| Expected outcome | Ready to pick a slot |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

### Step S1.6 — Select date and time slot

| Field | Value |
|-------|-------|
| Role | P1 |
| Screen / URL | Booking UI |
| Action | 1. Pick a **future** date with green/available slots.<br>2. Select one slot.<br>3. Confirm booking. |
| Look for / check | - Past dates disabled or rejected<br>- Already booked slots not selectable<br>- Confirmation screen: hospital, doctor, date, time<br>- Booking ID / appointment id shown |
| Expected outcome | Appointment created; status **PENDING** or **CONFIRMED** |
| Actual outcome | Appointment ID = ____ · Status = ____ |
| Result | |
| Bug ID | |
| Improve? | |

### Step S1.7 — Patient sees appointment on portal

| Field | Value |
|-------|-------|
| Role | P1 |
| Screen / URL | Patient appointments / OPD / dashboard |
| Action | Open upcoming appointments list. |
| Look for / check | - Same doctor, date, time<br>- Status matches<br>- Cancel / reschedule controls exist or are clearly unavailable |
| Expected outcome | Appointment visible to patient |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

### Step S1.8 — Reception sees the appointment

| Field | Value |
|-------|-------|
| Role | `RECEPTIONIST` RX1 |
| Screen / URL | `/reception` appointments / OPD list |
| Action | Logout P1. Login RX1. Find today’s / selected date appointments for Rahul / DR1. |
| Look for / check | - Patient name + UHID<br>- Doctor<br>- Time<br>- Status<br>- Action to mark arrived / check-in |
| Expected outcome | Desk sees the booking (hospital scoped) |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

---

## Scene 3 — Arrival, OPD visit, queue

### Step S1.9 — Mark arrived / check-in

| Field | Value |
|-------|-------|
| Role | RX1 |
| Screen / URL | Reception appointment / OPD |
| Action | Mark Rahul **arrived** (app uses status **ARRIVED**, not “CHECKED_IN”). Complete any OPD registration confirmation. |
| Look for / check | - Appointment status → **ARRIVED**<br>- OPD visit / encounter created<br>- Visit or token number shown |
| Expected outcome | OPD visit linked to appointment |
| Actual outcome | Encounter/Visit ID = ____ · Token = ____ |
| Result | |
| Bug ID | |
| Improve? | |

### Step S1.10 — Patient in queue

| Field | Value |
|-------|-------|
| Role | RX1 (and optionally P1) |
| Screen / URL | Queue board / OPD queue |
| Action | Confirm Rahul appears in DR1 queue. |
| Look for / check | - Queue status **WAITING**<br>- Position / token unique<br>- Correct doctor queue<br>- Patient portal live status if implemented |
| Expected outcome | Waiting in doctor queue |
| Actual outcome | Queue status = ____ |
| Result | |
| Bug ID | |
| Improve? | |

### Step S1.11 — Optional queue ops (skip / recall)

| Field | Value |
|-------|-------|
| Role | RX1 or DR1 |
| Screen / URL | Queue controls |
| Action | If safe on test data: Skip then Recall Rahul (or use a dummy second patient). Prefer not to lose Rahul’s place permanently. |
| Look for / check | - Status **SKIPPED** then back to **WAITING** / **CALLED**<br>- No token collision |
| Expected outcome | Skip/recall works without corrupting queue |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

---

## Scene 4 — Doctor consultation

### Step S1.12 — Doctor opens queue and calls patient

| Field | Value |
|-------|-------|
| Role | `DOCTOR` DR1 |
| Screen / URL | `/doctor/opd` (or appointments→opd) |
| Action | 1. Login DR1.<br>2. See Rahul in queue.<br>3. Call / start consultation. |
| Look for / check | - Queue → **CALLED** then **IN_SERVICE**<br>- Encounter → **IN_PROGRESS**<br>- Patient demographics + UHID visible |
| Expected outcome | Consultation session open |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

### Step S1.13 — Review profile / history

| Field | Value |
|-------|-------|
| Role | DR1 |
| Screen / URL | Consultation workspace |
| Action | Open patient profile / previous visits (may be empty first time). |
| Look for / check | - Correct patient (not someone else)<br>- Empty history OK for first visit<br>- No crash on empty timeline |
| Expected outcome | Safe empty or prior data |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

### Step S1.14 — Record chief complaint / symptoms

| Field | Value |
|-------|-------|
| Role | DR1 |
| Action | Enter: “Fever and body ache for 3 days.” Save. |
| Look for / check | - Text persists<br>- Required fields enforced<br>- Autosave or explicit save clear |
| Expected outcome | Complaint saved |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

### Step S1.15 — Record vitals

| Field | Value |
|-------|-------|
| Role | DR1 (or nurse if flow uses nurse first) |
| Action | Enter BP 120/80, Pulse 78, Temp 38.2, SpO2 98% (and RR if field exists). |
| Look for / check | - Invalid vitals rejected (e.g. BP 9999)<br>- Units shown<br>- Timestamp of recording |
| Expected outcome | Vitals stored on encounter |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

### Step S1.16 — Diagnosis + clinical notes

| Field | Value |
|-------|-------|
| Role | DR1 |
| Action | Diagnosis: Acute viral fever (pick ICD/catalog if dropdown). Notes: Advise hydration, rest. |
| Look for / check | - Diagnosis searchable from catalog if ECO ICD enabled<br>- Notes length limits reasonable |
| Expected outcome | Diagnosis + notes saved |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

### Step S1.17 — Create and sign prescription

| Field | Value |
|-------|-------|
| Role | DR1 |
| Action | Add **Paracetamol 500mg**, dose TDS, duration 3 days, instruction after food. Sign / finalize Rx. |
| Look for / check | - Medicine search works<br>- Rx status **SIGNED** (not stuck DRAFT)<br>- Linked to patient + encounter + doctor + hospital |
| Expected outcome | Signed prescription ready for patient (and later pharmacy) |
| Actual outcome | Rx ID = ____ · Status = ____ |
| Result | |
| Bug ID | |
| Improve? | |

### Step S1.18 — Follow-up + complete visit

| Field | Value |
|-------|-------|
| Role | DR1 |
| Action | Schedule follow-up in 5–7 days if UI supports. Mark consultation **complete**. |
| Look for / check | - Encounter **COMPLETED**<br>- Queue **COMPLETED**<br>- Appointment **COMPLETED**<br>- Follow-up visible to patient if created |
| Expected outcome | Clean status close-out across appointment + queue + encounter |
| Actual outcome | Appt=____ Queue=____ Encounter=____ |
| Result | |
| Bug ID | |
| Improve? | |

---

## Scene 5 — Rahul checks his records

### Step S1.19 — Patient portal: visit + prescription

| Field | Value |
|-------|-------|
| Role | P1 |
| Screen / URL | `/patient` → OPD / prescriptions / timeline |
| Action | Login Rahul. Open visit history and prescription. |
| Look for / check | - Same diagnosis / Rx medicines<br>- Doctor name<br>- Date<br>- Cannot see Priya or Amit records |
| Expected outcome | Patient sees own clinical summary |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

### Step S1.20 — Optional billing for OPD fee

| Field | Value |
|-------|-------|
| Role | RX1 |
| Screen / URL | Checkout `/reception/checkout/:encounterId` or hospital billing |
| Action | Create/settle consultation invoice if not auto-done. |
| Look for / check | - Invoice status DRAFT→ISSUED→PAID/PARTIALLY_PAID<br>- Amount matches fee<br>- Patient payments page updates |
| Expected outcome | OPD fee billable |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

---

## S1 exit criteria

- [ ] UHID issued  
- [ ] Appointment booked and visible both sides  
- [ ] ARRIVED → queue → consult → COMPLETED  
- [ ] Signed Rx visible to patient  
- [ ] Statuses match real enums (ARRIVED, WAITING, IN_SERVICE, SIGNED, COMPLETED)  

**S1 overall Result:** ______  

**Top improvements from this story:**  

1. ______  
2. ______  
3. ______  

**Next:** [STORY_02_LAB_PHARMACY_PRIYA_PATIL.md](./STORY_02_LAB_PHARMACY_PRIYA_PATIL.md)
