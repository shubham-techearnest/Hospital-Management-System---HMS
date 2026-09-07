package com.health360.org.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class PartnerLocationResponse {
    UUID locationId;
    UUID partnerOrgId;
    String name;
    String addressLine1;
    String city;
    String state;
    String pincode;
    String country;
    Double latitude;
    Double longitude;
    String phone;
    String email;
    boolean primaryLocation;
}
