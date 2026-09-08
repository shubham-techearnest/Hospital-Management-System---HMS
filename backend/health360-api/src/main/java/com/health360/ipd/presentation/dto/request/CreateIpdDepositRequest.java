package com.health360.ipd.presentation.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateIpdDepositRequest {

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal amount;

    @Size(max = 30)
    private String paymentMethod = "CASH";

    @Size(max = 2000)
    private String notes;
}
