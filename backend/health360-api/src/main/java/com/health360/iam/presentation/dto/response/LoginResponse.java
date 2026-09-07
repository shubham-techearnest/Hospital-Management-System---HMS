package com.health360.iam.presentation.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LoginResponse {
    boolean mfaRequired;
    String mfaToken;
    String accessToken;
    String refreshToken;
    Long expiresIn;
    String tokenType;
    UserProfileResponse user;

    public static LoginResponse tokens(AuthTokenResponse tokens) {
        return LoginResponse.builder()
                .mfaRequired(false)
                .accessToken(tokens.getAccessToken())
                .refreshToken(tokens.getRefreshToken())
                .expiresIn(tokens.getExpiresIn())
                .tokenType(tokens.getTokenType())
                .user(tokens.getUser())
                .build();
    }

    public static LoginResponse mfaChallenge(String mfaToken) {
        return LoginResponse.builder()
                .mfaRequired(true)
                .mfaToken(mfaToken)
                .build();
    }
}
