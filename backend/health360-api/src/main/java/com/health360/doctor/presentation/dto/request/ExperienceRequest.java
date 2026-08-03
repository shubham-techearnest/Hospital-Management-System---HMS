package com.health360.doctor.presentation.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ExperienceRequest {

    @NotBlank
    @Size(max = 200)
    private String institution;

    @NotBlank
    @Size(max = 200)
    private String position;

    @Min(1950)
    @Max(2100)
    private int startYear;

    @Min(1950)
    @Max(2100)
    private Integer endYear;
}
