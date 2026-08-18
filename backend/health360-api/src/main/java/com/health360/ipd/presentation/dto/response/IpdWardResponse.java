package com.health360.ipd.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class IpdWardResponse {
    UUID wardId;
    UUID hospitalId;
    UUID branchId;
    UUID departmentId;
    String name;
    String code;
    String wardType;
    boolean active;
}
