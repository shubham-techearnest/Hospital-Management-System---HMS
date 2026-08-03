package com.health360.analytics.presentation.dto.response;

import com.health360.analytics.domain.ClassificationLevel;
import com.health360.analytics.domain.MetricType;
import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.util.List;

@Value
@Builder
public class MetricResponse {
    MetricType metricType;
    BigDecimal value;
    String unit;
    ClassificationLevel classification;
    String interpretation;
    List<String> missingFields;
    String displayValue;
    String disclaimer;
}
