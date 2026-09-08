package com.health360.ipd.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class IpdAdmissionPayerResponse {
    UUID payerId;
    UUID admissionId;
    String payerMode;
    String payerName;
    String policyNumber;
    String memberId;
    String claimMode;
    boolean primaryPayer;
    String notes;
    Instant createdAt;
}
