package com.health360.asset.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class AssetMaintenanceScheduleResponse {
    UUID scheduleId;
    UUID assetId;
    String scheduleType;
    String cadence;
    Integer intervalDays;
    Instant nextDueAt;
    Instant lastGeneratedAt;
    boolean active;
    String notes;
}
