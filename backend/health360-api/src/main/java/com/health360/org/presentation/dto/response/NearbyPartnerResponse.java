package com.health360.org.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.util.UUID;

@Value
@Builder
public class NearbyPartnerResponse {
    UUID partnerOrgId;
    String name;
    String orgType;
    UUID locationId;
    String locationName;
    String addressLine1;
    String city;
    String state;
    String pincode;
    BigDecimal distanceKm;
    boolean inNetwork;
    String phone;
}
