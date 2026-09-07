package com.health360.org.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class HospitalPartnerLinkResponse {
    UUID linkId;
    UUID hospitalId;
    UUID partnerOrgId;
    String linkType;
    String status;
}
