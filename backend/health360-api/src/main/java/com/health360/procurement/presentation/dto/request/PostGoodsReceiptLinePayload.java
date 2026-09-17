package com.health360.procurement.presentation.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class PostGoodsReceiptLinePayload {

    @NotNull
    private UUID purchaseOrderLineId;

    @NotNull
    @Min(1)
    private Integer quantityReceived;

    private String lotNumber;

    private LocalDate expiryDate;

    private BigDecimal unitCost;
}
