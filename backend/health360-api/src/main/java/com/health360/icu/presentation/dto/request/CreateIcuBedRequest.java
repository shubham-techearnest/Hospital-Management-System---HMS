package com.health360.icu.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateIcuBedRequest {

    @NotNull
    private UUID unitId;

    @NotBlank
    @Size(max = 20)
    private String bedNumber;
}
