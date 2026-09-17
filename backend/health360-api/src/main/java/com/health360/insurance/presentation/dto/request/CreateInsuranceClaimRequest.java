package com.health360.insurance.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
public class CreateInsuranceClaimRequest {

    @NotNull
    private UUID policyId;

    private UUID preAuthorizationId;
    private UUID encounterId;
    private UUID admissionId;
    private UUID invoiceId;

    @NotNull
    private BigDecimal claimedAmount;

    @Size(max = 2000)
    private String notes;
}
