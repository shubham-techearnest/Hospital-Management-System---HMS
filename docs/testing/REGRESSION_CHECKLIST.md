# Health360 Regression Checklist

| Doc | H360-REG-001 |
| Master | [HEALTH360_END_TO_END_SYSTEM_VALIDATION.md](./HEALTH360_END_TO_END_SYSTEM_VALIDATION.md) |
| When | After every bug fix that touches shared modules; full run in PHASE 16 |

Mark: ☐ Pending · ☑ Pass · ✖ Fail · ◐ Partial · — N/A

## Smoke (always)

- [ ] Platform admin login  
- [ ] Hospital admin login (H360-TEST-001)  
- [ ] Receptionist login  
- [ ] Doctor login  
- [ ] Patient login (email + mobile)  
- [ ] Create/search patient  
- [ ] Book appointment OR walk-in OPD  
- [ ] Queue call → consult complete  
- [ ] Sign prescription  
- [ ] Lab order → result release  
- [ ] Pharmacy dispense  
- [ ] OPD invoice / payment (manual lines OK)  
- [ ] IPD admit → bed occupied  
- [ ] Discharge → bed released  
- [ ] Patient portal sees own records only  

## By fix area

| If fix touched… | Also retest |
|-----------------|-------------|
| Auth / login | Mobile + email login, refresh, logout, P2 desk creds |
| Patient registry | UHID uniqueness, search, duplicate warning |
| Scheduling | Double-book, cancel, arrive |
| OPD / queue | Skip, recall, no-show, multi-doctor |
| Clinical / Rx | Sign, patient visibility, pharmacy request |
| Lab | Status chain, patient/doctor visibility |
| Pharmacy | Stock decrement, partial, zero stock |
| Billing | Totals, no duplicate fee, pay statuses |
| IPD / bed | Concurrent bed assign, transfer, discharge release |
| RBAC / scope | Cross-hospital deny, role deny matrix samples |
| Migrations | Fresh migrate V87 on clean DB |

## Sign-off

| Build / commit | Tester | Date | Result |
|----------------|--------|------|--------|
| | | | |
