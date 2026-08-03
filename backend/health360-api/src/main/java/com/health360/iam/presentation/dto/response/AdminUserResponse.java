package com.health360.iam.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Value
@Builder
public class AdminUserResponse {
    UUID id;
    String email;
    String firstName;
    String lastName;
    String phone;
    String status;
    boolean emailVerified;
    List<String> roles;
    Instant createdAt;
    Instant updatedAt;
}
