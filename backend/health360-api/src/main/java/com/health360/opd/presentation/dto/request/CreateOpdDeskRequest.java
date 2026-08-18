package com.health360.opd.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateOpdDeskRequest {

    @NotNull
    private UUID hospitalId;

    @NotNull
    private UUID branchId;

    private UUID departmentId;

    @NotBlank
    @Size(max = 100)
    private String name;

    @NotBlank
    @Size(max = 20)
    private String code;

    private Boolean active = true;
}
