package com.health360.ipd.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class IpdDischargeResponse {
    UUID dischargeSummaryId;
    UUID admissionId;
    UUID encounterId;
    String summaryText;
    String followUpPlan;
    Instant dischargedAt;
    String admissionStatus;
    String encounterStatus;
}
