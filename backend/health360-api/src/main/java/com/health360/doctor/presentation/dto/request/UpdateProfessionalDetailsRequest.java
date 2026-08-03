package com.health360.doctor.presentation.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateProfessionalDetailsRequest {

    @NotBlank
    @Size(max = 10)
    private String title;

    @Size(max = 100)
    private String medicalRegistrationNumber;

    @Size(max = 200)
    private String registrationCouncil;

    @Min(1950)
    @Max(2100)
    private Integer registrationYear;

    private LocalDate registrationExpiry;

    @Size(max = 30)
    private String gender;

    @Min(0)
    @Max(60)
    private Integer totalYearsExperience;
}
