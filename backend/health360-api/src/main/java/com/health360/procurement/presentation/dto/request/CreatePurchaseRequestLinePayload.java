package com.health360.procurement.presentation.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
public class CreatePurchaseRequestLinePayload {

    private UUID inventoryItemId;

    @NotBlank
    private String itemCode;

    @NotBlank
    private String itemName;

    @NotNull
    @Min(1)
    private Integer quantity;

    private String unitOfMeasure;

    private BigDecimal unitPrice;
}
