package com.health360.iam.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.List;
import java.util.UUID;

@Value
@Builder
public class UserProfileResponse {
    UUID id;
    String email;
    String firstName;
    String lastName;
    String phone;
    String avatarUrl;
    List<String> roles;
    List<String> permissions;
    String status;
    boolean emailVerified;
    String timezone;
    String locale;
}
