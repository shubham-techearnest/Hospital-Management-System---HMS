package com.health360.clinical.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Value
@Builder
public class ClinicalTimelineItemResponse {
    String eventId;
    String eventType;
    String summary;
    Instant occurredAt;
    UUID encounterId;
    String encounterNumber;
    String referenceType;
    UUID referenceId;
    Map<String, Object> metadata;
}
