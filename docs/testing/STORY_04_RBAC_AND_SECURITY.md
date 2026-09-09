# Story S4 — RBAC, isolation, and “should not work” checks

| Story ID | S4-SECURE |
| Goal | Prove each role only sees what it should; Hospital A ≠ Hospital B; patients cannot IDOR |
| Prerequisite | S0 staff exist; optionally Hospital B created |
| Rule | **Expected deny** that actually allows access = **FAIL** (security bug) |

Use accounts from [TEST_USERS.md](./TEST_USERS.md). Full matrix: [RBAC_MATRIX.md](./RBAC_MATRIX.md).

---

## Scene 1 — Receptionist boundaries

### Step S4.1 — RX1 cannot open platform admin

| Field | Value |
|-------|-------|
| Role | RX1 |
| Action | After login, manually go to `/admin/hospitals`. |
| Look for / check | - Redirect / 403 / access denied<br>- No hospital create UI |
| Expected outcome | Denied |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

### Step S4.2 — RX1 cannot configure hospital like admin

| Field | Value |
|-------|-------|
| Role | RX1 |
| Action | Try hospital profile edit, staff create, subscription pages. |
| Look for / check | - Menus hidden **or** API 403 if URL forced |
| Expected outcome | No hospital-level config |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

### Step S4.3 — RX1 cannot dispense / edit lab verify

| Field | Value |
|-------|-------|
| Role | RX1 |
| Action | Open `/pharmacy` dispense and `/lab` result verify URLs. |
| Look for / check | - Denied |
| Expected outcome | No pharmacist/lab tech powers |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

---

## Scene 2 — Pharmacist / Lab / Nurse boundaries

### Step S4.4 — PH1 cannot admit or edit doctor notes

| Field | Value |
|-------|-------|
| Role | PH1 |
| Action | Try IPD admit; try edit progress note as doctor. |
| Look for / check | - Denied |
| Expected outcome | Pharmacy only |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

### Step S4.5 — LB1 cannot prescribe

| Field | Value |
|-------|-------|
| Role | LB1 |
| Action | Try doctor consult sign Rx. |
| Look for / check | - Denied |
| Expected outcome | Lab only |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

### Step S4.6 — NU1 cannot hospital-admin or sign Rx

| Field | Value |
|-------|-------|
| Role | NU1 |
| Action | Try `/hospital` admin settings; try sign prescription. |
| Look for / check | - Denied |
| Expected outcome | Nursing clinical only |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

### Step S4.7 — DR1 cannot platform-admin or create staff

| Field | Value |
|-------|-------|
| Role | DR1 |
| Action | `/admin`, staff create. |
| Look for / check | - Denied |
| Expected outcome | Clinical portals only |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

---

## Scene 3 — Patient isolation (IDOR)

### Step S4.8 — Rahul must not see Priya

| Field | Value |
|-------|-------|
| Role | P1 |
| Action | From network tab or URL, try Priya’s encounter / prescription / lab / admission IDs (copy from S2/S3 while logged as staff, then switch to P1). |
| Look for / check | - 403 or 404<br>- UI shows error, not Priya’s PHI |
| Expected outcome | No cross-patient access |
| Actual outcome | HTTP=____ |
| Result | |
| Bug ID | |
| Improve? | |

---

## Scene 4 — Hospital isolation

### Step S4.9 — Create Hospital B (if not done)

| Field | Value |
|-------|-------|
| Role | PLATFORM_ADMIN |
| Action | Create **Health360 Test Hospital B** with different admin. |
| Look for / check | - Separate hospital id |
| Expected outcome | Second hospital exists |
| Actual outcome | Hospital B id=____ |
| Result | |
| Bug ID | |
| Improve? | |

### Step S4.10 — HA1 of Hospital A cannot read B’s patients

| Field | Value |
|-------|-------|
| Role | HA1 (Hospital A) |
| Action | Using API or UI, request Hospital B patient / bed / invoice ids. |
| Look for / check | - 403/404<br>- Lists never mix hospitals |
| Expected outcome | Strict hospital isolation |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

---

## Scene 5 — Auth negatives

### Step S4.11 — Wrong password

| Field | Value |
|-------|-------|
| Role | Public |
| Action | Login HA1 with wrong password. |
| Look for / check | - 401 / clear error<br>- No token issued<br>- No user enumeration detail beyond needed |
| Expected outcome | Fail closed |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

### Step S4.12 — Logout invalidates session

| Field | Value |
|-------|-------|
| Role | Any |
| Action | Login → copy token if possible → logout → reuse token on API. |
| Look for / check | - 401 after logout (or refresh revoked) |
| Expected outcome | Session ended |
| Actual outcome | |
| Result | |
| Bug ID | |
| Improve? | |

---

## S4 exit criteria

- [ ] RX / PH / LB / NU / DR denies verified  
- [ ] Patient IDOR denied  
- [ ] Cross-hospital denied  
- [ ] Auth negatives OK  

**S4 overall Result:** ______  

**Security improvements needed?** ______  

---

## After all stories (S0–S4)

1. Update [TEST_EXECUTION_SUMMARY.md](./TEST_EXECUTION_SUMMARY.md).  
2. Ensure every FAIL has a [BUG_TRACKER.md](./BUG_TRACKER.md) entry.  
3. Fill final recommendation in master validation doc §32.  
4. Only then continue major feature development.
