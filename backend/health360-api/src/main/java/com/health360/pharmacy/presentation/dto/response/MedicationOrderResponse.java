package com.health360.pharmacy.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Value
@Builder
public class MedicationOrderResponse {
    UUID medicationOrderId;
    UUID clinicalOrderId;
    UUID encounterId;
    UUID patientId;
    UUID hospitalId;
    UUID branchId;
    String status;
    Instant receivedAt;
    Instant verifiedAt;
    UUID verifiedBy;
    Instant completedAt;
    List<MedicationOrderItemResponse> items;
}
