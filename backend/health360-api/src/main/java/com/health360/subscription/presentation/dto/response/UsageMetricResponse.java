package com.health360.subscription.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class UsageMetricResponse {
    long used;
    long limit;
    long remaining;
}
