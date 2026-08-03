package com.health360.review.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class SubmitReviewResponse {
    UUID id;
    UUID appointmentId;
    int rating;
    String comment;
    Instant createdAt;
}
