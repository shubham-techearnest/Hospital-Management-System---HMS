package com.health360.insurance.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
public class CreatePreAuthorizationRequest {

    @NotNull
    private UUID policyId;

    private UUID encounterId;
    private UUID admissionId;

    @Size(max = 30)
    private String authType;

    private BigDecimal requestedAmount;

    @Size(max = 2000)
    private String notes;
}
