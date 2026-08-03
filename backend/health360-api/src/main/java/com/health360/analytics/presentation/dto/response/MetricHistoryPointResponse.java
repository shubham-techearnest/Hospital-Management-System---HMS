package com.health360.analytics.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.Instant;

@Value
@Builder
public class MetricHistoryPointResponse {
    Instant recordedAt;
    BigDecimal value;
    String unit;
    String displayValue;
}
