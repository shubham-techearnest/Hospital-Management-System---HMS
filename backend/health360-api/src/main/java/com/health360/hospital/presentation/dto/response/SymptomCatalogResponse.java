package com.health360.hospital.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class SymptomCatalogResponse {
    UUID symptomId;
    UUID hospitalId;
    UUID branchId;
    String code;
    String name;
    String category;
    boolean active;
}
