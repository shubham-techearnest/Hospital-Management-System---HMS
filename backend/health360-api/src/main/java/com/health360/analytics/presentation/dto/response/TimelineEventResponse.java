package com.health360.analytics.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class TimelineEventResponse {
    String eventType;
    String title;
    String description;
    Instant occurredAt;
    UUID referenceId;
}
