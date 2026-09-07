package com.health360.org.presentation.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class UpdatePartnerMembershipRequest {

    private UUID locationId;
    private String jobTitle;
    /** ACTIVE, INACTIVE, TERMINATED */
    private String employmentStatus;
}
