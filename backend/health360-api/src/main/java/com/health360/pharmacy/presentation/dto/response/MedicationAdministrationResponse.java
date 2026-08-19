package com.health360.pharmacy.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class MedicationAdministrationResponse {
    UUID administrationId;
    UUID medicationOrderItemId;
    UUID medicationOrderId;
    UUID encounterId;
    UUID patientId;
    String medicineName;
    String doseGiven;
    String route;
    Instant administeredAt;
    UUID administeredBy;
    String notes;
}
