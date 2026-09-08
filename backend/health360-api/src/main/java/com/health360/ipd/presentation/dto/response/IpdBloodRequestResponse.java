package com.health360.ipd.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class IpdBloodRequestResponse {
    UUID bloodRequestId;
    UUID admissionId;
    UUID encounterId;
    String productType;
    int units;
    String urgency;
    String indication;
    String status;
    String notes;
    Instant requestedAt;
    UUID requestedBy;
}
