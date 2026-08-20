# Mobile Screen Plan — HMS Staff Expansion

| Document ID | MOB-PLAN-001 |
| Status | DRAFT |

Stack: Expo 52, React Native, React Navigation 7. **No Flutter rewrite.**

---

## Role-based experiences

| Role | Priority | Screens (target) |
|------|----------|------------------|
| Doctor | P0 | IPD patient list, round notes, vitals view, Rx sign |
| Nurse | P0 | Vitals capture, nursing assessment, MAR |
| Lab Technician | P1 | Worklist, sample collect, barcode scan |
| Pharmacist | P1 | Dispense queue, partial dispense |
| Receptionist | P2 | Quick search (deferred Sprint 1) |
| Patient | Existing | Appointments, records (consumer) |

---

## Navigation structure

```text
App
├── AuthStack
├── PatientTabs (existing)
└── StaffStack (role-gated)
    ├── DoctorStack
    ├── NurseStack
    ├── LabStack
    └── PharmacyStack
```

---

## Sprint allocation

| Sprint | Mobile scope |
|--------|--------------|
| 1 | **Deferred** (P1-F1 web only) |
| 13–15 | Nurse vitals, MAR |
| 14 | Doctor IPD rounds |
| 8 | Lab sample workflow |
| 10 | Pharmacy dispense |

---

## Offline (Phase 4+)

- Nurse vitals: queue locally, sync on reconnect
- Conflict: server wins with audit of rejected client payload
- No offline for billing/payments

---

## Security

- Secure token storage (existing)
- Biometric optional for staff re-auth
- Screenshot block on clinical screens (platform permitting)

Per-screen specs added in feature packages when mobile in scope.
