package com.health360.doctor.presentation.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AwardRequest {

    @NotBlank
    @Size(max = 200)
    private String title;

    @Size(max = 200)
    private String organization;

    @Min(1900)
    @Max(2100)
    private Integer awardYear;
}
