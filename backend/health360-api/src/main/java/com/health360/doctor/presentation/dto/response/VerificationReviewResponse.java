package com.health360.doctor.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Value
@Builder
public class VerificationReviewResponse {
    UUID doctorId;
    UUID userId;
    String doctorName;
    String email;
    String verificationStatus;
    Instant submittedAt;
    String rejectionReason;
    DoctorProfileResponse profile;
    List<VerificationDocumentResponse> documents;
}
