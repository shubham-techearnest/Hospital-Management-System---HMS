package com.health360.hospital.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Value
@Builder
public class PagedPublicHospitalDoctorResponse {
    List<PublicHospitalDoctorSummary> content;
    int page;
    int size;
    long totalElements;
    int totalPages;

    @Value
    @Builder
    public static class PublicHospitalDoctorSummary {
        UUID doctorId;
        String name;
        String specialization;
        String department;
        BigDecimal averageRating;
        int reviewCount;
        Integer yearsExperience;
    }
}
