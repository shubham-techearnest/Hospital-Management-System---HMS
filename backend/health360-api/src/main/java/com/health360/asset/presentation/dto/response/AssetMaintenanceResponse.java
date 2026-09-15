package com.health360.asset.presentation.dto.response;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class AssetMaintenanceResponse {
    UUID maintenanceId;
    UUID assetId;
    String maintenanceType;
    Instant performedAt;
    UUID performedBy;
    String notes;
    Instant nextDueAt;
    BigDecimal costAmount;
}
