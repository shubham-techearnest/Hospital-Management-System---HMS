# Story S3 — Amit Kulkarni: Complete IPD journey

| Story ID | S3-IPD |
| Patient | **Amit Kulkarni** · Mobile `9000000003` · Age 56 · Male |
| Goal | OPD → admission request → admit + bed → nursing → doctor notes → IPD lab/meds → charges → transfer → discharge → bed free → portal history |
| Cast | P3 · RX1 · DR1 (or DR3) · NU1 · LB1 · PH1 · HA1 |
| Prerequisite | S0 beds AVAILABLE; IPD services enabled |
| Notes | Blood bank UI may be **stub** — mark NOT IN UI / PARTIAL, not FAIL. Discharge PDF may be missing. |

---

## Scene 1 — Amit is a known patient, needs admission

### Step S3.1 — Amit self-registers (if not already)

| Field | Value |
|-------|-------|
| Role | Public → P3 |
| Screen / URL | `/register` → `/login` |
| Action | Register Amit: mobile **9000000003**, email `amit.kulkarni.h360qa@example.com`. Login. Record UHID. |
| Look for / check | - UHID present<br>- Patient portal opens |
| Expected outcome | User+patient ready |
| Actual outcome | UHID=____ |
| Result | |
| Bug ID | |
| Improve? | |

### Step S3.2 — OPD visit leading to admission

| Field | Value |
|-------|-------|
| Role | RX1 then DR1 |
| Screen / URL | Walk-in or appointment → doctor OPD |
| Action | Create OPD for Amit with DR1. Doctor notes: needs inpatient observation / unstable symptoms. |
| Look for / check | - Encounter active<br>- Clinical note saved |
| Expected outcome | Clinical context for admission |
| Actual outcome | Encounter=____ |
| Result | |
| Bug ID | |
| Improve? | |

### Step S3.3 — Doctor recommends admission

| Field | Value |
|-------|-------|
| Role | DR1 |
| Screen / URL | OPD / IPD recommend admission control |
| Action | Create **admission request** (reason, department, preferred ward if asked). |
| Look for / check | - Request created<br>- Status **REQUESTED**<br>- Visible on hospital IPD **Requests** tab |
| Expected outcome | Desk can see pending admission request |
| Actual outcome | Request ID=____ · Status=____ |
| Result | |
| Bug ID | |
| Improve? | |

---

## Scene 2 — Admission desk assigns bed

### Step S3.4 — Review and approve request

| Field | Value |
|-------|-------|
| Role | HA1 or RX1 |
| Screen / URL | `/hospital/ipd` Requests |
| Action | Open Amit’s request. Move UNDER_REVIEW → APPROVED (as UI allows). |
| Look for / check | - Status transitions match enums<br>- Reject path exists (don’t reject Amit) |
| Expected outcome | Approved for admit |
| Actual outcome | Status=____ |
| Result | |
| Bug ID | |
| Improve? | |

### Step S3.5 — Admit: ward, room, bed, consultant

| Field | Value |
|-------|-------|
| Role | HA1 / RX1 |
| Screen / URL | IPD admit flow |
| Action | Select department, consultant **DR1**, **General Ward**, room, an **AVAILABLE** bed. Confirm admit. |
| Look for / check | - Admission number / IPD number generated<br>- Admission status **ADMITTED**<br>- Patient shown on IPD list<br>- Selected bed → **OCCUPIED**<br>- Cannot pick already OCCUPIED bed |
| Expected outcome | Amit admitted; bed occupied |
| Actual outcome | Admission#=____ · Bed=____ · Bed status=____ |
| Result | |
| Bug ID | |
| Improve? | |

### Step S3.6 — Negative: second patient same bed

| Field | Value |
|-------|-------|
| Role | HA1 |
| Action | Attempt assign **same bed** to another test admit (or simulate). |
| Look for / check | - Error / 409-style rejection<br>- Bed still one patient |
| Expected outcome | Concurrent double-occupy blocked |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

---

## Scene 3 — Nursing and doctor IPD care

### Step S3.7 — Nurse sees patient on ward board

| Field | Value |
|-------|-------|
| Role | `NURSE` NU1 |
| Screen / URL | `/nursing/ward` |
| Action | Login NU1. Find Amit. Open admission chart. |
| Look for / check | - Correct bed/ward<br>- Patient identifiers<br>- Nurse cannot open hospital subscription/admin settings |
| Expected outcome | Nursing dashboard shows admitted patient |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

### Step S3.8 — Initial nursing assessment / vitals

| Field | Value |
|-------|-------|
| Role | NU1 |
| Screen / URL | IPD chart (shared) |
| Action | Record vitals: BP, pulse, temp, SpO2, RR. Add nursing note: “Admitted; monitoring.” |
| Look for / check | - Vitals saved with time<br>- Nursing note visible<br>- Nurse **cannot** sign doctor-only prescription / final diagnosis if restricted |
| Expected outcome | Nursing documentation present |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

### Step S3.9 — Doctor progress note + medication order

| Field | Value |
|-------|-------|
| Role | DR1 |
| Screen / URL | `/doctor/ipd` → admission chart |
| Action | Add progress note. Create medication order (e.g. Pantoprazole IV/oral per UI). |
| Look for / check | - Note authored by doctor<br>- Med order visible to nursing/pharmacy paths used by IPD |
| Expected outcome | Clinical plan started |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

### Step S3.10 — Medication administration (eMAR)

| Field | Value |
|-------|-------|
| Role | NU1 |
| Action | Record administration / eMAR outcome for ordered med if UI supports. |
| Look for / check | - Dose given time<br>- Cannot give cancelled order<br>- History retained |
| Expected outcome | MAR updated |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

