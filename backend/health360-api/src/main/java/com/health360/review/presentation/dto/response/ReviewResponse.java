package com.health360.review.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class ReviewResponse {
    UUID id;
    int rating;
    String comment;
    String reviewerName;
    Instant createdAt;
}
