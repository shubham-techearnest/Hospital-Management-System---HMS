package com.health360.procurement.presentation.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Builder
public class GoodsReceiptLineResponse {

    private UUID id;
    private UUID purchaseOrderLineId;
    private UUID inventoryItemId;
    private Integer quantityReceived;
    private String lotNumber;
    private LocalDate expiryDate;
    private BigDecimal unitCost;
}
