package com.health360.laboratory.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateLabTestParameterRequest {

    @NotNull
    private UUID labTestId;

    @NotBlank
    @Size(max = 30)
    private String code;

    @NotBlank
    @Size(max = 100)
    private String name;

    @Size(max = 30)
    private String unit;

    @Size(max = 100)
    private String referenceRange;
}
