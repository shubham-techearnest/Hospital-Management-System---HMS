# Health360 RBAC Matrix

| Doc | H360-RBAC-001 |
| Master | [HEALTH360_END_TO_END_SYSTEM_VALIDATION.md](./HEALTH360_END_TO_END_SYSTEM_VALIDATION.md) |
| Fill | A = Allowed (expect 200/UI works) · D = Denied (expect 403/hidden) · — = N/A · Result column during UAT |

## Capability × Role

| Capability | PLATFORM_ADMIN | HOSPITAL_ADMIN | RECEPTIONIST | DOCTOR | NURSE | ICU_NURSE | LAB_TECH | PHARMACIST | PATIENT |
|------------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Create hospital | A | D | D | D | D | D | D | D | D |
| Hospital profile/config | A* | A | D | D | D | D | D | D | D |
| Manage staff/roles | A* | A | D | D | D | D | D | D | D |
| Manage departments | A* | A | D | D | D | D | D | D | D |
| Doctor schedule (own) | — | A | D | A | D | D | D | D | D |
| Desk patient register | — | A | A | D† | D | D | D | D | D |
| Patient search (hospital) | — | A | A | A | A‡ | A‡ | A‡ | A‡ | D |
| Book appointment (self) | — | — | — | — | — | — | — | — | A |
| OPD walk-in / queue ops | — | A | A | A§ | D | D | D | D | D |
| Doctor consultation write | — | D | D | A | D | D | D | D | D |
| Vitals write | — | A | A¶ | A | A | A | D | D | D |
| Sign prescription | — | D | D | A | D | D | D | D | D |
| View Rx (read) | — | A | A | A | A | A | D | A | A (own) |
| Lab order create | — | D | D | A | D | D | D | D | D |
| Lab result enter/verify | — | A* | D | D | D | D | A | D | D |
| View lab results | — | A | A | A | A | A | A | D | A (own) |
| Pharmacy dispense/stock | — | A | D | D | D | D | D | A | D |
| OPD billing checkout | — | A | A | D | D | D | D | D | D (pay own) |
| IPD admit / bed assign | — | A | A# | D | D | D | D | D | D |
| IPD chart clinical write | — | A* | D | A | A (nursing) | A | D | D | D |
| Discharge / clearances | — | A | A# | A (clinical) | A (nursing clr) | A | D | A (pharm clr) | D |
| Platform audit admin | A | D | D | D | D | D | D | D | D |
| Other hospital data | D** | D | D | D | D | D | D | D | D |

\* Platform may bypass hospital scope for support; still validate.  
† Doctors typically do not desk-register — confirm actual UI.  
‡ Read-only clinical context if permitted.  
§ Doctor queue call/start for own queue.  
¶ Receptionist vitals if P1-F2 grants.  
# Admission request / desk IPD per V80 receptionist grants — verify.  
\*\* Cross-hospital must deny.

## Explicit negative tests (must execute)

| TC | Actor | Action | Expected | Actual | Status |
|----|-------|--------|----------|--------|--------|
| RBAC-N01 | RECEPTIONIST | Open `/admin/hospitals` or admin API | Deny | | |
| RBAC-N02 | RECEPTIONIST | Change hospital profile settings | Deny | | |
| RBAC-N03 | RECEPTIONIST | Dispense / adjust pharmacy stock | Deny | | |
| RBAC-N04 | RECEPTIONIST | Enter lab verification | Deny | | |
| RBAC-N05 | RECEPTIONIST | Sign prescription / complete consult as doctor | Deny | | |
| RBAC-N06 | PHARMACIST | Admit patient / assign bed | Deny | | |
| RBAC-N07 | PHARMACIST | Edit doctor clinical notes | Deny | | |
| RBAC-N08 | PHARMACIST | Hospital subscription/config | Deny | | |
| RBAC-N09 | DOCTOR | Platform admin APIs | Deny | | |
| RBAC-N10 | DOCTOR | Create staff / change roles | Deny | | |
| RBAC-N11 | NURSE | Sign e-prescription | Deny | | |
| RBAC-N12 | PATIENT | Access another patient's encounter by ID | Deny | | |
| RBAC-N13 | HOSPITAL_ADMIN A | Read Hospital B patient | Deny | | |
| RBAC-N14 | LAB_TECH | Hospital billing admin | Deny | | |

## Portal route smoke (login → landing)

| Role | Expected home / portal |
|------|------------------------|
| PLATFORM_ADMIN | `/admin` |
| HOSPITAL_ADMIN | `/hospital` |
| RECEPTIONIST | `/reception` |
| DOCTOR | `/doctor` |
| NURSE | `/nursing` |
| ICU_NURSE | `/icu-nurse` |
| LAB_TECHNICIAN | `/lab` |
| PHARMACIST | `/pharmacy` |
| PATIENT | `/patient` |
