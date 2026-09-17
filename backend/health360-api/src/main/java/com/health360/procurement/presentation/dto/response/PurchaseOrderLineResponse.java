package com.health360.procurement.presentation.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
public class PurchaseOrderLineResponse {

    private UUID id;
    private UUID inventoryItemId;
    private String itemCode;
    private String itemName;
    private Integer quantityOrdered;
    private Integer quantityReceived;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;
}
