package com.health360.radiology.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class ImagingReportResponse {
    UUID reportId;
    UUID imagingOrderId;
    UUID encounterId;
    String modalityName;
    String modalityCode;
    String modalityType;
    String findingsText;
    String impressionText;
    String status;
    Instant verifiedAt;
    Instant releasedAt;
}
