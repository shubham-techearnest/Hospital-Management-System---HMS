package com.health360.iam.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class ImpersonationStartResponse {
    String accessToken;
    String refreshToken;
    long expiresIn;
    String tokenType;
    UserProfileResponse user;
    ImpersonationContextResponse impersonation;
}
