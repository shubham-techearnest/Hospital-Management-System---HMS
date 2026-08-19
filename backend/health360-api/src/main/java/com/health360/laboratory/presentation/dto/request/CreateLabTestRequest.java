package com.health360.laboratory.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateLabTestRequest {

    @NotNull
    private UUID laboratoryId;

    @NotBlank
    @Size(max = 30)
    private String code;

    @NotBlank
    @Size(max = 200)
    private String name;

    private String specimenType;
}
