package com.health360.ipd.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateIpdBedStatusRequest {

    @NotBlank
    @Size(max = 20)
    private String status;

    @Size(max = 500)
    private String reason;
}
