package com.health360.iam.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MfaVerifyRequest {

    @NotBlank
    private String mfaToken;

    @NotBlank
    private String code;

    private String deviceInfo;
}
