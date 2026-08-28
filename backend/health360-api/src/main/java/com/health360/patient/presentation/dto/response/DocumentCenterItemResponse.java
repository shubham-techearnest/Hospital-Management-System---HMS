package com.health360.patient.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class DocumentCenterItemResponse {
    String itemId;
    String source;
    String category;
    String title;
    String description;
    Instant occurredAt;
    UUID referenceId;
    String deepLink;
    boolean downloadable;
}
