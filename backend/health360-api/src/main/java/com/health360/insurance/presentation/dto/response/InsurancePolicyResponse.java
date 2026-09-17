package com.health360.insurance.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Value
@Builder
public class InsurancePolicyResponse {
    UUID policyId;
    UUID hospitalId;
    UUID branchId;
    UUID patientId;
    UUID payerId;
    String payerName;
    String policyNumber;
    String memberId;
    String holderName;
    String claimMode;
    String status;
    LocalDate validFrom;
    LocalDate validTo;
    BigDecimal coverageLimit;
    String notes;
}
