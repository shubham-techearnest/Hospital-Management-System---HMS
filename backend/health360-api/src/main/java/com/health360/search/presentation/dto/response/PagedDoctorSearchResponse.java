package com.health360.search.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class PagedDoctorSearchResponse {
    List<DoctorSearchResultResponse> content;
    int page;
    int size;
    long totalElements;
    int totalPages;
}
