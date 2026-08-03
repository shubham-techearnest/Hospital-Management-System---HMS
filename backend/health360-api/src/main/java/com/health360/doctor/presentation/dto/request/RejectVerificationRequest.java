package com.health360.doctor.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Value;

@Value
public class RejectVerificationRequest {
    @NotBlank
    @Size(max = 1000)
    String reason;
}
