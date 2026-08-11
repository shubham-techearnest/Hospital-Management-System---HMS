package com.health360.shared.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Value
@Builder
public class AuditLogResponse {
    UUID id;
    UUID tenantId;
    UUID userId;
    String action;
    String entityType;
    UUID entityId;
    Map<String, Object> oldValue;
    Map<String, Object> newValue;
    String ipAddress;
    Instant occurredAt;
}
