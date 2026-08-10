package com.health360.subscription.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangeHospitalPlanRequest {

    @NotBlank
    @Size(max = 50)
    private String planCode;

    @Size(max = 500)
    private String notes;
}
