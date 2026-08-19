package com.health360.radiology.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateImagingModalityRequest {

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

    @Size(max = 20)
    private String modalityType;
}
