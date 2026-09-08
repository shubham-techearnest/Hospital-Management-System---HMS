package com.health360.ipd.presentation.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateIpdChargeEventRequest {

    @NotBlank
    @Size(max = 30)
    private String chargeType;

    @NotBlank
    @Size(max = 500)
    private String description;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal quantity = BigDecimal.ONE;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal unitPrice;

    private LocalDate serviceDate;

    @Size(max = 2000)
    private String notes;
}
