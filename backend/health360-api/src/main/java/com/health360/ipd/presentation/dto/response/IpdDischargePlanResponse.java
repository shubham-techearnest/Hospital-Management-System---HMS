package com.health360.ipd.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class IpdDischargePlanResponse {
    UUID planId;
    UUID admissionId;
    Instant expectedDischargeAt;
    String readiness;
    String pendingResultsJson;
    String barriers;
    String notes;
}
