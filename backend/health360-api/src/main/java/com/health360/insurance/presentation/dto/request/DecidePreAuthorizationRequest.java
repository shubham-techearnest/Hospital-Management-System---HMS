package com.health360.insurance.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class DecidePreAuthorizationRequest {

    @NotBlank
    @Size(max = 30)
    private String decision;

    private BigDecimal approvedAmount;

    @Size(max = 2000)
    private String decisionNotes;
}
