package com.health360.icu.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class IcuUnitResponse {
    UUID unitId;
    UUID hospitalId;
    UUID branchId;
    String name;
    String code;
    boolean active;
}
