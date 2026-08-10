package com.health360.hospital.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class AdminHospitalResponse {
    UUID id;
    String name;
    String registrationNumber;
    String hospitalType;
    String status;
    UUID adminUserId;
    String adminEmail;
    String adminName;
    int doctorCount;
    SubscriptionSummary subscription;
    Instant createdAt;
    Instant updatedAt;

    @Value
    @Builder
    public static class SubscriptionSummary {
        UUID subscriptionId;
        String planCode;
        String planName;
        String status;
    }
}
