package com.health360.analytics.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Value
@Builder
public class VitalsTrendSeriesResponse {
    String seriesType;
    String unit;
    List<TrendPoint> points;

    @Value
    @Builder
    public static class TrendPoint {
        Instant recordedAt;
        BigDecimal value;
    }
}
