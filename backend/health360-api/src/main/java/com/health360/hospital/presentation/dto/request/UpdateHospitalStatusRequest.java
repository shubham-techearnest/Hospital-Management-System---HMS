package com.health360.hospital.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UpdateHospitalStatusRequest {

    @NotBlank
    @Pattern(regexp = "ACTIVE|INACTIVE|SUSPENDED", message = "Invalid hospital status")
    private String status;
}
