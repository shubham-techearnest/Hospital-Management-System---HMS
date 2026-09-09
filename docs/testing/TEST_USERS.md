# Health360 Test Users

| Doc | H360-TEST-USERS-001 |
| Master | [HEALTH360_END_TO_END_SYSTEM_VALIDATION.md](./HEALTH360_END_TO_END_SYSTEM_VALIDATION.md) |
| Rule | Fill **Actual password / UHID** during execution. Never commit real production secrets. |

Default QA password pattern (change if policy requires): `H360Qa!2026`

---

## Platform

| ID | Name | Email | Mobile | Role | Hospital | Password | Notes |
|----|------|-------|--------|------|----------|----------|-------|
| U-PA | Platform Admin | _(existing seed or create)_ | — | `PLATFORM_ADMIN` | — | _fill_ | Creates H360-TEST-001 |

---

## Hospital staff — Health360 Test Multispeciality Hospital

| ID | Name | Email | Mobile | Role (actual IAM) | Department | Password | Expected access | Must NOT access |
|----|------|-------|--------|-------------------|------------|----------|-----------------|-----------------|
| U-HA1 | Kavita Deshmukh | ha1.h360test@example.com | 9100000001 | `HOSPITAL_ADMIN` | Admin | _fill_ | Full hospital config, staff, IPD, billing | Platform admin |
| U-HA2 | Suresh Naik | ha2.h360test@example.com | 9100000002 | `HOSPITAL_ADMIN` | Admin | _fill_ | Same (backup) | Platform admin |
| U-RX1 | Meera Joshi | rx1.h360test@example.com | 9100000003 | `RECEPTIONIST` | Front desk | _fill_ | OPD register, queue, checkout, admit requests | Hospital config, pharmacy stock write (unless granted), doctor consult write |
| U-RX2 | Anil Pawar | rx2.h360test@example.com | 9100000004 | `RECEPTIONIST` | Front desk | _fill_ | Same | Same |
| U-DR1 | Dr. Ananya Gupta | dr1.gm.h360test@example.com | 9100000005 | `DOCTOR` | General Medicine | _fill_ | OPD/IPD clinical for assigned hospital | Hospital admin settings |
| U-DR2 | Dr. Rohan Mehta | dr2.ortho.h360test@example.com | 9100000006 | `DOCTOR` | Orthopedics | _fill_ | Ortho clinical | Admin / other hospital |
| U-DR3 | Dr. Neha Kulkarni | dr3.card.h360test@example.com | 9100000007 | `DOCTOR` | Cardiology | _fill_ | Cardio clinical | Admin |
| U-NU1 | Pooja Sawant | nu1.h360test@example.com | 9100000008 | `NURSE` | Nursing | _fill_ | Ward board, vitals, MAR | Hospital config, prescribe as doctor |
| U-NU2 | Vikram More | nu2.h360test@example.com | 9100000009 | `NURSE` | Nursing | _fill_ | Same | Same |
| U-ICU | Fatima Shaikh | icu.h360test@example.com | 9100000010 | `ICU_NURSE` | ICU | _fill_ | ICU nursing | Hospital config |
| U-PH1 | Deepak Rane | ph1.h360test@example.com | 9100000011 | `PHARMACIST` | Pharmacy | _fill_ | Rx requests, dispense, stock | Admit, hospital config, doctor notes write |
| U-PH2 | Sneha Kamble | ph2.h360test@example.com | 9100000012 | `PHARMACIST` | Pharmacy | _fill_ | Same | Same |
| U-LB1 | Ajay Chavan | lb1.h360test@example.com | 9100000013 | `LAB_TECHNICIAN` | Lab | _fill_ | Lab worklist, results | Admit, prescribe |
| U-LB2 | Priyanka Jadhav | lb2.h360test@example.com | 9100000014 | `LAB_TECHNICIAN` | Lab | _fill_ | Same | Same |
| U-RAD | Optional | rad.h360test@example.com | 9100000015 | `RADIOLOGY_TECHNICIAN` | Radiology | _fill_ | Optional Phase | — |
| U-OT | Optional | ot.h360test@example.com | 9100000016 | `OT_COORDINATOR` | OT | _fill_ | Optional Phase | — |

### Proxy roles (IAM not seeded)

| Requested title | Use account | Gap |
|-----------------|-------------|-----|
| Ward Manager | U-HA1 or U-NU1 | **NOT IMPLEMENTED** as role |
| Billing Executive / Cashier | U-RX1 (billing perms) or U-HA1 | **NOT IMPLEMENTED** |
| IPD Admission Executive | U-RX1 / U-HA1 | Use receptionist + IPD request perms |
| Medical Records / Support / Insurance-TPA | Skip or U-HA1 | **NOT IMPLEMENTED** |

---

## Patients

| ID | Name | Email / Login id | Mobile | Role | UHID | Password | Notes |
|----|------|------------------|--------|------|------|----------|-------|
| P1 | Rahul Sharma | rahul.sharma.h360qa@example.com | 9000000001 | `PATIENT` | _fill_ | _fill_ | Self-reg; may need email verify via logs |
| P2 | Priya Patil | **login = mobile** `9000000002` | 9000000002 | `PATIENT` | _fill_ | _temp from desk_ | Desk-created; never use stub `@patient.health360.local` |
| P3 | Amit Kulkarni | amit.kulkarni.h360qa@example.com | 9000000003 | `PATIENT` | _fill_ | _fill_ | Self-reg then IPD |

---

## Creation checklist

- [ ] Platform admin available  
- [ ] Hospital created; HA1 verified & logged in  
- [ ] All staff created under **Staff** with correct role + department  
- [ ] Doctors linked to hospital + schedules  
- [ ] P1/P3 self-registered  
- [ ] P2 desk-registered; mobile login verified  
- [ ] Each role login smoke once before RBAC matrix  
