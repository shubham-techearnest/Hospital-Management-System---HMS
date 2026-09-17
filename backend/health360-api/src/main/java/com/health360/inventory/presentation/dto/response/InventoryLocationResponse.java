package com.health360.inventory.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class InventoryLocationResponse {
    UUID id;
    UUID hospitalId;
    UUID branchId;
    String code;
    String name;
    String locationType;
    UUID departmentId;
    boolean active;
}
