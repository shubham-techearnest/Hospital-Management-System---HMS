package com.health360.location.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class PagedNearbyHospitalResponse {
    List<NearbyHospitalResponse> content;
    int page;
    int size;
    int totalElements;
    int totalPages;
}
