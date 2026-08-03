package com.health360.doctor.presentation.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class QualificationRequest {

    @NotBlank
    @Size(max = 200)
    private String degree;

    @NotBlank
    @Size(max = 200)
    private String institution;

    @Min(1950)
    @Max(2100)
    private int yearOfCompletion;

    @Size(min = 2, max = 2)
    private String country = "IN";
}
