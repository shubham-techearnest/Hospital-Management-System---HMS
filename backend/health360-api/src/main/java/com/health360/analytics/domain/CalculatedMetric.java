package com.health360.analytics.domain;

import java.math.BigDecimal;
import java.util.List;

public record CalculatedMetric(
        MetricType metricType,
        BigDecimal value,
        String unit,
        ClassificationLevel classification,
        String interpretation,
        List<String> missingFields,
        String displayValue
) {
    public static CalculatedMetric insufficient(MetricType type, List<String> missingFields) {
        return new CalculatedMetric(type, null, null, ClassificationLevel.INSUFFICIENT_DATA,
                null, missingFields, null);
    }
}
