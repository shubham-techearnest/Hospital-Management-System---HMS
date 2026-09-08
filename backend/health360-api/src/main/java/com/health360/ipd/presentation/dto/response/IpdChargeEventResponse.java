package com.health360.ipd.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Value
@Builder
public class IpdChargeEventResponse {
    UUID chargeEventId;
    UUID admissionId;
    UUID encounterId;
    String chargeType;
    String description;
    BigDecimal quantity;
    BigDecimal unitPrice;
    BigDecimal amount;
    LocalDate serviceDate;
    String status;
    UUID invoiceId;
    UUID invoiceLineId;
    String notes;
    Instant createdAt;
}
