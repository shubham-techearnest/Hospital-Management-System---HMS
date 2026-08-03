package com.health360.doctor.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Value
@Builder
public class PublicDoctorProfileResponse {
    UUID id;
    String name;
    String title;
    boolean verified;
    String specialization;
    BigDecimal averageRating;
    int reviewCount;
    String gender;
    String biography;
    String profilePhotoUrl;
    Integer yearsExperience;
    List<String> languages;
    List<QualificationResponse> qualifications;
    List<AwardResponse> awards;
    List<MembershipResponse> memberships;
    List<HospitalPracticeResponse> hospitals;
    AvailabilityPreview availabilityPreview;

    @Value
    @Builder
    public static class HospitalPracticeResponse {
        UUID hospitalId;
        String hospitalName;
        UUID branchId;
        String branchName;
        String city;
        List<ConsultationDefaultResponse> consultationFees;
    }

    @Value
    @Builder
    public static class AvailabilityPreview {
        boolean availableToday;
        int availableSlotsNext7Days;
    }
}
