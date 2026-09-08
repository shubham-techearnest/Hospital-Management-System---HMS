package com.health360.ipd.presentation.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateBloodRequestPayload {

    @NotBlank
    @Size(max = 40)
    private String productType;

    @Min(1)
    private int units = 1;

    @Size(max = 20)
    private String urgency = "ROUTINE";

    @Size(max = 2000)
    private String indication;

    @Size(max = 2000)
    private String notes;
}
