package com.health360.billing.presentation.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CreateInvoiceLineItemRequest {

    @NotBlank
    @Size(max = 500)
    private String description;

    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal quantity;

    @NotNull
    @DecimalMin(value = "0.00")
    private BigDecimal unitPrice;

    @Size(max = 30)
    private String sourceType;

    private java.util.UUID sourceId;
}
