package com.health360.icu.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateIcuEquipmentRequest {

    @NotNull
    private UUID hospitalId;

    @NotNull
    private UUID branchId;

    private UUID unitId;

    @NotBlank
    @Size(max = 100)
    private String name;

    @NotBlank
    @Size(max = 30)
    private String code;

    private String equipmentType;
}
