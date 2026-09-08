package com.health360.ipd.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ApplyIpdServicePresetRequest {

    @NotBlank
    @Size(max = 40)
    private String presetCode;
}
