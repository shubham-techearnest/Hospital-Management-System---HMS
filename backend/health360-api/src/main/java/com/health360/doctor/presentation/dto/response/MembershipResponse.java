package com.health360.doctor.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class MembershipResponse {
    UUID id;
    String organization;
    String membershipId;
    Integer memberSince;
}
