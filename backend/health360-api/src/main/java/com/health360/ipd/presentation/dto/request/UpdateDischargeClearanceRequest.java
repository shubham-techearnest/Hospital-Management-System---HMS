package com.health360.ipd.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateDischargeClearanceRequest {
    @NotBlank
    @Size(max = 30)
    private String clearanceType;

    @NotBlank
    @Size(max = 30)
    private String status;

    @Size(max = 4000)
    private String notes;
}
