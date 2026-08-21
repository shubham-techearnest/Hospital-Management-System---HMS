package com.health360.clinical.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Value
@Builder
public class PrescriptionResponse {
    UUID prescriptionId;
    UUID encounterId;
    UUID patientId;
    UUID hospitalId;
    UUID branchId;
    String prescriptionNumber;
    String status;
    String notes;
    UUID prescribedBy;
    Instant signedAt;
    Instant createdAt;
    List<Item> items;

    @Value
    @Builder
    public static class Item {
        UUID itemId;
        UUID medicineId;
        String medicineCode;
        String medicineName;
        String doseText;
        String route;
        String frequency;
        Integer durationDays;
        Integer quantity;
        String instructions;
        String safetyWarning;
        Integer sortOrder;
    }
}
