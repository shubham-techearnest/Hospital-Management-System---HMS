package com.health360.iam.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterDeviceTokenRequest(
        @NotBlank @Size(max = 255) String expoPushToken,
        @NotBlank @Size(max = 20) String platform,
        @Size(max = 100) String deviceId) {}
