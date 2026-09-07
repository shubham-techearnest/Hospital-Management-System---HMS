package com.health360.org.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdatePartnerOrgRequest {

    private String name;
    private String registrationNumber;
    /** ACTIVE or SUSPENDED */
    private String status;
}
