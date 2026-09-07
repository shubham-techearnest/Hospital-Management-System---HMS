package com.health360.org.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.List;
import java.util.UUID;

@Value
@Builder
public class PartnerOrgResponse {
    UUID partnerOrgId;
    String orgType;
    String name;
    String registrationNumber;
    String status;
    List<PartnerLocationResponse> locations;
    int hospitalLinkCount;
}
