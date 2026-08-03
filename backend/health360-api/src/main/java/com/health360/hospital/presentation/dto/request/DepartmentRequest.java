package com.health360.hospital.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Value;

import java.util.UUID;

@Value
public class DepartmentRequest {
    @NotBlank @Size(max = 200) String name;
    @Size(max = 2000) String description;
    @Size(max = 20) String floor;
    UUID headDoctorId;
    Boolean active;
}
