package com.health360.review.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class PagedReviewResponse {
    List<ReviewResponse> content;
    int page;
    int size;
    long totalElements;
    int totalPages;
}
