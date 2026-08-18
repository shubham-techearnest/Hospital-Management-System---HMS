package com.health360.clinical.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class DiagnosisResponse {
    UUID diagnosisId;
    UUID encounterId;
    String diagnosisCode;
    String diagnosisText;
    String diagnosisType;
    String notes;
    Instant recordedAt;
}
