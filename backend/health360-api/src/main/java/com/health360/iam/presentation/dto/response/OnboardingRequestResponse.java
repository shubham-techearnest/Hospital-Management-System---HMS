package com.health360.iam.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class OnboardingRequestResponse {
    UUID id;
    String requestType;
    String status;
    String organizationName;
    String contactName;
    String email;
    String phone;
    String city;
    String specialty;
    String message;
    String adminNotes;
    Instant createdAt;
    Instant reviewedAt;
}
