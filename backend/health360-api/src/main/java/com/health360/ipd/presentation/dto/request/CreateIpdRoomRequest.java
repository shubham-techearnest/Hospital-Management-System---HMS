package com.health360.ipd.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateIpdRoomRequest {

    @NotNull
    private UUID wardId;

    @NotBlank
    private String name;

    @NotBlank
    private String code;
}
