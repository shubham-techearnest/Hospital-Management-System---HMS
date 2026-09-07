package com.health360.org.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class PartnerMembershipResponse {
    UUID membershipId;
    UUID partnerOrgId;
    UUID userId;
    String userEmail;
    String userName;
    UUID locationId;
    String jobTitle;
    String employmentStatus;
    Instant hiredAt;
}
