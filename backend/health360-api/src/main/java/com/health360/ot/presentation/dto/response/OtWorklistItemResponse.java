package com.health360.ot.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class OtWorklistItemResponse {
    UUID clinicalOrderItemId;
    UUID clinicalOrderId;
    UUID encounterId;
    UUID patientId;
    String orderNumber;
    String itemName;
    String itemCode;
    Instant orderedAt;
}
