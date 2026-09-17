package com.health360.insurance.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class InsuranceClaimResponse {
    UUID claimId;
    UUID policyId;
    UUID preAuthorizationId;
    UUID patientId;
    UUID encounterId;
    UUID admissionId;
    UUID invoiceId;
    String claimNumber;
    String status;
    BigDecimal claimedAmount;
    BigDecimal approvedAmount;
    BigDecimal settledAmount;
    String notes;
    Instant submittedAt;
    Instant decidedAt;
    Instant settledAt;
}
