package com.health360.ipd.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class IpdDischargeOrderResponse {
    UUID orderId;
    UUID admissionId;
    Instant orderedAt;
    UUID orderedBy;
    String notes;
    String status;
}
