package com.health360.icu.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class IcuDischargeResponse {
    UUID stayId;
    UUID encounterId;
    String summaryText;
    String followUpPlan;
    String stayStatus;
    String encounterStatus;
    Instant dischargedAt;
}
