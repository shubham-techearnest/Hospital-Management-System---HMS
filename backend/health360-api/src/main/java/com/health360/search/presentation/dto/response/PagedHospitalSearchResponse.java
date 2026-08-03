package com.health360.search.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class PagedHospitalSearchResponse {
    List<HospitalSearchResultResponse> content;
    int page;
    int size;
    int totalElements;
    int totalPages;
}
