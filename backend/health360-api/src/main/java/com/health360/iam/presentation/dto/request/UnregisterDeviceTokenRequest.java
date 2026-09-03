package com.health360.iam.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UnregisterDeviceTokenRequest(@NotBlank @Size(max = 255) String expoPushToken) {}
