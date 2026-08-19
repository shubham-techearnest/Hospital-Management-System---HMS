package com.health360.laboratory.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class LaboratoryResponse {
    UUID laboratoryId;
    UUID hospitalId;
    UUID branchId;
    String name;
    String code;
    boolean active;
}
