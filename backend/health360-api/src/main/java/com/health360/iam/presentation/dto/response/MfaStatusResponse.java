package com.health360.iam.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class MfaStatusResponse {
    boolean enabled;
    boolean setupPending;
}
