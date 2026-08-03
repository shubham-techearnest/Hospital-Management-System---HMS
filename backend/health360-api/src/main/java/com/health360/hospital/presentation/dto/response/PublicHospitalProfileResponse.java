package com.health360.hospital.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Value
@Builder
public class PublicHospitalProfileResponse {
    UUID id;
    String name;
    String hospitalType;
    Integer establishedYear;
    Integer totalBedCount;
    String accreditation;
    String description;
    BigDecimal averageRating;
    int reviewCount;
    EmergencyInfo emergencyInfo;
    List<BranchResponse> branches;
    List<DepartmentResponse> departments;
    List<FacilityResponse> facilities;
    List<GalleryImageResponse> gallery;
    List<PublicHospitalDoctorSummary> featuredDoctors;

    @Value
    @Builder
    public static class EmergencyInfo {
        boolean emergencyAvailable24x7;
        String emergencyPhone;
        boolean ambulanceAvailable;
        boolean icuAvailable;
        Integer icuBedCount;
        String icuType;
    }

    @Value
    @Builder
    public static class PublicHospitalDoctorSummary {
        UUID doctorId;
        String name;
        String specialization;
        BigDecimal averageRating;
        int reviewCount;
    }
}
