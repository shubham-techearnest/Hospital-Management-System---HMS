package com.health360.org.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class LinkHospitalPartnerRequest {

    @NotNull
    private UUID hospitalId;

    /** IN_NETWORK or PREFERRED */
    private String linkType = "IN_NETWORK";
}
