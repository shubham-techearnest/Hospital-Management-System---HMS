package com.health360.ipd.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Map;

@Data
public class UpdateHospitalIpdServicesRequest {

    @Size(max = 40)
    private String presetCode;

    @NotBlank
    @Pattern(regexp = "^[A-Z]{2}$", message = "countryCode must be ISO-3166 alpha-2")
    private String countryCode = "IN";

    @NotNull
    private Map<String, Boolean> enabledServices;

    private Map<String, Object> countryConfig;
}
