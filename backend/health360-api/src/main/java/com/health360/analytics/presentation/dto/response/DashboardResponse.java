package com.health360.analytics.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.List;

@Value
@Builder
public class DashboardResponse {
    int completionScore;
    ScoreSummary wellnessScore;
    ScoreSummary healthRiskScore;
    List<MetricResponse> metrics;
    List<GoalProgressResponse> goalsProgress;
    List<VitalsTrendSeriesResponse> recentVitalsTrend;
    List<TimelineEventResponse> recentTimeline;
    String disclaimer;
    Instant calculatedAt;

    @Value
    @Builder
    public static class ScoreSummary {
        Integer score;
        String label;
    }
}
