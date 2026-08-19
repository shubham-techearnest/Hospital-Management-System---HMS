package com.health360.laboratory.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class LabWorklistItemResponse {
    UUID clinicalOrderItemId;
    UUID clinicalOrderId;
    UUID encounterId;
    UUID patientId;
    String orderNumber;
    String itemName;
    String itemCode;
    UUID labTestId;
    Instant orderedAt;
}
