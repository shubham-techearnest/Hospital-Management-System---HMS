package com.health360.pharmacy.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Value
@Builder
public class MedicationOrderItemResponse {
    UUID orderItemId;
    UUID clinicalOrderItemId;
    UUID medicineId;
    String medicineName;
    String status;
    String doseText;
    String route;
    String frequency;
    Integer durationDays;
    String instructions;
    Instant plannedAt;
    Instant completedAt;
    List<MedicationAdministrationResponse> administrations;
}
