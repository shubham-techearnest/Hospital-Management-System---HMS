package com.health360.org.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreatePartnerOrgRequest {

    @NotBlank
    private String orgType;

    @NotBlank
    private String name;

    private String registrationNumber;
}
