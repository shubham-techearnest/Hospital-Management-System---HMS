package com.health360.iam.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class ImpersonationContextResponse {
    UUID sessionId;
    String environmentLabel;
    Instant startedAt;
    Instant expiresAt;
    String reason;
    ImpersonationPartyResponse actor;
    ImpersonationPartyResponse subject;
}
