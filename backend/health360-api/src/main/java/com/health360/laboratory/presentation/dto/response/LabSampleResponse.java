package com.health360.laboratory.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class LabSampleResponse {
    UUID sampleId;
    UUID labOrderId;
    String specimenId;
    Instant collectedAt;
    UUID collectedBy;
    String notes;
}
