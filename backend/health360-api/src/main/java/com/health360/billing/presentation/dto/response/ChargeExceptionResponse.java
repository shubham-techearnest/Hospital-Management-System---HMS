package com.health360.billing.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class ChargeExceptionResponse {
    UUID id;
    UUID hospitalId;
    UUID branchId;
    UUID patientId;
    UUID encounterId;
    String sourceEventType;
    UUID sourceEventId;
    String reasonCode;
    String message;
    String status;
    Instant createdAt;
    Instant resolvedAt;
    UUID resolvedBy;
}
