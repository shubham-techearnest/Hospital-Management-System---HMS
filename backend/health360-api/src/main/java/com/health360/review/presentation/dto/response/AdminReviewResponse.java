package com.health360.review.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class AdminReviewResponse {
    UUID id;
    String reviewType;
    UUID targetId;
    UUID patientId;
    UUID appointmentId;
    int rating;
    String comment;
    boolean visible;
    Instant createdAt;
    Instant moderatedAt;
}
