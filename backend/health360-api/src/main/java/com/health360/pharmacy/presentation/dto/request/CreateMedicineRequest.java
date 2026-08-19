package com.health360.pharmacy.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateMedicineRequest {

    @NotNull
    private UUID hospitalId;

    @NotNull
    private UUID branchId;

    @NotBlank
    @Size(max = 30)
    private String code;

    @NotBlank
    @Size(max = 200)
    private String name;

    @Size(max = 30)
    private String form;

    @Size(max = 50)
    private String strength;

    @Size(max = 30)
    private String defaultRoute;
}
