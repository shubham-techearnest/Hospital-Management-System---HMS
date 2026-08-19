package com.health360.pharmacy.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class MedicationWorklistItemResponse {
    UUID clinicalOrderId;
    UUID encounterId;
    UUID patientId;
    String orderNumber;
    Instant orderedAt;
    int itemCount;
}
