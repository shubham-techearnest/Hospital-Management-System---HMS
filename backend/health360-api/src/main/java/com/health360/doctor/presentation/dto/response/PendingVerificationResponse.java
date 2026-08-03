package com.health360.doctor.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class PendingVerificationResponse {
    UUID doctorId;
    UUID userId;
    String doctorName;
    String medicalRegistrationNumber;
    String verificationStatus;
    Instant submittedAt;
}
