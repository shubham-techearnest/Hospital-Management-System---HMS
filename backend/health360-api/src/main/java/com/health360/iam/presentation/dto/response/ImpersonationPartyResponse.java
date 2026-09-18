package com.health360.iam.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.List;
import java.util.UUID;

@Value
@Builder
public class ImpersonationPartyResponse {
    UUID id;
    String email;
    String firstName;
    String lastName;
    List<String> roles;
}
