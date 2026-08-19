package com.health360.radiology.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class ImagingStudyResponse {
    UUID studyId;
    UUID imagingOrderId;
    Instant scheduledAt;
    Instant performedAt;
    UUID performedBy;
    String notes;
}
