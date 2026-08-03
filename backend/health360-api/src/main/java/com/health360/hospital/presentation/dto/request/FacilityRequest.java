package com.health360.hospital.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Value;

import java.util.UUID;

@Value
public class FacilityRequest {
    @NotBlank @Size(max = 200) String name;
    @NotBlank @Size(max = 30) String category;
    @Size(max = 2000) String description;
    UUID branchId;
    Boolean available;
}
