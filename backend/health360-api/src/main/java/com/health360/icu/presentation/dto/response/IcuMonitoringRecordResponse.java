package com.health360.icu.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Value
@Builder
public class IcuMonitoringRecordResponse {
    UUID recordId;
    UUID stayId;
    UUID encounterId;
    String recordType;
    Map<String, Object> payload;
    String notes;
    Instant recordedAt;
    UUID recordedBy;
}
