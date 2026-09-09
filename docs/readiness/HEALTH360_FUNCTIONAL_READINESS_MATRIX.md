# Health360 Functional Readiness Matrix

| Document | HEALTH360-MATRIX-001 |
| Date | 2026-09-09 |
| Companion | [HEALTH360_CURRENT_CAPABILITY_AUDIT.md](./HEALTH360_CURRENT_CAPABILITY_AUDIT.md) |

**Manual Testing Ready?** = whether this feature can be exercised in UAT with documented workarounds.

| Domain | Module | Feature | Required for E2E? | Impl % | Int % | UI | Backend | DB | Security | Known Issues | Gap Priority | Manual Testing Ready? |
|--------|--------|---------|-------------------|--------|-------|----|---------|----|----------|--------------|--------------|----------------------|
| Platform | Admin | Create hospital | Y | 95 | 95 | OK | OK | OK | OK | — | — | YES |
| Platform | Admin | Activate hospital | Y | 95 | 95 | OK | OK | OK | OK | — | — | YES |
| Platform | Tenant | Multi-tenant productization | N | 60 | 70 | Partial | OK | OK | OK | Single-tenant ops common | P2 | YES* |
| Platform | Auth | Login / JWT / refresh | Y | 95 | 95 | OK | OK | OK | OK | — | — | YES |
| Platform | Auth | Password reset / verify email | Y* | 85 | 70 | OK | OK | OK | OK | Email logged locally | P1 prod / P2 UAT | YES* |
| Platform | RBAC | Core clinical roles | Y | 90 | 90 | OK | OK | OK | OK | Niche roles missing | P2 | YES |
| Hospital | Setup | Depts / staff / doctors | Y | 90 | 90 | OK | OK | OK | OK | Setup effort | — | YES |
| Hospital | Setup | Schedules / slots | Y | 85 | 85 | OK | OK | OK | OK | Leave edge cases | P2 | YES |
| Hospital | Setup | Ward/bed | Y | 90 | 90 | OK | OK | OK | Hospital-scoped | Concurrent assign UAT | P2 | YES |
| Hospital | Setup | Lab/Pharmacy catalogs | Y | 85 | 85 | OK | OK | OK | OK | — | — | YES |
| Patient | Registry | Self-reg + UHID | Y | 95 | 95 | OK | OK | OK | OK | — | — | YES |
| Patient | Registry | Desk register + mobile login | Y | 95 | 95 | OK | OK | OK | OK | Stub email hidden | — | YES |
| Patient | Search | UHID/mobile/name | Y | 90 | 90 | OK | OK | OK | OK | Soft duplicates | P2 | YES |
| Patient | Portal | Appointments/OPD/Rx/lab/bills/IPD | Y | 85 | 85 | OK | OK | OK | Patient-scoped | — | — | YES |
| Appointments | Booking | Search→doctor→slot | Y | 90 | 90 | OK | OK | OK | OK | — | — | YES |
| Appointments | Lifecycle | Cancel/reschedule/check-in | Y | 85 | 85 | OK | OK | OK | OK | — | — | YES |
| OPD | Walk-in | Register→queue→consult | Y | 95 | 95 | OK | OK | OK | OK | Strongest path | — | YES |
| OPD | Appointment-linked | Arrival conversion | Y | 90 | 90 | OK | OK | OK | OK | — | — | YES |
| Queue | Token ops | Call/skip/recall | Y | 90 | 90 | OK | OK | OK | OK | Not true websocket RT | P3 | YES |
| Clinical | Consultation | Diagnosis/notes/vitals | Y | 90 | 90 | OK | OK | OK | Doctor-scoped | — | — | YES |
| Clinical | Prescription | e-Rx | Y | 90 | 90 | OK | OK | OK | OK | — | — | YES |
| Lab | Clinical loop | Order→result→visibility | Y | 90 | 90 | OK | OK | OK | OK | — | — | YES |
| Lab | Billing | Auto invoice lines | Y* | 20 | 10 | N/A | Enum only | OK | N/A | DISCONNECTED | P1 | YES* (manual bill) |
| Pharmacy | Dispense | Rx→stock | Y | 85 | 85 | OK | OK | OK | OK | — | — | YES |
| Pharmacy | Billing | Auto invoice lines | Y* | 20 | 10 | N/A | Enum only | OK | N/A | DISCONNECTED | P1 | YES* (manual bill) |
| Billing | OPD checkout | Encounter invoice/pay | Y | 85 | 80 | OK | OK | OK | OK | Tax depth limited | P2 | YES |
| Billing | IPD | Charges/clearance | Y | 80 | 75 | OK | OK | OK | OK | TPA EDI stub | P2 | YES |
| IPD | Admission | Request→admit→bed | Y | 85 | 80 | OK | OK | V80+ | OK | Enterprise UAT pending | P1 UAT | YES |
| IPD | Care | Chart/nursing/MAR/lab | Y | 80 | 75 | OK | OK | V82+ | Role split | Placeholders in chart | P2 | YES |
| IPD | Transfer | Bed/ward/ICU | Y | 80 | 75 | OK | OK | V83 | OK | Blood stub | P2 | YES |
| IPD | Discharge | Clearance→summary→release | Y | 80 | 75 | OK | OK | V85–86 | OK | PDF deferred | P2 | YES |
| Nursing | Ward ops | List/vitals/MAR | Y | 80 | 75 | OK | OK | OK | NURSE | Mobile RN deferred | P3 | YES |
| Security | Isolation | Hospital + patient | Y | 80 | 80 | Guards | Scope services | tenantId | Architecture OK | Formal audit deferred | P1 audit | YES* |
| Notifications | Channels | In-app vs email/SMS | Partial | 70 | 40 | OK | Mock gateways | OK | OK | Local email/SMS | P2 UAT | YES* |

\*Workaround or non-blocking for local/manual simulation.

### Aggregate readiness (evidence-based)

| Area | Score |
|------|------:|
| Platform Foundation | 88% |
| Hospital Management | 90% |
| User/Staff Management | 88% |
| RBAC | 87% |
| Patient Management | 90% |
| Doctors | 88% |
| Appointments | 88% |
| Queue | 90% |
| OPD | 93% |
| Prescription | 90% |
| Lab (clinical) | 90% |
| Lab (billing integration) | 25% |
| Pharmacy (clinical) | 85% |
| Pharmacy (billing integration) | 25% |
| Billing (OPD/IPD core) | 80% |
| IPD | 78% |
| Ward/Bed | 85% |
| Nursing | 78% |
| Discharge | 78% |
| Patient Portal | 85% |
| Security (architecture) | 80% |
| Cross-Module Integration | 82% |
| **Overall E2E Readiness** | **84%** |
