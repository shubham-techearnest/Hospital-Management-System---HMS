package com.health360.subscription.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class SubscriptionHistoryResponse {
    UUID id;
    UUID subscriptionId;
    String planCode;
    String planName;
    String previousPlanCode;
    String previousPlanName;
    String eventType;
    String status;
    String notes;
    Instant effectiveAt;
    UUID createdBy;
}
