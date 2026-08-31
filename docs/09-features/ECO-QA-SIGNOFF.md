# ECO-P0 through ECO-P7 — QA Sign-off (Automated + Manual)

| Document ID | ECO-QA-001 |
| **Updated** | 2026-08-31 |
| **OPD golden path** | `OpdWalkInGoldenPathIntegrationTest` (Docker) |

---

## OPD walk-in golden path (P2-F5 / P2-F9)

| Step | Automated | Manual UI |
|------|-----------|-----------|
| Reception walk-in register | `OpdWalkInGoldenPathIntegrationTest` | Reception → Walk-in tab |
| Staff scope auto-load | `StaffIntegrationTest` + `GET /staff/me/scope` | Reception dashboard shows hospital name |
| Vitals | Golden path test | Nursing or doctor encounter page |
| Doctor consult + finalize + Rx | Golden path + `BillingIntegrationTest` | Doctor OPD → Finish consultation |
| Reception clinical read | Golden path (notes/Rx GET as receptionist) | Checkout checklist turns green |
| Invoice + payment | Golden path + `BillingIntegrationTest` | Reception checkout → Issue invoice → CASH |

**Desk rule:** Reception must not “Complete” queue while doctor is in consult — doctor finishes from Doctor OPD. Checkout button appears when queue status is **Completed**.

---

## Phase sign-off

| Phase | Automated evidence | Status |
|-------|-------------------|--------|
| **ECO-P0** | `OpdIntegrationTest`, `OpdVisitStatusSyncServiceTest` | **PASSED** (automated) |
| **ECO-P1** | `HospitalPatientRegistryIntegrationTest`, `PlatformPatientLookupServiceTest` | **PASSED** (automated) |
| **ECO-P2** | `StructuredConsultationIntegrationTest`, wellness/timeline unit tests | **PASSED** (automated) |
| **ECO-P3** | `LabIntegrationTest` | **RELEASED** |
| **ECO-P4** | `PharmacyRequestServiceTest` | **RELEASED** |
| **ECO-P5** | `OpdRegistrationSelfCheckInTest` | **PASSED** (automated) |
| **ECO-P6** | `JourneyTimelineServiceTest` | **PASSED** (automated); manual timeline UI |
| **ECO-P7** | `PartnerNearbySearchServiceTest` | **PASSED** (automated); manual partner book/send |

---

## Remaining manual QA (ECO-P7)

1. Patient app: book lab at PathCare partner (`POST /lab/me/orders/{id}/book`)
2. Patient app: send Rx to MedPlus partner (`POST /pharmacy/me/prescriptions/{id}/send`)
3. Confirm hospital-default paths when `fulfill_partner_org_id` is null

---

## Run automated suite (requires Docker)

```powershell
cd backend\health360-api
mvn test -Dtest=OpdWalkInGoldenPathIntegrationTest,BillingIntegrationTest,OpdIntegrationTest,StaffIntegrationTest
```
