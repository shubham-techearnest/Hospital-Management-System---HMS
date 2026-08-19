package com.health360.pharmacy.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class MedicineResponse {
    UUID medicineId;
    UUID hospitalId;
    UUID branchId;
    String code;
    String name;
    String form;
    String strength;
    String defaultRoute;
    boolean active;
}
