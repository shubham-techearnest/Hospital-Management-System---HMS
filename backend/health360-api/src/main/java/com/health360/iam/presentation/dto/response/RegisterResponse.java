package com.health360.iam.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class RegisterResponse {
    UUID userId;
    String email;
    String status;
    String message;
}
