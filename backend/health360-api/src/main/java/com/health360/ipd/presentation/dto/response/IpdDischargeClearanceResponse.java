package com.health360.ipd.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class IpdDischargeClearanceResponse {
    UUID clearanceId;
    UUID admissionId;
    String clearanceType;
    String status;
    Instant clearedAt;
    UUID clearedBy;
    String notes;
}
