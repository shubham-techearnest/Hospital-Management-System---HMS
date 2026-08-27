# ECO-P4 — Pharmacy e-Rx share (hospital-first)

| Feature ID | ECO-P4 |
| Status | **RELEASED** |
| Updated | 2026-08-27 |

## Delivered

| ID | Work | Result |
|----|------|--------|
| ECO-F4.1 | Patient send signed Rx to hospital pharmacy | `POST /pharmacy/me/prescriptions/{id}/send-hospital` + Prescriptions page CTA |
| ECO-F4.2 | Pharmacy request lifecycle | `REQUESTED → RECEIVED → UNDER_REVIEW → READY → DISPENSED` (V58) |
| ECO-F4.3 | Pharmacist fulfill + patient visibility | Dashboard **e-Rx share** tab; patient status chips; `PHARMACY_MEDICINE_READY` notify |
| ECO-F4.4 | Partial fill | Deferred (statuses reserved in CHECK; items remain PENDING→AVAILABLE→DISPENSED) |

## APIs

- `GET /api/v1/pharmacy/me/requests`
- `POST /api/v1/pharmacy/me/prescriptions/{prescriptionId}/send-hospital`
- `GET /api/v1/pharmacy/requests?hospitalId&branchId&status=`
- `POST .../requests/{id}/receive|review|ready|dispense`

## Rules

- Only **SIGNED** prescriptions
- Request status is separate from Rx status and from MAR `medication_orders`
- Hospital-first (`hospital_id` / `branch_id` from prescription)
- Independent retail pharmacy network → ECO-P7

## QA (2026-08-27)

| Check | Evidence |
|-------|----------|
| Send signed Rx | `PharmacyRequestServiceTest.sendHospitalCreatesRequestForSignedPrescription` |
| Reject draft | `sendHospitalRejectsDraftPrescription` |
| Receive transition | `receiveTransitionsRequestedToReceived` |
| Ready + notify | `markReadyNotifiesPatient` |
| Invalid transition | `receiveRejectsInvalidStatus` |
| Main compile | `mvn -DskipTests compile` OK |

**Exit met:** Signed e-Rx → hospital pharmacy request → medicines ready notify → dispensed path.

**Next:** ECO-P5 (check-in & notifications).
