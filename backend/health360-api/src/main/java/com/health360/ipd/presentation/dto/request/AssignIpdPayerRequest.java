package com.health360.ipd.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AssignIpdPayerRequest {

    @NotBlank
    @Size(max = 30)
    private String payerMode;

    @Size(max = 200)
    private String payerName;

    @Size(max = 100)
    private String policyNumber;

    @Size(max = 100)
    private String memberId;

    @Size(max = 30)
    private String claimMode;

    private Boolean primaryPayer = true;

    @Size(max = 2000)
    private String notes;
}
