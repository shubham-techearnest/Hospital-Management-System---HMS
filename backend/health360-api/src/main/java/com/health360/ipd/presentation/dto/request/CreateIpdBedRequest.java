package com.health360.ipd.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateIpdBedRequest {

    @NotNull
    private UUID roomId;

    @NotBlank
    private String bedNumber;
}
