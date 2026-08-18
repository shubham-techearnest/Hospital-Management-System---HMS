package com.health360.opd.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class OpdDeskResponse {
    UUID deskId;
    UUID hospitalId;
    UUID branchId;
    UUID departmentId;
    String name;
    String code;
    boolean active;
}
