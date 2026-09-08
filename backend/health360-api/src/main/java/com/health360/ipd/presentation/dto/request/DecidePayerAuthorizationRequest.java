package com.health360.ipd.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class DecidePayerAuthorizationRequest {

    @NotBlank
    @Size(max = 30)
    private String status;

    @Size(max = 100)
    private String authNumber;

    private BigDecimal approvedAmount;

    @Size(max = 2000)
    private String notes;
}
