package com.health360.radiology.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class ImagingWorklistItemResponse {
    UUID clinicalOrderItemId;
    UUID clinicalOrderId;
    UUID encounterId;
    UUID patientId;
    String orderNumber;
    String itemName;
    String itemCode;
    UUID modalityId;
    Instant orderedAt;
}
