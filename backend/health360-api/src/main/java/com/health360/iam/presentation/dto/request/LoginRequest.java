package com.health360.iam.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    /**
     * Login identifier: email address <strong>or</strong> mobile number.
     * Field name kept as {@code email} for API compatibility with existing clients.
     */
    @NotBlank
    private String email;

    @NotBlank
    private String password;

    private String deviceInfo;
}
