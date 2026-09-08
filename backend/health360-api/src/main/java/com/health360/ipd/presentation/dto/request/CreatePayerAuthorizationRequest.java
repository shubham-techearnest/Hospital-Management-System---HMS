package com.health360.ipd.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class CreatePayerAuthorizationRequest {

    private UUID payerId;

    @NotBlank
    @Size(max = 30)
    private String authType;

    @Size(max = 100)
    private String authNumber;

    private BigDecimal approvedAmount;

    @Size(max = 2000)
    private String notes;
}
