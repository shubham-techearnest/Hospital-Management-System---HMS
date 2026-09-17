package com.health360.billing.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class ChargePostingResponse {
    UUID id;
    UUID hospitalId;
    UUID branchId;
    UUID patientId;
    UUID encounterId;
    String catalogCode;
    String description;
    BigDecimal quantity;
    BigDecimal unitPrice;
    BigDecimal lineTotal;
    String currency;
    String status;
    String mode;
    String sourceEventType;
    UUID sourceEventId;
    Instant createdAt;
}
