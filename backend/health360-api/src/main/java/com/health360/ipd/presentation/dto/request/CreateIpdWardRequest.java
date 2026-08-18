package com.health360.ipd.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateIpdWardRequest {

    @NotNull
    private UUID hospitalId;

    @NotNull
    private UUID branchId;

    private UUID departmentId;

    @NotBlank
    private String name;

    @NotBlank
    private String code;

    private String wardType = "GENERAL";
}
