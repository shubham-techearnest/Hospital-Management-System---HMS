package com.health360.patient.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Value
@Builder
public class JourneyTimelineItemResponse {
    String eventId;
    String domain;
    String eventType;
    String summary;
    Instant occurredAt;
    UUID encounterId;
    String referenceType;
    UUID referenceId;
    String deepLink;
    Map<String, Object> metadata;
}
