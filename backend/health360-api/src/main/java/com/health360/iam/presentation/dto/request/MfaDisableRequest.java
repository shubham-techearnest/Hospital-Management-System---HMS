package com.health360.iam.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MfaDisableRequest {

    @NotBlank
    private String password;

    @NotBlank
    private String code;
}
