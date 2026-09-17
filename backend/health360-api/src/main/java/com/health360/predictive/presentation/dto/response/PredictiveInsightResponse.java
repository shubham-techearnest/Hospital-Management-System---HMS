package com.health360.predictive.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Value
@Builder
public class PredictiveInsightResponse {
    UUID insightId;
    UUID hospitalId;
    UUID branchId;
    String insightType;
    String severity;
    String title;
    String message;
    int score;
    String status;
    Map<String, Object> payload;
    Instant generatedAt;
    Instant expiresAt;
}
