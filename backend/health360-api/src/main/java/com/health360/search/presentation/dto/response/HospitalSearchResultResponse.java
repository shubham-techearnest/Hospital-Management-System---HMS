package com.health360.search.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.util.UUID;

@Value
@Builder
public class HospitalSearchResultResponse {
    UUID hospitalId;
    String name;
    String hospitalType;
    String city;
    String branchName;
    String addressLine1;
    BigDecimal averageRating;
    int reviewCount;
    boolean emergencyAvailable24x7;
    boolean icuAvailable;
    boolean ambulanceAvailable;
    BigDecimal distanceKm;
}
