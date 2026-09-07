package com.health360.org.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreatePartnerLocationRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String addressLine1;

    private String addressLine2;

    @NotBlank
    private String city;

    @NotBlank
    private String state;

    @NotBlank
    private String pincode;

    private String country = "India";

    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;

    private String phone;
    private String email;
    private Boolean primaryLocation;
}
