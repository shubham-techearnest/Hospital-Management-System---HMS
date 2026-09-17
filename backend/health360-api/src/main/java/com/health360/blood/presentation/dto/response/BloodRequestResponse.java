package com.health360.blood.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class BloodRequestResponse {
    UUID requestId;
    UUID hospitalId;
    UUID branchId;
    String requestNumber;
    UUID patientId;
    UUID encounterId;
    UUID admissionId;
    UUID ipdBloodRequestId;
    String productType;
    String bloodGroup;
    int unitsRequested;
    String urgency;
    String status;
    String indication;
    String notes;
    String decisionNotes;
    UUID unitId;
    String unitNumber;
    Instant requestedAt;
    Instant decidedAt;
    Instant issuedAt;
    Instant completedAt;
}
