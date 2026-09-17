package com.health360.inventory.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class InventoryItemResponse {
    UUID id;
    UUID hospitalId;
    UUID branchId;
    String code;
    String name;
    String category;
    String unitOfMeasure;
    Integer reorderLevel;
    boolean trackExpiry;
    boolean active;
    Integer quantityOnHand;
}
