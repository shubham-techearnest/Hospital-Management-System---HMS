package com.health360.ipd.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Value
@Builder
public class MedicationReconciliationResponse {
    UUID reconciliationId;
    UUID admissionId;
    UUID encounterId;
    String reconType;
    String status;
    String summaryText;
    List<Map<String, Object>> decisions;
    Instant completedAt;
    UUID completedBy;
}
