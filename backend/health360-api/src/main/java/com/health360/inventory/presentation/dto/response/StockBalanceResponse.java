package com.health360.inventory.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Value
@Builder
public class StockBalanceResponse {
    UUID id;
    UUID itemId;
    String itemCode;
    String itemName;
    UUID locationId;
    String locationCode;
    String locationName;
    String lotNumber;
    LocalDate expiryDate;
    Integer quantityOnHand;
    BigDecimal unitCost;
    Integer reorderLevel;
    boolean lowStock;
}
