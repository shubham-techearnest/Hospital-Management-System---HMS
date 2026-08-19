package com.health360.billing.presentation.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class CreateInvoiceRequest {

    @NotNull
    private UUID encounterId;

    @DecimalMin(value = "0.00")
    private BigDecimal taxAmount;

    @Size(max = 2000)
    private String notes;

    @NotEmpty
    @Valid
    private List<CreateInvoiceLineItemRequest> lineItems;
}
