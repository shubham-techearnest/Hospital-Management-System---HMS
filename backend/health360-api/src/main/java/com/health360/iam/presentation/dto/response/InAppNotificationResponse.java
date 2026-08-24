package com.health360.iam.presentation.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class InAppNotificationResponse {
    UUID id;
    String title;
    String message;
    String notificationType;
    @JsonProperty("isRead")
    boolean read;
    Instant createdAt;
    String referenceType;
    UUID referenceId;
}
