package com.health360.patient.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Value
@Builder
public class HealthTimelineEventResponse {
    UUID id;
    String eventType;
    String summary;
    Map<String, Object> metadata;
    String referenceType;
    UUID referenceId;
    Instant occurredAt;
}
