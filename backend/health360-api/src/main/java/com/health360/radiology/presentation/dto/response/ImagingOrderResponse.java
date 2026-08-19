package com.health360.radiology.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class ImagingOrderResponse {
    UUID imagingOrderId;
    UUID clinicalOrderItemId;
    UUID clinicalOrderId;
    UUID encounterId;
    UUID patientId;
    UUID hospitalId;
    UUID branchId;
    UUID modalityId;
    String modalityCode;
    String modalityName;
    String modalityType;
    String status;
    Instant receivedAt;
    ImagingStudyResponse study;
    ImagingReportResponse report;
}
