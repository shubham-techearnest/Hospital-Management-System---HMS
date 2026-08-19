package com.health360.laboratory.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Value
@Builder
public class LabReportResponse {
    UUID reportId;
    UUID labOrderId;
    UUID encounterId;
    String testName;
    String testCode;
    String summaryText;
    Instant releasedAt;
    List<LabResultResponse> results;
}
