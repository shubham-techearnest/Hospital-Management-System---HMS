package com.health360.icu.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class AssignIcuEquipmentRequest {

    @NotNull
    private UUID stayId;

    @Size(max = 500)
    private String notes;
}
