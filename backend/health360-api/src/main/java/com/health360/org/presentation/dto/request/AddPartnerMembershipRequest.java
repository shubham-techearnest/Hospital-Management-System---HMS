package com.health360.org.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class AddPartnerMembershipRequest {

    @NotNull
    private UUID userId;

    private UUID locationId;

    private String jobTitle;

    /** ACTIVE, INACTIVE, TERMINATED — defaults ACTIVE */
    private String employmentStatus;
}
