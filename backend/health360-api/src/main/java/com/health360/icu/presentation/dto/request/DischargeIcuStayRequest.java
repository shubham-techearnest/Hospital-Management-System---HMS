package com.health360.icu.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DischargeIcuStayRequest {

    @NotBlank
    @Size(max = 5000)
    private String summaryText;

    @Size(max = 2000)
    private String followUpPlan;
}
