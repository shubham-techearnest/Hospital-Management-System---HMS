# P2-F4 docs (01–14 summary)

**BR:** Encounter-scoped e-Rx separate from pharmacy MAR/fulfillment.

**Stories:** US-RX-001 draft prescription with line items; US-RX-002 sign (immutable); US-RX-003 patient views signed Rx.

**FR:** RX-REQ-001..003 — link to encounter; sign/immutability; safety warning field (stub).

**Workflow:** Consultation → Add Rx lines → Save draft → Sign → Patient can view.

**Architecture:** ADR-005 — `clinical.prescriptions` ≠ `pharmacy.medication_orders`.

**DB V48:** `clinical.prescriptions`, `clinical.prescription_items`; permissions `clinical:prescription:read|write|sign`.

**API:**
- `POST/GET /clinical/encounters/{id}/prescriptions`
- `PUT /clinical/encounters/{id}/prescriptions/{rxId}` (DRAFT)
- `POST .../prescriptions/{rxId}/sign`
- `GET /clinical/prescriptions/me` (patient signed)

**Audit:** PRESCRIPTION_CREATED, PRESCRIPTION_UPDATED, PRESCRIPTION_SIGNED.

**Test:** `EPrescriptionIntegrationTest`.
