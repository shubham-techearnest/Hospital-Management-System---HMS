package com.health360.search.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Value
@Builder
public class DoctorSearchResultResponse {
    UUID doctorId;
    String name;
    String specialization;
    UUID hospitalId;
    String hospitalName;
    UUID branchId;
    String branchName;
    String city;
    String gender;
    Integer yearsExperience;
    List<String> languages;
    List<String> consultationModes;
    boolean availableToday;
    BigDecimal averageRating;
    int reviewCount;
    BigDecimal distanceKm;
    BigDecimal minConsultationFee;
    String feeCurrency;
}
