package com.health360.subscription.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@Value
@Builder
public class HospitalSubscriptionResponse {

    String status;
    LocalDate startDate;
    LocalDate endDate;
    boolean autoRenew;
    PlanSummary plan;
    Map<String, UsageMetricResponse> usage;
    Map<String, Boolean> features;

    @Value
    @Builder
    public static class PlanSummary {
        UUID id;
        String code;
        String name;
        String description;
        BigDecimal price;
        String currency;
        String billingCycle;
    }
}
