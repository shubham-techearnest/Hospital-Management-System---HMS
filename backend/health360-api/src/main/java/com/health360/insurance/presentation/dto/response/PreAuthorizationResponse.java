package com.health360.insurance.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class PreAuthorizationResponse {
    UUID preAuthorizationId;
    UUID policyId;
    UUID patientId;
    UUID encounterId;
    UUID admissionId;
    String authNumber;
    String authType;
    String status;
    BigDecimal requestedAmount;
    BigDecimal approvedAmount;
    String notes;
    String decisionNotes;
    Instant requestedAt;
    Instant decidedAt;
}
