package com.health360.analytics.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;

@Value
@Builder
public class GoalProgressResponse {
    String goalType;
    String label;
    BigDecimal currentValue;
    BigDecimal targetValue;
    String unit;
    Integer progressPercent;
}
