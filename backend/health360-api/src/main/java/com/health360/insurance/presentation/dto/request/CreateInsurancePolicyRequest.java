package com.health360.insurance.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class CreateInsurancePolicyRequest {

    @NotNull
    private UUID hospitalId;

    @NotNull
    private UUID branchId;

    @NotNull
    private UUID patientId;

    @NotNull
    private UUID payerId;

    @NotBlank
    @Size(max = 80)
    private String policyNumber;

    @Size(max = 80)
    private String memberId;

    @Size(max = 200)
    private String holderName;

    @Size(max = 30)
    private String claimMode;

    private LocalDate validFrom;
    private LocalDate validTo;
    private BigDecimal coverageLimit;

    @Size(max = 2000)
    private String notes;
}
