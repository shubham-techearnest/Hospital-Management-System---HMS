package com.health360.ipd.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateIpdRoundRequest {

    @NotBlank
    private String roundType = "DOCTOR";

    @NotBlank
    private String notes;
}
