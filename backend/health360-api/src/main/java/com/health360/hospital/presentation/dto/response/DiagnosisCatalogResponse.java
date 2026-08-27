package com.health360.hospital.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class DiagnosisCatalogResponse {
    UUID diagnosisCatalogId;
    UUID hospitalId;
    UUID branchId;
    String icdCode;
    String name;
    String category;
    boolean active;
}
