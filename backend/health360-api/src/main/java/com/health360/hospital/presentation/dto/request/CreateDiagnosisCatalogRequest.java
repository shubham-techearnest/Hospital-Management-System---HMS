package com.health360.hospital.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateDiagnosisCatalogRequest {

    @NotNull
    private UUID hospitalId;

    private UUID branchId;

    @NotBlank
    @Size(max = 50)
    private String icdCode;

    @NotBlank
    @Size(max = 500)
    private String name;

    @Size(max = 100)
    private String category;
}