### Step S3.11 — IPD lab order + result

| Field | Value |
|-------|-------|
| Role | DR1 → LB1 → DR1 |
| Action | Order CBC from IPD chart. Lab collects → result → verify → release. Doctor opens result on chart. |
| Look for / check | - Order tied to **admission** (not only OPD)<br>- Same lab statuses as S2<br>- Critical ack if prompted |
| Expected outcome | IPD ↔ Lab connected |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

### Step S3.12 — Pharmacy supply for IPD

| Field | Value |
|-------|-------|
| Role | PH1 |
| Action | Fulfill IPD medication / pharmacy request; confirm stock movement. |
| Look for / check | - Linked to admission/patient<br>- Stock decreases |
| Expected outcome | IPD ↔ Pharmacy connected |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

---

## Scene 4 — Charges and bed transfer

### Step S3.13 — Review accumulating charges

| Field | Value |
|-------|-------|
| Role | HA1 / billing-capable RX1 |
| Screen / URL | IPD billing / charges on admission |
| Action | Open charges / deposits / interim invoice if available. |
| Look for / check | - Bed/room related charges if configured<br>- Deposit / interim invoice statuses<br>- No obvious duplicate bed charge for same day (note if unclear) |
| Expected outcome | Some financial activity visible for IPD |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

### Step S3.14 — Transfer to Semi-Private bed

| Field | Value |
|-------|-------|
| Role | HA1 / RX1 |
| Action | Transfer Amit from General Ward bed → free Semi-Private bed. |
| Look for / check | - Old bed leaves **OCCUPIED** (often **CLEANING** or **AVAILABLE**)<br>- New bed **OCCUPIED**<br>- Chart still same admission<br>- Nursing board shows new location |
| Expected outcome | Transfer consistent across bed board + admission |
| Actual outcome | Old bed=____ · New bed=____ |
| Result | |
| Bug ID | |
| Improve? | |

---

## Scene 5 — Discharge and portal

### Step S3.15 — Doctor discharge advice / plan

| Field | Value |
|-------|-------|
| Role | DR1 |
| Action | Create discharge plan / order: diagnosis, advice, discharge medicines, follow-up date. |
| Look for / check | - Plan saved<br>- Clearances list appears (pharmacy, lab, billing, nursing) |
| Expected outcome | Discharge process started |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

### Step S3.16 — Clearances

| Field | Value |
|-------|-------|
| Role | PH1, LB1, NU1, HA1/RX1 as applicable |
| Action | Clear each clearance: PENDING → **CLEARED** (or WAIVED with reason if allowed). |
| Look for / check | - Cannot complete discharge while **BLOCKED**/uncleared if rules enforce<br>- Each clearance shows who/when if audited |
| Expected outcome | All required clearances CLEARED |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

### Step S3.17 — Final bill / settlement

| Field | Value |
|-------|-------|
| Role | HA1 / RX1 |
| Action | Generate/finalize IPD bill; take payment to PAID or acceptable balance rule. |
| Look for / check | - Final amount<br>- Payment status<br>- Lab/pharmacy lines manual if missing |
| Expected outcome | Financial clearance possible |
| Actual outcome | Invoice status=____ |
| Result | |
| Bug ID | |
| Improve? | |

### Step S3.18 — Complete discharge

| Field | Value |
|-------|-------|
| Role | DR1 / HA1 |
| Action | Confirm discharge. |
| Look for / check | - Admission → **DISCHARGED** (later maybe FOLLOW_UP / CLOSED)<br>- Bed released from OCCUPIED<br>- Discharge summary content on screen (PDF may be **NOT IN UI**) |
| Expected outcome | Patient discharged; bed reusable after cleaning if required |
| Actual outcome | Admission status=____ · Bed status=____ |
| Result | |
| Bug ID | |
| Improve? | |

### Step S3.19 — Patient portal IPD history

| Field | Value |
|-------|-------|
| Role | P3 |
| Screen / URL | `/patient/ipd` |
| Action | Login Amit. Open IPD admission history / summary. |
| Look for / check | - Admission dates, ward/bed history if shown<br>- Discharge advice / follow-up<br>- No other patient data<br>- Summary usable even without PDF |
| Expected outcome | Patient can review inpatient episode |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

### Step S3.20 — Optional LAMA / death paths

| Field | Value |
|-------|-------|
| Role | HA1 |
| Action | **Do not** run on Amit if already discharged. On a **separate** test admission only, explore LAMA/DECEASED if time permits. |
| Look for / check | - Distinct admission statuses<br>- Bed still released |
| Expected outcome | Alternate exits documented |
| Actual outcome | Skipped / Done |
| Result | |
| Bug ID | |
| Improve? | |

---

## S3 integration scorecard

| Link | Result |
|------|--------|
| OPD → Admission request | |
| Request → Admit → Bed OCCUPIED | |
| Nursing chart | |
| Doctor IPD notes / orders | |
| IPD → Lab | |
| IPD → Pharmacy | |
| Transfer bed consistency | |
| Clearances → Discharge | |
| Discharge → Bed release | |
| Portal history | |

## S3 exit criteria

- [ ] Admitted with number + occupied bed  
- [ ] Nursing + doctor documentation  
- [ ] Transfer updates both beds  
- [ ] Discharged + bed free/cleaning  
- [ ] Patient sees IPD history  

**S3 overall Result:** ______  

**Top improvements:**  

1. ______  
2. ______  
3. ______  

**Next:** [STORY_04_RBAC_AND_SECURITY.md](./STORY_04_RBAC_AND_SECURITY.md)
