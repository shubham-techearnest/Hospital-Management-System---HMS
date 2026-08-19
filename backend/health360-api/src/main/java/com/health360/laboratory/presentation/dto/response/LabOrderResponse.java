package com.health360.laboratory.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Value
@Builder
public class LabOrderResponse {
    UUID labOrderId;
    UUID clinicalOrderItemId;
    UUID clinicalOrderId;
    UUID encounterId;
    UUID patientId;
    UUID hospitalId;
    UUID branchId;
    UUID labTestId;
    String testCode;
    String testName;
    String status;
    Instant receivedAt;
    LabSampleResponse sample;
    List<LabResultResponse> results;
    LabReportResponse report;
}
