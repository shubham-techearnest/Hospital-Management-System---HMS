package com.health360.search.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class UnifiedSearchResponse {
    List<DoctorSearchResultResponse> doctors;
    List<HospitalSearchResultResponse> hospitals;
    int doctorCount;
    int hospitalCount;
    int page;
    int size;
}
