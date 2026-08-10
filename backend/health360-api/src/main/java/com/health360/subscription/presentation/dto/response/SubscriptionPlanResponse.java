package com.health360.subscription.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Value
@Builder
public class SubscriptionPlanResponse {
    UUID id;
    String code;
    String name;
    String description;
    BigDecimal price;
    String currency;
    String billingCycle;
    String status;
    Integer trialDays;
    List<PlanLimitResponse> limits;
    List<PlanFeatureResponse> features;
    Instant createdAt;
    Instant updatedAt;

    @Value
    @Builder
    public static class PlanLimitResponse {
        String limitKey;
        long limitValue;
    }

    @Value
    @Builder
    public static class PlanFeatureResponse {
        String featureKey;
        boolean enabled;
    }
}
