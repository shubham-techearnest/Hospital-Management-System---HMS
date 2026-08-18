package com.health360.ipd.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DischargeIpdPatientRequest {

    @NotBlank
    private String summaryText;

    private String followUpPlan;
}
