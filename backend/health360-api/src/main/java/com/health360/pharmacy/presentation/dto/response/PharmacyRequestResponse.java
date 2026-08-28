package com.health360.pharmacy.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Value
@Builder
public class PharmacyRequestResponse {
    UUID pharmacyRequestId;
    String requestNumber;
    UUID prescriptionId;
    String prescriptionNumber;
    UUID encounterId;
    UUID patientId;
    String patientName;
    String uhid;
    UUID hospitalId;
    UUID branchId;
    String status;
    Instant requestedAt;
    Instant receivedAt;
    Instant underReviewAt;
    Instant readyAt;
    Instant dispensedAt;
    UUID dispensedBy;
    String pharmacistNotes;
    boolean canSendHospital;
    UUID fulfillPartnerOrgId;
    UUID fulfillLocationId;
    List<PharmacyRequestItemResponse> items;
}
