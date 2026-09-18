package com.health360.iam.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class ImpersonationCapabilityResponse {
    boolean enabled;
    String environmentLabel;
    long maxDurationMinutes;
}
