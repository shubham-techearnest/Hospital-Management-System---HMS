package com.health360.insurance.presentation.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class DecideInsuranceClaimRequest {

    /** APPROVED | REJECTED | SETTLED */
    @Size(max = 30)
    private String decision;

    private BigDecimal approvedAmount;
    private BigDecimal settledAmount;

    @Size(max = 2000)
    private String notes;
}
