package com.health360.iam.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class MfaSetupResponse {
    String secret;
    String otpAuthUri;
    String issuer;
}
