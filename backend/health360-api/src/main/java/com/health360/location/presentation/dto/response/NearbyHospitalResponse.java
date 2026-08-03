package com.health360.location.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.util.UUID;

@Value
@Builder
public class NearbyHospitalResponse {
    UUID hospitalId;
    String hospitalName;
    String hospitalType;
    UUID branchId;
    String branchName;
    String city;
    String addressLine1;
    BigDecimal distanceKm;
    BigDecimal averageRating;
    int reviewCount;
    boolean emergencyAvailable24x7;
    boolean icuAvailable;
    boolean ambulanceAvailable;
}
