package com.health360.ipd.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class IpdFinancialClearanceResponse {
    UUID clearanceId;
    UUID admissionId;
    String status;
    Instant clearedAt;
    UUID clearedBy;
    String notes;
}
