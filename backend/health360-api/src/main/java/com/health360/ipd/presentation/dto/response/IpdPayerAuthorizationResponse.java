package com.health360.ipd.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class IpdPayerAuthorizationResponse {
    UUID authorizationId;
    UUID admissionId;
    UUID payerId;
    String authType;
    String status;
    String authNumber;
    BigDecimal approvedAmount;
    String notes;
    Instant requestedAt;
    Instant decidedAt;
}
