package com.health360.analytics.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Value
@Builder
public class SnapshotResponse {
    UUID id;
    Instant calculatedAt;
    int profileCompletionAtCalc;
    DashboardResponse.ScoreSummary wellnessScore;
    DashboardResponse.ScoreSummary healthRiskScore;
    Map<String, Object> wellnessFactors;
    Map<String, Object> riskFactors;
    List<MetricResponse> metrics;
    String disclaimer;
}
