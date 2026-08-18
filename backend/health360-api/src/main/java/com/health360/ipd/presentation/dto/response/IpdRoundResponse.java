package com.health360.ipd.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class IpdRoundResponse {
    UUID roundId;
    UUID admissionId;
    UUID encounterId;
    String roundType;
    String notes;
    Instant recordedAt;
    UUID recordedBy;
}
