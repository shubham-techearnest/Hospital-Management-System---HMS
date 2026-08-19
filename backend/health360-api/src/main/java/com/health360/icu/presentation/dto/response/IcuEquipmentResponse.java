package com.health360.icu.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class IcuEquipmentResponse {
    UUID equipmentId;
    UUID hospitalId;
    UUID branchId;
    UUID unitId;
    String name;
    String code;
    String equipmentType;
    String status;
}
