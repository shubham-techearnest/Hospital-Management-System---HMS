package com.health360.hospital.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Value;

@Value
public class CreateHospitalProfileRequest {
    @NotBlank @Size(max = 300) String name;
    @NotBlank @Size(max = 100) String registrationNumber;
    @NotBlank String hospitalType;
    Integer establishedYear;
    Integer totalBedCount;
    String accreditation;
    @Size(max = 5000) String description;
}
